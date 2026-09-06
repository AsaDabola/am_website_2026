import GenericText from "@/components/generic/GenericText";
import GenericCards from "@/components/generic/GenericCards";
import GenericImageText from "@/components/generic/GenericImageText";
import GenericGallery from "@/components/generic/GenericGallery";
import GenericStats from "@/components/generic/GenericStats";
import GenericTimeline from "@/components/generic/GenericTimeline";
import GenericCta from "@/components/generic/GenericCta";
import GenericQuote from "@/components/generic/GenericQuote";
import GenericList from "@/components/generic/GenericList";
import GenericFeature from "@/components/generic/GenericFeature";
import GenericIconCards from "@/components/generic/GenericIconCards";
import GenericLinkCards from "@/components/generic/GenericLinkCards";
import GenericJourney from "@/components/generic/GenericJourney";
import GenericPhotoGrid from "@/components/generic/GenericPhotoGrid";
import { mediaUrl } from "@/lib/homeBlockTypes";
import type { BackgroundValue } from "@/components/generic/background";

// The reusable content-block library any Page's `genericSections` draws
// from — the same mechanism homeBlocks/renderHomeBlock gives the home page,
// so any page has that same amount of editability. Block shapes come
// straight from Payload's generated types, which don't exist for a
// collection-level blocks field until it's fully wired in, so this stays
// loosely typed the same way renderHomeBlock does.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderGenericBlock(block: any) {
  const background = block.background as BackgroundValue | undefined;

  switch (block.blockType) {
    case "genericText":
      return (
        <GenericText
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          paragraphs={(block.paragraphs ?? []).map((p: { body: string }) => p.body)}
          background={background}
        />
      );
    case "genericCards":
      return (
        <GenericCards
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          cards={block.cards ?? []}
          background={background}
        />
      );
    case "genericImageText":
      return (
        <GenericImageText
          key={block.id}
          image={mediaUrl(block.image) ?? ""}
          imageAlt={block.imageAlt}
          imageSide={block.imageSide}
          heading={block.heading}
          body={block.body}
          button={block.buttonLabel && block.buttonHref ? { label: block.buttonLabel, href: block.buttonHref } : undefined}
          secondaryButton={
            block.buttonLabel2 && block.buttonHref2 ? { label: block.buttonLabel2, href: block.buttonHref2 } : undefined
          }
          background={background}
        />
      );
    case "genericGallery": {
      const images = (block.images ?? []).map((img: { image: unknown; alt?: string }) => ({
        src: mediaUrl(img.image as never) ?? "",
        alt: img.alt ?? "",
      }));
      if (images.length !== 3) return null;
      return (
        <GenericGallery
          key={block.id}
          images={images as [{ src: string; alt: string }, { src: string; alt: string }, { src: string; alt: string }]}
          background={background}
        />
      );
    }
    case "genericStats":
      return (
        <GenericStats
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          stats={block.stats ?? []}
          background={background}
        />
      );
    case "genericTimeline":
      return (
        <GenericTimeline
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          items={block.items ?? []}
          background={background}
        />
      );
    case "genericCta":
      return (
        <GenericCta
          key={block.id}
          heading={block.heading}
          body={block.body}
          button={{ label: block.buttonLabel, href: block.buttonHref }}
          background={background}
        />
      );
    case "genericQuote":
      return (
        <GenericQuote key={block.id} quote={block.quote} reference={block.reference} background={background} />
      );
    case "genericList":
      return (
        <GenericList
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          items={(block.items ?? []).map((i: { body: string }) => i.body)}
          background={background}
        />
      );
    case "genericFeature":
      return (
        <GenericFeature
          key={block.id}
          heading={block.heading}
          intro={block.intro}
          image={mediaUrl(block.image) ?? ""}
          imageAlt={block.imageAlt}
          items={(block.items ?? []).map((item: { icon?: unknown; title: string; body: string }) => ({
            icon: mediaUrl(item.icon as never),
            title: item.title,
            body: item.body,
          }))}
          button={block.buttonLabel && block.buttonHref ? { label: block.buttonLabel, href: block.buttonHref } : undefined}
          background={background}
        />
      );
    case "genericIconCards":
      return (
        <GenericIconCards
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          cards={(block.cards ?? []).map((card: { icon?: unknown; title: string; body: string }) => ({
            icon: mediaUrl(card.icon as never),
            title: card.title,
            body: card.body,
          }))}
          background={background}
        />
      );
    case "genericLinkCards":
      return (
        <GenericLinkCards
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          cards={(block.cards ?? []).map((card: { image: unknown; imageAlt?: string; title: string; body?: string; href: string }) => ({
            image: mediaUrl(card.image as never) ?? "",
            imageAlt: card.imageAlt,
            title: card.title,
            body: card.body,
            href: card.href,
          }))}
          background={background}
        />
      );
    case "genericJourney":
      return (
        <GenericJourney
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          stages={block.stages ?? []}
          background={background}
        />
      );
    case "genericPhotoGrid":
      return (
        <GenericPhotoGrid
          key={block.id}
          eyebrow={block.eyebrow}
          heading={block.heading}
          people={(block.people ?? []).map((person: { image: unknown; name: string; title?: string }) => ({
            image: mediaUrl(person.image as never) ?? "",
            name: person.name,
            title: person.title,
          }))}
          background={background}
        />
      );
    default:
      return null;
  }
}
