import { createTranslator } from "next-intl";
import { applyOverrides, getTenantOverrides } from "./tenantContent";

/**
 * Builds the block-based home page from a message catalogue.
 *
 * Shared by the two things that need a pre-filled home page: seeding the main
 * site's, and giving a country site its own editable copy. Both start from
 * exactly the copy the site is already showing, which is the point — the
 * editable version should open looking like what it replaces, not like a
 * blank form.
 *
 * `locale` decides the language, so a country whose site is in Thai gets a
 * Thai home page to edit rather than an English one to translate. Any copy
 * changes that country has already made are folded in too.
 */
export async function buildHomeSections(locale: string, tenantId?: string | null) {
  const messages = (await import(`../../messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;
  const overrides = await getTenantOverrides(tenantId ?? null, locale);
  const merged = applyOverrides(messages, overrides);

  const ns = (namespace: string) =>
    createTranslator({ locale, messages: merged, namespace } as never);

  const tHero = ns("Home.Hero");
  const tBsp = ns("Home.BibleStudyProgram");
  const tQuick = ns("Home.QuickLinks");
  const tMin = ns("Home.Ministries");
  const tMission = ns("Home.OurMission");
  const tGet = ns("Home.GetInvolved");
  const tMedia = ns("Home.Media");
  const tEvents = ns("Home.Events");
  const tNet = ns("Home.OurNetwork");
  const tChair = ns("Home.HonoraryChairman");
  const tPartner = ns("Home.PartnerWithUs");
  const tNews = ns("Home.Newsletter");

  return [
    {
      blockType: "hero",
      eyebrow: tHero("eyebrow"),
      headingLine1: tHero("headingLine1"),
      headingHighlight1: tHero("headingWhere"),
      headingHighlight2: tHero("headingWeAre"),
      joinBibleStudyLabel: tHero("joinBibleStudy"),
      whoWeAreLabel: tHero("whoWeAre"),
      stat1: { value: tHero("stat1Value"), label: tHero("stat1Label") },
      stat2: { value: tHero("stat2Value"), label: tHero("stat2Label") },
      stat3: { value: tHero("stat3Value"), label: tHero("stat3Label") },
    },
    {
      blockType: "bibleStudyProgram",
      eyebrow: tBsp("eyebrow"),
      heading: tBsp("heading"),
      description: tBsp("description"),
      ctaLabel: tBsp("cta"),
    },
    {
      blockType: "quickLinks",
      links: [
        {
          icon: "book",
          title: tQuick("joinBibleStudyTitle"),
          description: tQuick("joinBibleStudyDescription"),
          href: "/bible-study",
        },
        {
          icon: "pin",
          title: tQuick("findCampusTitle"),
          description: tQuick("findCampusDescription"),
          href: "/network",
        },
        {
          icon: "people",
          title: tQuick("getInvolvedTitle"),
          description: tQuick("getInvolvedDescription"),
          href: "/get-involved",
        },
        {
          icon: "heart",
          title: tQuick("supportTitle"),
          description: tQuick("supportDescription"),
          href: "/give",
        },
      ],
    },
    {
      blockType: "ministries",
      eyebrow: tMin("eyebrow"),
      heading: tMin("heading"),
      getInvolvedLabel: tMin("getInvolved"),
      steps: [
        {
          tag: tMin("connectTag"),
          title: tMin("connectTitle"),
          description: tMin("connectDescription"),
          href: "/bible-study",
        },
        {
          tag: tMin("growTag"),
          title: tMin("growTitle"),
          description: tMin("growDescription"),
          href: "/get-involved/group-activities",
        },
        {
          tag: tMin("leadTag"),
          title: tMin("leadTitle"),
          description: tMin("leadDescription"),
          href: "/get-involved",
        },
        {
          tag: tMin("sentTag"),
          title: tMin("sentTitle"),
          description: tMin("sentDescription"),
          href: "/get-involved",
        },
      ],
    },
    {
      blockType: "ourMission",
      eyebrow: tMission("eyebrow"),
      statementPrefix: tMission("statementPrefix"),
      statementEmphasis: tMission("statementEmphasis"),
      statementSuffix: tMission("statementSuffix"),
      readFullStatementLabel: tMission("readFullStatement"),
      nameOrigin: tMission("nameOrigin"),
      history: tMission("history"),
      ourHistoryLabel: tMission("ourHistory"),
    },
    {
      blockType: "getInvolved",
      eyebrow: tGet("eyebrow"),
      heading: tGet("heading"),
    },
    {
      blockType: "media",
      eyebrow: tMedia("eyebrow"),
      heading: tMedia("heading"),
      moreContentsLabel: tMedia("moreContents"),
      playVideoLabel: tMedia("playVideo"),
    },
    {
      blockType: "events",
      eyebrow: tEvents("eyebrow"),
      heading: tEvents("heading"),
      allEventsLabel: tEvents("allEvents"),
    },
    {
      blockType: "ourNetwork",
      eyebrow: tNet("eyebrow"),
      heading: tNet("heading"),
      description: tNet("description"),
      startChapterLabel: tNet("startChapter"),
      searchPlaceholder: tNet("searchPlaceholder"),
      noMatchesLabel: tNet("noMatches"),
    },
    {
      blockType: "honoraryChairman",
      eyebrow: tChair("eyebrow"),
      followingLegacy: tChair("followingLegacy"),
      name: tChair("name"),
      quoteLine1: tChair("quoteLine1"),
      quoteLine2: tChair("quoteLine2"),
      quoteLine3: tChair("quoteLine3"),
      quoteReference: tChair("quoteReference"),
    },
    {
      blockType: "partnerWithUs",
      eyebrow: tPartner("eyebrow"),
      heading: tPartner("heading"),
      description: tPartner("description"),
      giveTodayLabel: tPartner("giveToday"),
      talkToUsLabel: tPartner("talkToUs"),
    },
    {
      blockType: "newsletter",
      heading: tNews("heading"),
      description: tNews("description"),
      ctaLabel: tNews("cta"),
    },
  ];
}
