import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";
import withPageLayout from "@/components/pages/BuiltInPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Editorial | AM International",
  description: "Reflections and long-form writing from AM staff and students.",
};

function EditorialPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <NewsListPage searchParams={searchParams} category="editorial" />;
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/news/editorial", EditorialPage);
