import Reveal from "@/components/ui/Reveal";
import {
  Accordion,
  Banner,
  Cards,
  Cta,
  Embed,
  Gallery,
  ImageText,
  Logos,
  People,
  ProseSection,
  Quote,
  Spacer,
  Stats,
  Steps,
} from "@/components/pages/blocks/PageBlocks";
import type { PageBlockData } from "./pageBlockTypes";

/**
 * Draws the sections an editor assembled, in the order they sit in.
 *
 * An unrecognised block type draws nothing. That is deliberate: a block left
 * in the database by a since-removed field should cost its own section, not
 * the page.
 */
export function renderPageBlock(block: PageBlockData) {
  switch (block.blockType) {
    case "banner":
      return <Banner data={block} />;
    case "prose":
      return <ProseSection data={block} />;
    case "imageText":
      return <ImageText data={block} />;
    case "cards":
      return <Cards data={block} />;
    case "people":
      return <People data={block} />;
    case "stats":
      return <Stats data={block} />;
    case "steps":
      return <Steps data={block} />;
    case "accordion":
      return <Accordion data={block} />;
    case "quote":
      return <Quote data={block} />;
    case "gallery":
      return <Gallery data={block} />;
    case "cta":
      return <Cta data={block} />;
    case "embed":
      return <Embed data={block} />;
    case "logos":
      return <Logos data={block} />;
    case "spacer":
      return <Spacer data={block} />;
    default:
      return null;
  }
}

export function PageSections({
  sections,
  /**
   * Reveal the first section on scroll too. Off by default because these
   * usually open a page, and a section already in view when the page loads
   * would only flash; on when they follow a hero that is above them.
   */
  revealFirst = false,
}: {
  sections?: PageBlockData[] | null;
  revealFirst?: boolean;
}) {
  const blocks = (sections ?? []).filter(Boolean);
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const node = renderPageBlock(block);
        if (!node) return null;
        const key = block.id ?? `${block.blockType}-${index}`;
        return index === 0 && !revealFirst ? (
          <div key={key}>{node}</div>
        ) : (
          <Reveal key={key}>{node}</Reveal>
        );
      })}
    </>
  );
}
