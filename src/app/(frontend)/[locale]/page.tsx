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

// Re-render at most once a minute so edits made in /admin (campuses,
// events, posts, ministries) show up without a full redeploy.
export const revalidate = 60;

export default function Home() {
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
