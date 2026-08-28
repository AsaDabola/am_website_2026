// Loose types mirroring collections/blocks/homeBlocks.ts, for the optional
// CMS-sourced props each homepage section component accepts. All fields are
// optional so a component can mix CMS overrides with its translated
// defaults field-by-field.

type MediaRef = { url?: string | null } | string | null | undefined;

/**
 * The address to put in an <Image src>, for a file this site serves itself.
 *
 * Payload writes an absolute address once serverURL is set, and next/image
 * refuses an absolute address whose host is not in `images.remotePatterns` —
 * the site's own included. Measured on the same file and the same server:
 * "/images/x.webp" resizes and answers 200, and the identical
 * "http://host/images/x.webp" answers 400, which is a broken card in every
 * listing.
 *
 * Matching on the path rather than on the host is what makes this hold when
 * the site moves domain: /api/media/ is Payload's own route, so it is always
 * this server, whatever it is called today. A file on another host — blob
 * storage, which remotePatterns does name — is left exactly as it is.
 */
function siteRelative(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/api/media/") ? `${parsed.pathname}${parsed.search}` : url;
  } catch {
    // Already a path, which is the shape this is trying to produce.
    return url;
  }
}

function mediaUrl(media: MediaRef): string | undefined {
  if (media && typeof media === "object" && media.url) return siteRelative(media.url);
  return undefined;
}

export { mediaUrl, siteRelative };

export type HeroData = {
  eyebrow?: string;
  headingLine1?: string;
  headingHighlight1?: string;
  headingHighlight2?: string;
  joinBibleStudyLabel?: string;
  whoWeAreLabel?: string;
  backgroundImage?: MediaRef;
  stat1?: { value?: string; label?: string };
  stat2?: { value?: string; label?: string };
  stat3?: { value?: string; label?: string };
};

export type BibleStudyProgramData = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  image?: MediaRef;
};

export type QuickLinksData = {
  links?: {
    icon?: "book" | "pin" | "people" | "heart";
    title?: string;
    description?: string;
    href?: string;
  }[];
};

export type MinistriesData = {
  eyebrow?: string;
  heading?: string;
  getInvolvedLabel?: string;
  steps?: {
    tag?: string;
    title?: string;
    description?: string;
    href?: string;
    image?: MediaRef;
  }[];
};

export type OurMissionData = {
  eyebrow?: string;
  statementPrefix?: string;
  statementEmphasis?: string;
  statementSuffix?: string;
  readFullStatementLabel?: string;
  nameOrigin?: string;
  history?: string;
  ourHistoryLabel?: string;
};

export type GetInvolvedData = {
  eyebrow?: string;
  heading?: string;
  cards?: { title?: string; description?: string; href?: string; image?: MediaRef }[];
};

export type MediaSectionData = {
  eyebrow?: string;
  heading?: string;
  moreContentsLabel?: string;
  playVideoLabel?: string;
};

export type EventsData = {
  eyebrow?: string;
  heading?: string;
  allEventsLabel?: string;
};

export type OurNetworkData = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  startChapterLabel?: string;
  searchPlaceholder?: string;
  noMatchesLabel?: string;
};

export type HonoraryChairmanData = {
  eyebrow?: string;
  followingLegacy?: string;
  name?: string;
  quoteLine1?: string;
  quoteLine2?: string;
  quoteLine3?: string;
  quoteReference?: string;
  image?: MediaRef;
};

export type PartnerWithUsData = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  giveTodayLabel?: string;
  talkToUsLabel?: string;
};

export type NewsletterData = {
  heading?: string;
  description?: string;
  ctaLabel?: string;
  backgroundImage?: MediaRef;
};
