"use client";

import { usePathname } from "@/i18n/navigation";
import { tenantPrefixOf } from "@/lib/tenantPrefix";
import type { NavLink } from "@/components/layout/navigation";

/**
 * The nav links that belong on the site being browsed.
 *
 * The menu is built in the layout, which renders above the route and so cannot
 * know which country is being served; every editor-added page in the network
 * is handed down and the ones from other countries are dropped here, where the
 * path is known. Links with no site of their own — the fixed navigation — are
 * kept everywhere.
 */
export function useSiteLinks(links: NavLink[]): NavLink[] {
  const prefix = tenantPrefixOf(usePathname());
  return links.filter((link) => link.scope === undefined || link.scope === prefix);
}
