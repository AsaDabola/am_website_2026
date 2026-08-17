import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Featured News | AM International",
  description: "What students are seeing, where AM is going next, and how to pray.",
};

export default function FeaturedNewsPage() {
  return (
    <NewsListPage
      active="/news"
      title="Featured News"
      eyebrow="News"
      heading="Featured News"
      category="news"
    />
  );
}
