/**
 * Every route a country site serves.
 *
 * This is the single source of truth for two things that must agree: which
 * pages `/{country}/…` can render, and which links get a country
 * prefix while browsing one. Keeping them in one list is what stops a link
 * from pointing at a country URL that 404s.
 *
 * The network directory is deliberately absent — it is one global list of
 * every country and always resolves to the main site, as does internal
 * tooling. News and events are here: the listings already filter by the
 * country being browsed (see syndicationWhere in lib/posts), so a country
 * site has its own feed to show and a link into the shared one was taking
 * readers off the country site to see it.
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

  "/news",
  "/news/editorial",
  "/news/photo-news",
  "/events",

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
