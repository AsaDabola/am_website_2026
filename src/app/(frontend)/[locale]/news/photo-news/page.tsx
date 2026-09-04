import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";
import withPageLayout from "@/components/pages/BuiltInPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo News | AM International",
  description: "Photo stories from AM chapters and events around the world.",
};

function PhotoNewsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <NewsListPage searchParams={searchParams} category="photo-news" />;
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/news/photo-news", PhotoNewsPage);
