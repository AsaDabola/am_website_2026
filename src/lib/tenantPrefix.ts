import { isContinent } from "./continents";

/**
 * The country site a path belongs to, as the prefix its own links carry —
 * "/europe/germany" while browsing Germany, "" on the main amintl.org site.
 *
 * Read from the path rather than from the request, because the components that
 * need it are the navigation's, and those render in the layout, above the
 * route that knows which country it is serving.
 */
export function tenantPrefixOf(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 2 && isContinent(segments[0])
    ? `/${segments[0]}/${segments[1]}`
    : "";
}
