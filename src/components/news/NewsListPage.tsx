import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import NewsSubNav from "@/components/news/NewsSubNav";
import ArticleCard from "@/components/news/ArticleCard";
import { ListingControls, Pagination } from "@/components/news/ListingControls";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getPostsPage, POST_SORTS, type PostCategory, type PostSort } from "@/lib/posts";

const categoryTag: Record<PostCategory, string> = {
  news: "News",
  editorial: "Editorial",
  "photo-news": "Photo News",
  testimony: "Testimony",
};

/** Search params arrive as strings or arrays; this reads one safely. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewsListPage({
  active,
  title,
  heading,
  eyebrow,
  category,
  heroTitle = "News",
  heroSubtitle = "What students are seeing, where AM is going next, and how to pray.",
  backgroundImage = "/images/news-hero.webp",
  searchParams,
}: {
  active: string;
  title: string;
  heading: string;
  eyebrow: string;
  category?: PostCategory;
  /** The design gives each listing its own hero line. */
  heroTitle?: string;
  heroSubtitle?: string;
  /**
   * The design draws a banner per category. Editorial and Photo News have no
   * design of their own, so they take the News one rather than falling back to
   * the site-wide About banner and reading as a different section.
   */
  backgroundImage?: string;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const sortParam = first(params.sort);
  const sort: PostSort = sortParam === "oldest" ? "oldest" : "newest";
  const perPage = [12, 24, 48].includes(Number(first(params.per)))
    ? Number(first(params.per))
    : 12;
  const requested = Math.max(1, Number(first(params.page)) || 1);

  const { posts, page, totalPages, total } = await getPostsPage(category, {
    sort,
    page: requested,
    perPage,
  });

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }, { label: title }]}
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImage={backgroundImage}
      />
      <NewsSubNav active={active} />

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {heading}
          </h1>

          {total > 0 && (
            <ListingControls base={active} sort={sort} perPage={perPage} total={total} />
          )}

          {posts.length > 0 ? (
            <>
              <div className="mt-10 grid gap-10 text-start sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    href={`/news/${post.slug}`}
                    image={post.coverImage}
                    tag={categoryTag[post.category]}
                    title={post.title}
                  />
                ))}
              </div>

              <Pagination
                base={active}
                sort={sort}
                perPage={perPage}
                page={page}
                totalPages={totalPages}
              />
            </>
          ) : (
            <p className="mx-auto mt-14 max-w-md text-base leading-relaxed text-ink-muted">
              No stories here yet — check back soon.
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
