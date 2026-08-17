import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import NewsSubNav from "@/components/news/NewsSubNav";
import ArticleCard from "@/components/news/ArticleCard";
import ShareButtons from "@/components/news/ShareButtons";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";

export const revalidate = 60;

const categoryTag: Record<string, string> = {
  news: "News",
  editorial: "Editorial",
  "photo-news": "Photo News",
  testimony: "Testimony",
};

const categoryHref: Record<string, string> = {
  news: "/news",
  editorial: "/news/editorial",
  "photo-news": "/news/photo-news",
  testimony: "/news/testimony",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | AM International`,
    description: post.excerpt,
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.category, post.slug);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const url = `https://amintl.org/news/${post.slug}`;

  return (
    <>
      <NewsSubNav active={categoryHref[post.category] ?? "/news"} />

      <article className="bg-white py-16">
        <Container className="max-w-[720px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-ink-muted">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/news" className="hover:text-ink">
                  News
                </Link>
              </li>
              <span className="opacity-50">/</span>
              <li>{categoryTag[post.category]}</li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
            {categoryTag[post.category]}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-ink-muted">
            {dateFormatter.format(new Date(post.publishedDate))}
          </p>
          {post.excerpt && (
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>
          )}

          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
              <Image src={post.coverImage} alt="" fill className="object-cover" sizes="720px" />
            </div>
          )}

          {post.body ? (
            <RichText
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={post.body as any}
              className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:tracking-[-0.02em] prose-a:text-brand-blue"
            />
          ) : null}

          <div className="mt-12 flex items-center justify-between border-t border-black/10 pt-8">
            <span className="text-sm font-semibold text-ink">Share this story</span>
            <ShareButtons title={post.title} url={url} />
          </div>
        </Container>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-mist py-20">
          <Container>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
              More {categoryTag[post.category]}
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPosts.map((related) => (
                <ArticleCard
                  key={related.id}
                  href={`/news/${related.slug}`}
                  image={related.coverImage}
                  tag={categoryTag[related.category]}
                  title={related.title}
                  date={dateFormatter.format(new Date(related.publishedDate))}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
