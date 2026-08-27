import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo News | AM International",
  description: "Photo stories from AM chapters and events around the world.",
};

export default function PhotoNewsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <NewsListPage
      searchParams={searchParams}
      active="/news/photo-news"
      title="Photo News"
      eyebrow="News"
      heading="Photo News"
      category="photo-news"
    />
  );
}
