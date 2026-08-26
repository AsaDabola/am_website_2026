// Loose types mirroring collections/blocks/homeBlocks.ts, for the optional
// CMS-sourced props each homepage section component accepts. All fields are
// optional so a component can mix CMS overrides with its translated
// defaults field-by-field.

type MediaRef = { url?: string | null } | string | null | undefined;

function mediaUrl(media: MediaRef): string | undefined {
  if (media && typeof media === "object") return media.url ?? undefined;
  return undefined;
}

export { mediaUrl };

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
