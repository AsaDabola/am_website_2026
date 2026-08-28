import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News | AM International",
  description: "What students are seeing, where AM is going next, and how to pray.",
};

export default function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <NewsListPage searchParams={searchParams} category="news" />;
}
