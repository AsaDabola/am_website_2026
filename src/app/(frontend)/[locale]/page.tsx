import Hero from "@/components/sections/Hero";
import BibleStudyProgram from "@/components/sections/BibleStudyProgram";
import QuickLinks from "@/components/sections/QuickLinks";
import Ministries from "@/components/sections/Ministries";
import OurMission from "@/components/sections/OurMission";
import GetInvolved from "@/components/sections/GetInvolved";
import Media from "@/components/sections/Media";
import Events from "@/components/sections/Events";
import OurNetwork from "@/components/sections/OurNetwork";
import HonoraryChairman from "@/components/sections/HonoraryChairman";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getPageBySlug } from "@/lib/pages";

// Re-render at most once a minute so edits made in /admin (campuses,
// events, posts, ministries, and now Pages sections) show up without a
// full redeploy.
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderBlock(block: any) {
  switch (block.blockType) {
    case "hero":
      return <Hero key={block.id} data={block} />;
    case "bibleStudyProgram":
      return <BibleStudyProgram key={block.id} data={block} />;
    case "quickLinks":
      return <QuickLinks key={block.id} data={block} />;
    case "ministries":
      return <Ministries key={block.id} data={block} />;
    case "ourMission":
      return <OurMission key={block.id} data={block} />;
    case "getInvolved":
      return <GetInvolved key={block.id} data={block} />;
    case "media":
      return <Media key={block.id} data={block} />;
    case "events":
      return <Events key={block.id} data={block} />;
    case "ourNetwork":
      return <OurNetwork key={block.id} data={block} />;
    case "honoraryChairman":
      return <HonoraryChairman key={block.id} data={block} />;
    case "partnerWithUs":
      return <PartnerWithUs key={block.id} data={block} />;
    case "newsletter":
      return <Newsletter key={block.id} data={block} />;
    default:
      return null;
  }
}

export default async function Home() {
  const homePage = await getPageBySlug(null, "");

  if (homePage?.sections?.length) {
    return <>{homePage.sections.map(renderBlock)}</>;
  }

  // No CMS-authored home page yet — render the built-in default homepage.
  return (
    <>
      <Hero />
      <BibleStudyProgram />
      <QuickLinks />
      <Ministries />
      <OurMission />
      <GetInvolved />
      <Media />
      <Events />
      <OurNetwork />
      <HonoraryChairman />
      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
