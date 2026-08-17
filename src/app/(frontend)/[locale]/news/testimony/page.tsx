import type { Metadata } from "next";
import NewsListPage from "@/components/news/NewsListPage";

export const metadata: Metadata = {
  title: "Testimony | AM International",
  description: "Stories of what God is doing in the lives of AM students and staff.",
};

export default function TestimonyPage() {
  return (
    <NewsListPage
      active="/news/testimony"
      title="Testimony"
      eyebrow="News"
      heading="Testimony"
      category="testimony"
    />
  );
}
