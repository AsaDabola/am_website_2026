import { getPageBySlug } from "@/lib/pages";
import { HomeSections } from "@/lib/renderHomeBlocks";
import LivePreviewListener from "@/components/pages/LivePreviewListener";

// Re-render at most once a minute so edits made in /admin (campuses,
// events, posts, ministries, and now Pages sections) show up without a
// full redeploy.
export const revalidate = 60;

export default async function Home() {
  const homePage = await getPageBySlug(null, "");

  // Every section is drawn whether or not the page authors it; an authored
  // one replaces its counterpart rather than the rest of the page.
  return (
    <>
      <LivePreviewListener />
      <HomeSections sections={homePage?.sections} />
    </>
  );
}
