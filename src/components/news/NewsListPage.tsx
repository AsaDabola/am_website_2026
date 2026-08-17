import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import NewsSubNav from "@/components/news/NewsSubNav";
import ArticleCard from "@/components/news/ArticleCard";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getPostsList, type PostCategory } from "@/lib/posts";

const categoryTag: Record<PostCategory, string> = {
  news: "News",
  editorial: "Editorial",
  "photo-news": "Photo News",
  testimony: "Testimony",
};

export default async function NewsListPage({
  active,
  title,
  heading,
  eyebrow,
  category,
}: {
  active: string;
  title: string;
  heading: string;
  eyebrow: string;
  category?: PostCategory;
}) {
  const posts = await getPostsList(category);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }, { label: title }]}
        title="News"
        subtitle="What students are seeing, where AM is going next, and how to pray."
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

          {posts.length > 0 ? (
            <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  href={`/news/${post.slug}`}
                  image={post.coverImage}
                  tag={categoryTag[post.category]}
                  title={post.title}
                  date={dateFormatter.format(new Date(post.publishedDate))}
                />
              ))}
            </div>
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
