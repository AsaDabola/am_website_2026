import type { MetadataRoute } from "next";
import { getAllActiveTenantsByContinent } from "@/lib/tenants";
import { routing } from "@/i18n/routing";

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
 * hreflang alternates for one path, in every language the site ships.
 *
 * Routing is `localePrefix: "as-needed"`, so English lives at the bare path
 * and every other locale is prefixed — the same shape the pages themselves
 * serve, which is what keeps the alternates from pointing at redirects.
 * `x-default` goes to the unprefixed URL for anyone whose language AM does
 * not have yet.
 */
function alternatesFor(path: string) {
  const languages: Record<string, string> = { "x-default": `${SITE_URL}${path}` };
  for (const locale of routing.locales) {
    languages[locale] =
      locale === routing.defaultLocale
        ? `${SITE_URL}${path}`
        : `${SITE_URL}/${locale}${path}`;
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mainSiteEntries: MetadataRoute.Sitemap = MAIN_SITE_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    alternates: alternatesFor(path),
  }));

  const tenantsByContinent = await getAllActiveTenantsByContinent();
  const tenantEntries: MetadataRoute.Sitemap = Object.entries(tenantsByContinent).flatMap(
    ([continent, tenants]) =>
      tenants.map((tenant) => {
        // Link the canonical, tenant-locale URL directly (matching the
        // redirect the site itself performs) so crawlers land on the final
        // page instead of following a redirect hop.
        const path = `/${continent}/${tenant.slug}`;
        const localePrefix =
          tenant.locale && tenant.locale !== routing.defaultLocale ? `/${tenant.locale}` : "";
        return {
          url: `${SITE_URL}${localePrefix}${path}`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: alternatesFor(path),
        };
      }),
  );

  return [...mainSiteEntries, ...tenantEntries];
}
