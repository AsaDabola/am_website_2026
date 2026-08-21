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
import Reveal from "@/components/ui/Reveal";

// Shared between the main amintl.org homepage and every country (tenant)
// site's homepage, so both render the same CMS-authored `sections` blocks
// the same way — only the tenantId used to scope live content (Posts,
// Events, Campuses) differs.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderHomeBlock(block: any, tenantId?: string) {
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
      return <Media key={block.id} data={block} tenantId={tenantId} />;
    case "events":
      return <Events key={block.id} data={block} tenantId={tenantId} />;
    case "ourNetwork":
      return <OurNetwork key={block.id} data={block} tenantId={tenantId} />;
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

// The built-in default homepage — used for the main site when no CMS home
// Page exists yet, and for every country site until its editor customizes
// (or clones) a home Page of its own in /admin.
export function DefaultHomeBlocks({ tenantId }: { tenantId?: string }) {
  return (
    <>
      {/* The hero is above the fold, so it is deliberately not revealed —
          there is no scroll to trigger it and it would only flash on load. */}
      <Hero />
      <Reveal>
        <BibleStudyProgram />
      </Reveal>
      <Reveal>
        <QuickLinks />
      </Reveal>
      <Reveal>
        <Ministries />
      </Reveal>
      <Reveal>
        <OurMission />
      </Reveal>
      <Reveal>
        <GetInvolved />
      </Reveal>
      <Reveal>
        <Media tenantId={tenantId} />
      </Reveal>
      <Reveal>
        <Events tenantId={tenantId} />
      </Reveal>
      <Reveal>
        <OurNetwork tenantId={tenantId} />
      </Reveal>
      <Reveal>
        <HonoraryChairman />
      </Reveal>
      <Reveal>
        <PartnerWithUs />
      </Reveal>
      <Reveal>
        <Newsletter />
      </Reveal>
    </>
  );
}
