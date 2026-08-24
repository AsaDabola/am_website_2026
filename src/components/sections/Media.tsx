import { getLocale } from "next-intl/server";
import { getTranslations } from "@/i18n/content";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import VideoPlayer from "@/components/sections/VideoPlayer";
import { SentSwooshWatermarkIcon } from "@/components/ui/icons";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";
import { tenantContentWhere } from "@/lib/tenantContentWhere";
import type { MediaSectionData } from "@/lib/homeBlockTypes";

type PostItem = { title: string; date: string };

async function getDefaultPosts(): Promise<PostItem[]> {
  const t = await getTranslations("Home.Media");
  return [
    { title: t("post1Title"), date: t("post1Date") },
    { title: t("post2Title"), date: t("post2Date") },
    { title: t("post3Title"), date: t("post3Date") },
    { title: t("post4Title"), date: t("post4Date") },
  ];
}

async function getPosts(tenantId?: string): Promise<PostItem[]> {
  const [defaultPosts, locale] = await Promise.all([getDefaultPosts(), getLocale()]);

  const docs = await fetchCollectionSafely(async (payload) => {
    const result = await payload.find({
      collection: "posts",
      sort: "-publishedDate",
      limit: 4,
      where: tenantContentWhere(tenantId),
    });
    return result.docs;
  });

  if (!docs) return defaultPosts;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return docs.map((doc) => ({
    title: doc.title,
    date: dateFormatter.format(new Date(doc.publishedDate)),
  }));
}

export default async function Media({
  tenantId,
  data,
}: { tenantId?: string; data?: MediaSectionData } = {}) {
  const [posts, t] = await Promise.all([getPosts(tenantId), getTranslations("Home.Media")]);

  return (
    <section
      className="relative overflow-hidden py-24"
      style={{ backgroundImage: "linear-gradient(120deg, #1449c6, #007aff)" }}
    >
      {/* Watermark geometry comes straight from the design: 817 x 363 at
          -6.116deg, overlapping the heading rather than tucked into the
          corner. */}
      <SentSwooshWatermarkIcon className="pointer-events-none absolute start-[34%] top-16 hidden h-[363px] w-[817px] -rotate-[6.116deg] select-none text-white/20 lg:block" />

      <Container className="relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <Eyebrow tone="light">{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
            <h2 className="max-w-md font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
              {data?.heading ?? t("heading")}
            </h2>
          </div>
          <Button href="/news" variant="ghostLight" className="shrink-0">
            {data?.moreContentsLabel ?? t("moreContents")}
          </Button>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <VideoPlayer
            poster="/images/media-video-poster.jpg"
            src="/videos/highlight.mp4"
            playLabel={data?.playVideoLabel ?? t("playVideo")}
          />

          <ul className="divide-y divide-white/15">
            {posts.map((post) => (
              <li key={post.title} className="py-5 first:pt-0">
                <Link href="/news" className="block">
                  <p className="font-display text-base font-semibold leading-snug text-white">
                    {post.title}
                  </p>
                  <p className="mt-2 text-xs text-white/60">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
