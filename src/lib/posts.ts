import config from "@payload-config";
import { getPayload } from "payload";
import type { Payload, Where } from "payload";
import { getLocale } from "next-intl/server";
import { mediaUrl } from "./homeBlockTypes";
import { tenantContentWhere } from "./tenantContentWhere";
import { getRequestTenant } from "./tenantContent";
import { getPostTranslations, SOURCE_LOCALE } from "./postTranslations";

/**
 * The syndication clause for whichever site is being rendered. The listings
 * used to carry no clause at all, which meant amintl.org/news showed every
 * country's articles whether or not they had been shared with the main site —
 * the share settings only took effect on the homepage feeds. Now the listing
 * honours them too.
 *
 * Article pages themselves are deliberately left reachable by direct link: an
 * article that is not listed here is unlisted, not private, and 404-ing one
 * would break links already sent out.
 */
function syndicationWhere(): Where {
  return tenantContentWhere(getRequestTenant() ?? undefined);
}

/**
 * An article with no picture is left out of the listings.
 *
 * The archive gave back what it had — the rest are pieces that ran as text on
 * the old site, mostly short event notices and devotionals, and a card with
 * nothing in its frame is worse than no card. They keep their own pages and
 * stay reachable by direct link, the same way an unsyndicated article does.
 *
 * Remove this clause to show them again; nothing else depends on it.
 */
const HAS_PICTURE: Where = { coverImage: { exists: true } };

/** Combines the syndication clause with a listing's own filter, if any. */
function scoped(filter?: Where): Where {
  const where = syndicationWhere();
  return { and: filter ? [where, HAS_PICTURE, filter] : [where, HAS_PICTURE] };
}

export type PostCategory = "news" | "editorial" | "photo-news" | "testimony";

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  category: PostCategory;
  publishedDate: string;
  excerpt?: string;
  coverImage?: string;
};

export type PostDetail = PostSummary & {
  body?: unknown;
};

function toSummary(doc: Record<string, unknown>): PostSummary {
  return {
    id: String(doc.id),
    title: doc.title as string,
    slug: doc.slug as string,
    category: (doc.category as PostCategory) ?? "news",
    publishedDate: doc.publishedDate as string,
    excerpt: (doc.excerpt as string) ?? undefined,
    coverImage: mediaUrl(doc.coverImage as { url?: string } | string | undefined),
  };
}

/**
 * The language this page is being read in.
 *
 * Every article surface goes through here rather than reading the locale
 * itself, so a caller outside a request — a script, a build-time helper —
 * degrades to the language articles are written in instead of throwing.
 */
async function readingLocale(): Promise<string> {
  try {
    return (await getLocale()) || SOURCE_LOCALE;
  } catch {
    return SOURCE_LOCALE;
  }
}

/**
 * Article summaries in the language being read.
 *
 * One lookup for the whole page rather than one per article, and anything with
 * no translation keeps the words it was written in — so a half-translated
 * catalogue reads as a mix rather than as a page of blanks.
 */
async function summariesIn(
  payload: Payload,
  docs: Record<string, unknown>[],
): Promise<PostSummary[]> {
  const summaries = docs.map(toSummary);
  const locale = await readingLocale();
  if (locale === SOURCE_LOCALE || summaries.length === 0) return summaries;

  const translations = await getPostTranslations(
    payload,
    summaries.map((post) => post.id),
    locale,
  );
  if (translations.size === 0) return summaries;

  return summaries.map((post) => {
    const translated = translations.get(post.id);
    if (!translated) return post;
    return {
      ...post,
      title: translated.title ?? post.title,
      excerpt: translated.excerpt ?? post.excerpt,
    };
  });
}

export async function getPostsList(category?: PostCategory): Promise<PostSummary[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      sort: "-publishedDate",
      limit: 24,
      where: scoped(category ? { category: { equals: category } } : undefined),
    });
    return await summariesIn(payload, result.docs as Record<string, unknown>[]);
  } catch {
    return [];
  }
}

/** Sort orders the listings offer, mapped to Payload's sort syntax. */
export const POST_SORTS = { newest: "-publishedDate", oldest: "publishedDate" } as const;
export type PostSort = keyof typeof POST_SORTS;

export type PostsPage = {
  posts: PostSummary[];
  /** 1-based, already clamped to the number of pages that exist. */
  page: number;
  totalPages: number;
  total: number;
};

/**
 * One page of a listing.
 *
 * Separate from getPostsList, which the home page feeds still use to take the
 * newest few — they want a fixed handful, not a page of a paginated set.
 *
 * Payload counts the whole filtered set for us, so the page count comes back
 * without a second query.
 */
export async function getPostsPage(
  category: PostCategory | undefined,
  { sort = "newest", page = 1, perPage = 12 }: { sort?: PostSort; page?: number; perPage?: number } = {},
): Promise<PostsPage> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      sort: POST_SORTS[sort] ?? POST_SORTS.newest,
      limit: perPage,
      page,
      where: scoped(category ? { category: { equals: category } } : undefined),
    });
    return {
      posts: await summariesIn(payload, result.docs as Record<string, unknown>[]),
      page: result.page ?? 1,
      totalPages: result.totalPages ?? 1,
      total: result.totalDocs ?? 0,
    };
  } catch {
    return { posts: [], page: 1, totalPages: 1, total: 0 };
  }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const doc = result.docs[0] as Record<string, unknown> | undefined;
    if (!doc) return null;

    const summary = toSummary(doc);
    const locale = await readingLocale();
    if (locale === SOURCE_LOCALE) return { ...summary, body: doc.body };

    // The body as well as the headline here — this is the one surface that
    // shows the article itself, and a translated headline over English prose
    // would be worse than leaving both alone.
    const translated = (await getPostTranslations(payload, [summary.id], locale)).get(summary.id);
    return {
      ...summary,
      title: translated?.title ?? summary.title,
      excerpt: translated?.excerpt ?? summary.excerpt,
      body: translated?.body ?? doc.body,
    };
  } catch {
    return null;
  }
}

export async function getRelatedPosts(category: PostCategory, excludeSlug: string): Promise<PostSummary[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      where: scoped({
        and: [{ category: { equals: category } }, { slug: { not_equals: excludeSlug } }],
      }),
      sort: "-publishedDate",
      limit: 4,
    });
    return await summariesIn(payload, result.docs as Record<string, unknown>[]);
  } catch {
    return [];
  }
}
