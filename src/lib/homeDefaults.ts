import en from "../../messages/en.json";

/**
 * The home page exactly as the site ships it, as data.
 *
 * The editor used to open on empty fields. Every one of them had a value —
 * the headline, the four steps, the three cards — but the value lived in the
 * components and in messages/en.json, and an empty box in the admin over a
 * full page on the screen is not an editor. It tells someone their page has no
 * content and then contradicts itself in the preview beside it.
 *
 * So the content moves out of the components and into here, once, and is used
 * twice:
 *
 *   - as the `defaultValue` of every field on every home block, so a block
 *     added in the admin arrives holding what the site actually shows;
 *   - by scripts/seed-page-content.mjs, which fills the fields of blocks that
 *     already exist and were saved empty.
 *
 * The components keep their own fallbacks, because a page with no record at
 * all still has to render. This is the same text, not a second copy of it:
 * both read messages/en.json, which is also what the 47 translations are keyed
 * to. Change the English there and it changes in the component, in the field
 * default, and in the next seed.
 *
 * Photographs are written here as the paths the components use. The seeder
 * turns each into a Media record, because an upload field holds a record and
 * not a path; `defaultValue` leaves them alone, since no record exists at the
 * moment a field is being defaulted.
 */

const H = en.Home;

/** A photograph the site ships, for the seeder to resolve into Media. */
export const isShippedImage = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/images/");

export type BlockDefaults = Record<string, unknown>;

export const HOME_DEFAULTS: Record<string, BlockDefaults> = {
  hero: {
    eyebrow: H.Hero.eyebrow,
    headingLine1: H.Hero.headingLine1,
    headingHighlight1: H.Hero.headingWhere,
    headingHighlight2: H.Hero.headingWeAre,
    joinBibleStudyLabel: H.Hero.joinBibleStudy,
    whoWeAreLabel: H.Hero.whoWeAre,
    // In the order Hero.tsx rotates them. The keys are not in step with the
    // positions — slides have come and gone — so they are paired here the same
    // way they are paired there, by photograph rather than by number.
    slides: [
      {
        image: "/images/hero-slide-bible-study.webp",
        line1: H.Hero.slide4Line1,
        line2: H.Hero.slide4Line2,
      },
      {
        image: "/images/hero-slide-campus-aerial.webp",
        line1: H.Hero.slide3Line1,
        line2: H.Hero.slide3Line2,
      },
    ],
  },

  bibleStudyProgram: {
    eyebrow: H.BibleStudyProgram.eyebrow,
    heading: H.BibleStudyProgram.heading,
    description: H.BibleStudyProgram.description,
    ctaLabel: H.BibleStudyProgram.cta,
    image: "/images/bible-study-group.webp",
  },

  quickLinks: {
    links: [
      {
        icon: "book",
        title: H.QuickLinks.joinBibleStudyTitle,
        description: H.QuickLinks.joinBibleStudyDescription,
        href: "/bible-study",
      },
      {
        icon: "pin",
        title: H.QuickLinks.findCampusTitle,
        description: H.QuickLinks.findCampusDescription,
        href: "/network",
      },
      {
        icon: "people",
        title: H.QuickLinks.getInvolvedTitle,
        description: H.QuickLinks.getInvolvedDescription,
        href: "/get-involved",
      },
      {
        icon: "heart",
        title: H.QuickLinks.supportTitle,
        description: H.QuickLinks.supportDescription,
        href: "/get-involved/donate",
      },
    ],
  },

  ministries: {
    eyebrow: H.Ministries.eyebrow,
    heading: H.Ministries.heading,
    getInvolvedLabel: H.Ministries.getInvolved,
    steps: [
      {
        tag: H.Ministries.connectTag,
        title: H.Ministries.connectTitle,
        description: H.Ministries.connectDescription,
        href: "/get-involved",
        image: "/images/ministry-connect.webp",
      },
      {
        tag: H.Ministries.growTag,
        title: H.Ministries.growTitle,
        description: H.Ministries.growDescription,
        href: "/get-involved",
        image: "/images/ministry-grow.webp",
      },
      {
        tag: H.Ministries.leadTag,
        title: H.Ministries.leadTitle,
        description: H.Ministries.leadDescription,
        href: "/get-involved",
        image: "/images/ministry-lead.webp",
      },
      // The fourth step is drawn without a photograph, and is left without one
      // here rather than given one it does not have.
      {
        tag: H.Ministries.sentTag,
        title: H.Ministries.sentTitle,
        description: H.Ministries.sentDescription,
        href: "/get-involved",
      },
    ],
  },

  ourMission: {
    eyebrow: H.OurMission.eyebrow,
    statementPrefix: H.OurMission.statementPrefix,
    statementEmphasis: H.OurMission.statementEmphasis,
    statementSuffix: H.OurMission.statementSuffix,
    readFullStatementLabel: H.OurMission.readFullStatement,
    nameOrigin: H.OurMission.nameOrigin,
    history: H.OurMission.history,
    ourHistoryLabel: H.OurMission.ourHistory,
  },

  getInvolved: {
    eyebrow: H.GetInvolved.eyebrow,
    heading: H.GetInvolved.heading,
    cards: [
      {
        title: H.GetInvolved.bibleStudies,
        href: "/bible-study",
        image: "/images/get-involved-bible-studies.webp",
      },
      {
        title: H.GetInvolved.volunteer,
        href: "/get-involved/volunteer",
        image: "/images/get-involved-volunteer.webp",
      },
      {
        title: H.GetInvolved.internship,
        href: "/get-involved/internship",
        image: "/images/get-involved-internship.webp",
      },
    ],
  },

  media: {
    eyebrow: H.Media.eyebrow,
    heading: H.Media.heading,
    moreContentsLabel: H.Media.moreContents,
    playVideoLabel: H.Media.playVideo,
  },

  events: {
    eyebrow: H.Events.eyebrow,
    heading: H.Events.heading,
    allEventsLabel: H.Events.allEvents,
  },

  ourNetwork: {
    eyebrow: H.OurNetwork.eyebrow,
    heading: H.OurNetwork.heading,
    description: H.OurNetwork.description,
    startChapterLabel: H.OurNetwork.startChapter,
    searchPlaceholder: H.OurNetwork.searchPlaceholder,
    noMatchesLabel: H.OurNetwork.noMatches,
  },

  honoraryChairman: {
    eyebrow: H.HonoraryChairman.eyebrow,
    followingLegacy: H.HonoraryChairman.followingLegacy,
    name: H.HonoraryChairman.name,
    quoteLine1: H.HonoraryChairman.quoteLine1,
    quoteLine2: H.HonoraryChairman.quoteLine2,
    quoteLine3: H.HonoraryChairman.quoteLine3,
    quoteReference: H.HonoraryChairman.quoteReference,
    image: "/images/honorary-chairman.webp",
  },

  partnerWithUs: {
    eyebrow: H.PartnerWithUs.eyebrow,
    heading: H.PartnerWithUs.heading,
    description: H.PartnerWithUs.description,
    giveTodayLabel: H.PartnerWithUs.giveToday,
    talkToUsLabel: H.PartnerWithUs.talkToUs,
  },

  newsletter: {
    heading: H.Newsletter.heading,
    description: H.Newsletter.description,
    ctaLabel: H.Newsletter.cta,
    backgroundImage: "/images/bible-study-collage.webp",
  },
};

/** The blocks the home page is made of, in the order it draws them. */
export const HOME_BLOCK_ORDER = [
  "hero",
  "bibleStudyProgram",
  "quickLinks",
  "ministries",
  "ourMission",
  "getInvolved",
  "media",
  "events",
  "ourNetwork",
  "honoraryChairman",
  "partnerWithUs",
  "newsletter",
] as const;
