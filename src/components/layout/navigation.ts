import { getTranslations } from "@/i18n/content";
import type { NavIconName } from "@/components/ui/icons";

export type NavLink = {
  label: string;
  href: string;
  /** Prefixed with the current country site when browsing one. */
  tenantAware: boolean;
};

export type NavGroup = NavLink & {
  key: string;
  description: string;
  icon: NavIconName;
  links: NavLink[];
};

export type NavMenu = NavLink & {
  key: string;
  groups: NavGroup[];
};

/**
 * One nav tree, shared by the desktop mega panel and the mobile drill-down so
 * the two can never drift apart. Built on the server; everything on it is
 * plain data so it can be handed to the client mobile menu as props.
 */
export async function getNavigation(): Promise<{
  menus: NavMenu[];
  plainLinks: NavLink[];
}> {
  const t = await getTranslations("Header");
  const g = await getTranslations("Header.groups");

  const menus: NavMenu[] = [
    {
      key: "whoWeAre",
      label: t("whoWeAre"),
      href: "/about",
      tenantAware: true,
      groups: [
        {
          key: "aboutAm",
          icon: "book",
          label: g("aboutAm.title"),
          description: g("aboutAm.description"),
          href: "/about",
          tenantAware: true,
          links: [
            { label: t("whoWeAreMenu.ourMission"), href: "/about/mission", tenantAware: true },
            {
              label: t("whoWeAreMenu.statementOfFaith"),
              href: "/about/statement-of-faith",
              tenantAware: true,
            },
            { label: t("whoWeAreMenu.history"), href: "/about/history", tenantAware: true },
          ],
        },
        {
          key: "leadership",
          icon: "people",
          label: g("leadership.title"),
          description: g("leadership.description"),
          href: "/about/leadership",
          tenantAware: true,
          links: [
            {
              label: t("whoWeAreMenu.ourFirstChairmen"),
              href: "/about/chairman",
              tenantAware: true,
            },
            { label: t("whoWeAreMenu.membership"), href: "/about/membership", tenantAware: true },
          ],
        },
        {
          key: "whatWeDo",
          icon: "pin",
          label: g("whatWeDo.title"),
          description: g("whatWeDo.description"),
          href: "/what-we-do/pillars-of-mission",
          tenantAware: true,
          links: [
            {
              label: t("whatWeDoMenu.administration"),
              href: "/what-we-do/administration",
              tenantAware: true,
            },
          ],
        },
      ],
    },
    {
      key: "connect",
      label: t("connect"),
      href: "/get-involved",
      tenantAware: true,
      groups: [
        {
          key: "bibleStudy",
          icon: "graduation",
          label: g("bibleStudy.title"),
          description: g("bibleStudy.description"),
          href: "/bible-study",
          tenantAware: true,
          links: [
            {
              label: t("getInvolvedMenu.onlineBibleStudy"),
              href: "/get-involved/online-bible-study",
              tenantAware: true,
            },
            // External site — never gets a country prefix.
            {
              label: t("whatWeDoMenu.amAcademy"),
              href: "https://www.amacademy.org",
              tenantAware: false,
            },
          ],
        },
        {
          key: "getInvolved",
          icon: "heart",
          label: g("getInvolved.title"),
          description: g("getInvolved.description"),
          href: "/get-involved",
          tenantAware: true,
          links: [
            {
              label: t("getInvolvedMenu.groupActivities"),
              href: "/get-involved/group-activities",
              tenantAware: true,
            },
            {
              label: t("getInvolvedMenu.volunteer"),
              href: "/get-involved/volunteer",
              tenantAware: true,
            },
            {
              label: t("getInvolvedMenu.internship"),
              href: "/get-involved/internship",
              tenantAware: true,
            },
          ],
        },
        {
          key: "supportMission",
          icon: "gift",
          label: g("supportMission.title"),
          description: g("supportMission.description"),
          href: "/get-involved/donate",
          tenantAware: true,
          links: [
            {
              label: t("getInvolvedMenu.bibleTeacherTraining"),
              href: "/get-involved/bible-teacher-training",
              tenantAware: true,
            },
            {
              label: t("getInvolvedMenu.chapterAffiliation"),
              href: "/get-involved/chapter-affiliation",
              tenantAware: true,
            },
            { label: t("contactUs"), href: "/contact", tenantAware: true },
          ],
        },
      ],
    },
    {
      // News and events are one shared, global feed — there's no per-country
      // route for them yet, so nothing in this menu takes a tenant prefix.
      key: "news",
      label: t("news"),
      href: "/news",
      tenantAware: false,
      groups: [
        {
          key: "latestNews",
          icon: "newspaper",
          label: g("latestNews.title"),
          description: g("latestNews.description"),
          href: "/news",
          tenantAware: false,
          links: [
            { label: t("newsMenu.editorial"), href: "/news/editorial", tenantAware: false },
            { label: t("newsMenu.photoNews"), href: "/news/photo-news", tenantAware: false },
            { label: t("newsMenu.testimony"), href: "/news/testimony", tenantAware: false },
          ],
        },
        {
          key: "events",
          icon: "calendar",
          label: g("events.title"),
          description: g("events.description"),
          href: "/events",
          tenantAware: false,
          links: [],
        },
      ],
    },
  ];

  const plainLinks: NavLink[] = [
    // A single global directory of every country, not a per-country page.
    { label: t("ourNetwork"), href: "/network", tenantAware: false },
    { label: t("contactUs"), href: "/contact", tenantAware: true },
  ];

  return { menus, plainLinks };
}
