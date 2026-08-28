import { COUNTRY_SLUGS } from "./countrySites";

/**
 * The country site a path belongs to, or null for the main site.
 *
 * Country sites live at /{slug}/…, and several pieces of the
 * layout — the logo, the footer's organisation block, the hero's stats —
 * need to know which one they are on. They all run in the layout, above the
 * point where the tenant route records the tenant for the request, so the
 * store is not set yet when they render; the path is, and it is unambiguous.
 *
 * Pass a next-intl pathname, which has the locale prefix already stripped.
 */
export function countryFromPath(pathname: string): { slug: string; key: string } | null {
  const [first] = pathname.split("/").filter(Boolean);
  if (!first || !COUNTRY_SLUGS.has(first)) return null;
  // Key and slug are the same thing now that the continent is out of the
  // path. Both are kept so the callers reading one or the other still read.
  return { slug: first, key: first };
}

/**
 * Country sites that speak for head office, so they carry its address rather
 * than one of their own: the United States is where it is, and Canada is run
 * from it.
 */
export const HEAD_OFFICE_KEYS = new Set(["united-states", "canada"]);

/**
 * The main site's version of a country page.
 *
 * "/germany/about" on AM Germany is "/about" on amintl.org, so going
 * international from a country's Contact page lands on the international
 * Contact page rather than dropping the reader at the top of the site. A
 * country's home page has no main-site counterpart beyond the home page
 * itself.
 *
 * Takes a next-intl pathname, which has the language stripped already; the
 * language of what comes back is decided by the link that uses it.
 */
export function mainSiteHref(pathname: string): string {
  const here = countryFromPath(pathname);
  if (!here) return "/";
  const rest = pathname.slice(`/${here.slug}`.length);
  return rest && rest !== "/" ? rest : "/";
}
