import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import NewsSubNav from "@/components/news/NewsSubNav";
import ArticleCard from "@/components/news/ArticleCard";
import { ListingControls, Pagination } from "@/components/news/ListingControls";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getTranslations } from "@/i18n/content";
import { getPostsPage, POST_SORTS, type PostCategory, type PostSort } from "@/lib/posts";

/** Search params arrive as strings or arrays; this reads one safely. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Where each listing's own wording lives, and the path it is served at. */
const LISTINGS: Record<PostCategory, { key: string; href: string; image: string }> = {
  news: { key: "news", href: "/news", image: "/images/news-hero.webp" },
  editorial: { key: "editorial", href: "/news/editorial", image: "/images/news-hero.webp" },
  // The design draws a banner per category; Editorial and Photo News have none
  // of their own, so they take the News one rather than falling back to the
  // site-wide About banner and reading as a different section.
  "photo-news": { key: "photoNews", href: "/news/photo-news", image: "/images/news-hero.webp" },
  testimony: { key: "testimony", href: "/news/testimony", image: "/images/hero-night-sky.webp" },
};

/**
 * One of the four news listings.
 *
 * Every word on the page is read here, through the country-aware translator,
 * rather than handed in as a string by the route — the routes were passing
 * English titles and headings straight into the markup, so a country site
 * showed "Photo News" in English however well its own catalogue was
 * translated. The route now says only which listing it is.
 */
export default async function NewsListPage({
  category,
  searchParams,
}: {
  category: PostCategory;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const sortParam = first(params.sort);
  const sort: PostSort = sortParam === "oldest" ? "oldest" : "newest";
  const perPage = [12, 24, 48].includes(Number(first(params.per)))
    ? Number(first(params.per))
    : 12;
  const requested = Math.max(1, Number(first(params.page)) || 1);

  const listing = LISTINGS[category];
  const t = await getTranslations("NewsListings");
  const tabs = await getTranslations("NewsSubNav");

  const { posts, page, totalPages, total } = await getPostsPage(category, {
    sort,
    page: requested,
    perPage,
  });

  const title = t(`${listing.key}.title`);

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: tabs("news") }, { label: title }]}
        title={t(`${listing.key}.heroTitle`)}
        subtitle={t(`${listing.key}.heroSubtitle`) || undefined}
        backgroundImage={listing.image}
      />
      <NewsSubNav active={listing.href} />

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
          </div>
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {title}
          </h1>

          {total > 0 && (
            <ListingControls
              base={listing.href}
              sort={sort}
              perPage={perPage}
              labels={{
                count: t("storyCount", { count: total }),
                sort: t("sort"),
                newest: t("newest"),
                oldest: t("oldest"),
                show: t("show"),
                previous: t("previous"),
                next: t("next"),
              }}
            />
          )}

          {posts.length > 0 ? (
            <>
              <div className="mt-10 grid gap-10 text-start sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    href={`/news/${post.slug}`}
                    image={post.coverImage}
                    tag={tabs(LISTINGS[post.category].key)}
                    title={post.title}
                  />
                ))}
              </div>

              <Pagination
                base={listing.href}
                sort={sort}
                perPage={perPage}
                page={page}
                totalPages={totalPages}
                labels={{ previous: t("previous"), next: t("next") }}
              />
            </>
          ) : (
            <p className="mx-auto mt-14 max-w-md text-base leading-relaxed text-ink-muted">
              {t("emptyStories")}
            </p>
          )}
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

/** Re-exported so callers do not need a second import to name a sort. */
export { POST_SORTS };
