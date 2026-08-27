import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Featured | AM International",
  description: "The stories AM is leading with right now.",
};

export default function FeaturedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <NewsListPage
      searchParams={searchParams}
      active="/news/featured"
      title="Featured"
      eyebrow="News"
      heading="Featured"
      category="featured"
      heroTitle="Stories of Faith. Stories of Mission."
      heroSubtitle=""
    />
  );
}
