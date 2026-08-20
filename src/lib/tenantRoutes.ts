/**
 * Every route a country site serves.
 *
 * This is the single source of truth for two things that must agree: which
 * pages `/{continent}/{country}/…` can render, and which links get a country
 * prefix while browsing one. Keeping them in one list is what stops a link
 * from pointing at a country URL that 404s.
 *
 * News, events and the network directory are deliberately absent — they are
 * one shared feed for the whole organisation and always resolve to the main
 * site, as does internal tooling.
 *
 * Plain data with no imports, so the client-side TenantLink can use it too.
 */
export const TENANT_ROUTES = [
  "/about",
  "/about/mission",
  "/about/statement-of-faith",
  "/about/history",
  "/about/chairman",
  "/about/leadership",
  "/about/membership",

  "/what-we-do/pillars-of-mission",
  "/what-we-do/administration",

  "/bible-study",
  "/bible-study/join",

  "/get-involved",
  "/get-involved/volunteer",
  "/get-involved/internship",
  "/get-involved/group-activities",
  "/get-involved/bible-teacher-training",
  "/get-involved/chapter-affiliation",
  "/get-involved/chapter-staff",
  "/get-involved/alumni-connect",
  "/get-involved/online-bible-study",
  "/get-involved/donate",

  "/contact",
] as const;

export type TenantRoute = (typeof TENANT_ROUTES)[number];

const TENANT_ROUTE_SET: ReadonlySet<string> = new Set(TENANT_ROUTES);

/**
 * True when `href` should carry the current country prefix. "/" counts: the
 * logo on a country site belongs to that country's home, not the main site.
 */
export function isTenantAwareHref(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;

  const path = href.split(/[?#]/)[0];
  const normalised = path.length > 1 ? path.replace(/\/+$/, "") : path;

  return normalised === "/" || TENANT_ROUTE_SET.has(normalised);
}
