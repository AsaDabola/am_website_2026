import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Testimony | AM International",
  description: "Stories of what God is doing in the lives of AM students and staff.",
};

export default function TestimonyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <NewsListPage
      searchParams={searchParams}
      active="/news/testimony"
      title="Testimony"
      eyebrow="News"
      heading="Testimony"
      category="testimony"
      heroTitle="Real stories"
      heroSubtitle="Faith. Growth. Transformation."
      backgroundImage="/images/hero-night-sky.webp"
    />
  );
}
