import type { MetadataRoute } from "next";
import { getAllActiveTenantsByContinent } from "@/lib/tenants";
import { routing } from "@/i18n/routing";
import { CODE_FOR_SLUG } from "@/lib/countrySites";

const SITE_URL = "https://amintl.org";

// The main site's most important pages. Country sites (below) matter more
// for the "does AM Germany show up as its own thing" goal, so this list
// stays focused rather than trying to enumerate every route.
const MAIN_SITE_PATHS = [
  "",
  "/about",
  "/about/mission",
  "/about/statement-of-faith",
  "/about/history",
  "/about/leadership",
  "/about/chairman",
  "/about/membership",
  "/what-we-do/pillars-of-mission",
  "/what-we-do/administration",
  "/bible-study",
  "/get-involved",
  "/get-involved/volunteer",
  "/get-involved/donate",
  "/get-involved/chapter-affiliation",
  "/network",
  "/news",
  "/events",
  "/contact",
];

/**
 * The languages a page is readable in, as the addresses that serve them.
 *
 * There is no language in an address any more: the main site is English, and
 * each country site is read in its own language at its own two letters. So the
 * alternates for a page are that page on every country site whose language
 * differs, plus the English original — which is what hreflang is for, and it
 * is now true rather than a list of 48 URLs that mostly redirect.
 */
function alternatesFor(path: string, countries: { code: string; locale: string }[]) {
  const languages: Record<string, string> = { "x-default": `${SITE_URL}${path}`, en: `${SITE_URL}${path}` };
  for (const { code, locale } of countries) {
    // One address per language: several countries share a language, and the
    // first one listed speaks for it.
    languages[`${locale}-${code.toUpperCase()}`] = `${SITE_URL}/${code}${path}`;
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenantsByContinent = await getAllActiveTenantsByContinent();
  const live = Object.values(tenantsByContinent)
    .flat()
    .map((tenant) => ({
      code: CODE_FOR_SLUG.get(tenant.slug),
      locale: tenant.locale ?? routing.defaultLocale,
    }))
    .filter((row): row is { code: string; locale: string } => Boolean(row.code));

  const mainSiteEntries: MetadataRoute.Sitemap = MAIN_SITE_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    alternates: alternatesFor(path, live),
  }));

  // Each country's home page, at the address it is served from — no redirect
  // hop for a crawler to follow.
  const tenantEntries: MetadataRoute.Sitemap = live.map(({ code }) => ({
    url: `${SITE_URL}/${code}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: alternatesFor("", live),
  }));

  return [...mainSiteEntries, ...tenantEntries];
}
