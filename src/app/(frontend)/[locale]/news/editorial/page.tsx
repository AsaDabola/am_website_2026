import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Editorial | AM International",
  description: "Reflections and long-form writing from AM staff and students.",
};

export default function EditorialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <NewsListPage
      searchParams={searchParams}
      active="/news/editorial"
      title="Editorial"
      eyebrow="News"
      heading="Editorial"
      category="editorial"
    />
  );
}
