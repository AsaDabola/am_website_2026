import { COUNTRY_BY_CODE } from "./countrySites";

/**
 * The country site a path belongs to, as the prefix its own links carry —
 * "/de" while browsing Germany, "" on the main amintl.org site.
 *
 * Read from the path rather than from the request, because the components that
 * need it are the navigation's, and those render in the layout, above the
 * route that knows which country it is serving.
 */
export function tenantPrefixOf(pathname: string): string {
  const [first] = pathname.split("/").filter(Boolean);
  return first && COUNTRY_BY_CODE.has(first) ? `/${first}` : "";
}
