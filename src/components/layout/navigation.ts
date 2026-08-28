import { getTranslations } from "@/i18n/content";
import { getNavPages } from "@/lib/pages";
import type { NavIconName } from "@/components/ui/icons";

export type NavLink = {
  label: string;
  href: string;
  /** Prefixed with the current country site when browsing one. */
  tenantAware: boolean;
  /**
   * Set only on links that come from an editor-managed Page: the site that
   * page belongs to ("" for the main site). The nav drops a link whose site
   * is not the one being browsed. A link without this belongs everywhere.
   */
  scope?: string;
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
      // A country site has its own news: the listings filter by the country
      // being browsed, so these carry the prefix rather than sending a reader
      // back to the main site to read it.
      key: "news",
      label: t("news"),
      href: "/news",
      tenantAware: true,
      groups: [
        {
          key: "latestNews",
          icon: "newspaper",
          label: g("latestNews.title"),
          description: g("latestNews.description"),
          href: "/news",
          tenantAware: true,
          links: [
            { label: t("newsMenu.editorial"), href: "/news/editorial", tenantAware: true },
            { label: t("newsMenu.photoNews"), href: "/news/photo-news", tenantAware: true },
            { label: t("newsMenu.testimony"), href: "/news/testimony", tenantAware: true },
          ],
        },
        {
          key: "events",
          icon: "calendar",
          label: g("events.title"),
          description: g("events.description"),
          href: "/events",
          tenantAware: true,
          links: [],
        },
      ],
    },
  ];

  const plainLinks: NavLink[] = [
    // A single global directory of every country, not a per-country page.
    { label: t("ourNetwork"), href: "/network", tenantAware: false },
    { label: t("contactUs"), href: "/contact", tenantAware: true },

    // Pages added in /admin with a Nav Label, after the fixed links so a new
    // page never pushes the site's own navigation around. Their addresses are
    // already complete — a page written for one country is served under that
    // country and nowhere else — so they are not tenant-aware.
    ...(await getNavPages()).map(({ label, href, scope }) => ({
      label,
      href,
      tenantAware: false,
      scope,
    })),
  ];

  return { menus, plainLinks };
}
