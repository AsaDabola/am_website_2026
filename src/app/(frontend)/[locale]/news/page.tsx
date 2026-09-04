import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";
import withPageLayout from "@/components/pages/BuiltInPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News | AM International",
  description: "What students are seeing, where AM is going next, and how to pray.",
};

function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <NewsListPage searchParams={searchParams} category="news" />;
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/news", NewsPage);
