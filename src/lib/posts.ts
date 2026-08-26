import config from "@payload-config";
import { getPayload } from "payload";
import type { Where } from "payload";
import { mediaUrl } from "./homeBlockTypes";
import { tenantContentWhere } from "./tenantContentWhere";
import { getRequestTenant } from "./tenantContent";

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

/** Combines the syndication clause with a listing's own filter, if any. */
function scoped(filter?: Where): Where {
  const where = syndicationWhere();
  return filter ? { and: [where, filter] } : where;
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

export async function getPostsList(category?: PostCategory): Promise<PostSummary[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      sort: "-publishedDate",
      limit: 24,
      where: scoped(category ? { category: { equals: category } } : undefined),
    });
    return result.docs.map((doc) => toSummary(doc as Record<string, unknown>));
  } catch {
    return [];
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
    return { ...toSummary(doc), body: doc.body };
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
    return result.docs.map((doc) => toSummary(doc as Record<string, unknown>));
  } catch {
    return [];
  }
}
