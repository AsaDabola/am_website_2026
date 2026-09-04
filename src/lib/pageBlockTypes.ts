import type { Appearance } from "@/collections/blocks/appearance";

/**
 * The shapes `collections/blocks/pageBlocks.ts` produces, as the renderer sees
 * them. Everything is optional: a block saved with only a heading filled in is
 * a normal thing for an editor to do, and every component below has to draw
 * something sensible from it.
 */

export type MediaRef = { url?: string | null; alt?: string | null } | string | null | undefined;

export type ButtonData = {
  id?: string;
  label?: string | null;
  href?: string | null;
  style?: "primary" | "secondary" | "link" | null;
};

type Base = {
  id?: string;
  blockType: string;
  appearance?: Appearance | null;
  eyebrow?: string | null;
  heading?: string | null;
};

export type BannerData = Base & {
  blockType: "banner";
  subheading?: string | null;
  showBreadcrumbs?: boolean | null;
  height?: "sm" | "md" | "lg" | "full" | null;
  buttons?: ButtonData[] | null;
};

export type ProseData = Base & {
  blockType: "prose";
  body?: unknown;
  buttons?: ButtonData[] | null;
};

export type ImageTextData = Base & {
  blockType: "imageText";
  body?: unknown;
  image?: MediaRef;
  imageSide?: "left" | "right" | null;
  imageShape?: "landscape" | "square" | "portrait" | "natural" | null;
  imageRounded?: boolean | null;
  buttons?: ButtonData[] | null;
};

export type CardsData = Base & {
  blockType: "cards";
  intro?: string | null;
  columns?: string | null;
  cards?: {
    id?: string;
    image?: MediaRef;
    tag?: string | null;
    title?: string | null;
    description?: string | null;
    href?: string | null;
    linkLabel?: string | null;
  }[] | null;
};

export type PeopleData = Base & {
  blockType: "people";
  columns?: string | null;
  people?: {
    id?: string;
    photo?: MediaRef;
    name?: string | null;
    role?: string | null;
    bio?: string | null;
    email?: string | null;
    startsRow?: boolean | null;
  }[] | null;
};

export type StatsData = Base & {
  blockType: "stats";
  stats?: { id?: string; value?: string | null; label?: string | null }[] | null;
};

export type StepsData = Base & {
  blockType: "steps";
  steps?: {
    id?: string;
    title?: string | null;
    description?: string | null;
    href?: string | null;
  }[] | null;
};

export type AccordionData = Base & {
  blockType: "accordion";
  items?: { id?: string; question?: string | null; answer?: unknown }[] | null;
};

export type QuoteData = Base & {
  blockType: "quote";
  quote?: string | null;
  attribution?: string | null;
  role?: string | null;
  image?: MediaRef;
};

export type GalleryData = Base & {
  blockType: "gallery";
  columns?: string | null;
  images?: { id?: string; image?: MediaRef; caption?: string | null }[] | null;
};

export type CtaData = Base & {
  blockType: "cta";
  description?: string | null;
  buttons?: ButtonData[] | null;
};

export type EmbedData = Base & {
  blockType: "embed";
  url?: string | null;
  ratio?: "16-9" | "1-1" | "9-16" | "21-9" | null;
  caption?: string | null;
};

export type LogosData = Base & {
  blockType: "logos";
  logos?: { id?: string; image?: MediaRef; name?: string | null; href?: string | null }[] | null;
};

export type SpacerData = Base & {
  blockType: "spacer";
  height?: "sm" | "md" | "lg" | "xl" | null;
  rule?: boolean | null;
};

export type PageBlockData =
  | BannerData
  | ProseData
  | ImageTextData
  | CardsData
  | PeopleData
  | StatsData
  | StepsData
  | AccordionData
  | QuoteData
  | GalleryData
  | CtaData
  | EmbedData
  | LogosData
  | SpacerData;

/**
 * The address to embed, for the handful of services worth special-casing.
 *
 * An editor pastes what is in the browser's address bar; that address renders
 * the service's own page, not a player, and putting it in an iframe shows a
 * refusal instead of the video. Anything unrecognised is passed through as
 * typed, which is right for a service that already gave an embed address.
 *
 * Only http(s) survives — `javascript:` in a src attribute is script execution
 * with the site's own origin, and this field is filled in by ~68 editors.
 */
export function embedUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
    const shorts = /^\/shorts\/([\w-]+)/.exec(url.pathname);
    if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (host === "vimeo.com") {
    const id = /^\/(\d+)/.exec(url.pathname)?.[1];
    if (id) return `https://player.vimeo.com/video/${id}`;
  }

  return url.toString();
}
