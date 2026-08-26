import { isContinent } from "./continents";

/**
 * The country site a path belongs to, or null for the main site.
 *
 * Country sites live at /{continent}/{slug}/…, and several pieces of the
 * layout — the logo, the footer's organisation block, the hero's stats —
 * need to know which one they are on. They all run in the layout, above the
 * point where the tenant route records the tenant for the request, so the
 * store is not set yet when they render; the path is, and it is unambiguous.
 *
 * Pass a next-intl pathname, which has the locale prefix already stripped.
 */
export function countryFromPath(pathname: string): { slug: string; key: string } | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2 || !isContinent(segments[0])) return null;
  return { slug: segments[1], key: `${segments[0]}/${segments[1]}` };
}

/**
 * Country sites that speak for head office, so they carry its address rather
 * than one of their own: the United States is where it is, and Canada is run
 * from it.
 */
export const HEAD_OFFICE_KEYS = new Set(["northamerica/united-states", "northamerica/canada"]);
