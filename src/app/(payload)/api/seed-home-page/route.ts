import config from "@payload-config";
import { getPayload } from "payload";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";

// One-time seed: creates the main site's Home Page (tenant empty, isHome
// true) pre-filled with the site's current English copy, so an admin can
// start editing/cloning real content instead of an empty form. Safe to
// call more than once — it's a no-op if a Home page already exists.
// Requires a logged-in admin session. Delete this route once seeded.
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const existing = await payload.find({
    collection: "pages",
    where: { and: [{ tenant: { exists: false } }, { isHome: { equals: true } }] },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return NextResponse.json({ ok: true, message: "Home page already exists", skipped: true });
  }

  const [tHero, tBsp, tQuick, tMin, tMission, tGet, tMedia, tEvents, tNet, tChair, tPartner, tNews] =
    await Promise.all([
      getTranslations("Home.Hero"),
      getTranslations("Home.BibleStudyProgram"),
      getTranslations("Home.QuickLinks"),
      getTranslations("Home.Ministries"),
      getTranslations("Home.OurMission"),
      getTranslations("Home.GetInvolved"),
      getTranslations("Home.Media"),
      getTranslations("Home.Events"),
      getTranslations("Home.OurNetwork"),
      getTranslations("Home.HonoraryChairman"),
      getTranslations("Home.PartnerWithUs"),
      getTranslations("Home.Newsletter"),
    ]);

  const page = await payload.create({
    collection: "pages",
    data: {
      title: "Home",
      slug: "",
      isHome: true,
      published: true,
      sections: [
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
              href: "/ministries",
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
      ],
    },
  });

  return NextResponse.json({ ok: true, pageId: page.id });
}
