import { getPageBySlug } from "@/lib/pages";
import { renderHomeBlock, DefaultHomeBlocks } from "@/lib/renderHomeBlocks";

// Re-render at most once a minute so edits made in /admin (campuses,
// events, posts, ministries, and now Pages sections) show up without a
// full redeploy.
export const revalidate = 60;

export default async function Home() {
  const homePage = await getPageBySlug(null, "");

  if (homePage?.sections?.length) {
    return <>{homePage.sections.map((block) => renderHomeBlock(block))}</>;
  }

  // No CMS-authored home page yet — render the built-in default homepage.
  return <DefaultHomeBlocks />;
}
