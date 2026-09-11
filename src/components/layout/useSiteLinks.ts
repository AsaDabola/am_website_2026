"use client";

import { useSitePathname } from "@/lib/useSitePathname";
import { tenantPrefixOf } from "@/lib/tenantPrefix";
import type { NavLink, NavMenu } from "@/components/layout/navigation";

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
  const prefix = tenantPrefixOf(useSitePathname());
  return links.filter((link) => link.scope === undefined || link.scope === prefix);
}

/**
 * The same rule applied inside the mega menu.
 *
 * A group's links were being rendered unfiltered, so a `scope` on one of them
 * was quietly ignored and the link showed on every country site — which the
 * type's own promise, that the nav drops a link whose site is not the one
 * being browsed, says it should not.
 */
export function useSiteMenus(menus: NavMenu[]): NavMenu[] {
  const prefix = tenantPrefixOf(useSitePathname());
  return menus.map((menu) => ({
    ...menu,
    groups: menu.groups.map((group) => ({
      ...group,
      links: group.links.filter((link) => link.scope === undefined || link.scope === prefix),
    })),
  }));
}
