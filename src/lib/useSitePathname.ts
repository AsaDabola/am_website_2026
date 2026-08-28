"use client";

import { usePathname } from "next/navigation";

/**
 * The address as the browser has it — which is the only reading that can
 * identify a country site.
 *
 * next-intl's own `usePathname` takes the language off the front, and it
 * decides what a language looks like by name. A country's code is two letters
 * and several of them spell a language: /fr is France, /de is Germany, /it is
 * Italy. Those came back as "/" — the language stripped and the country with
 * it — so France's header showed the international wordmark while its pages
 * were correctly in French.
 *
 * There is no language in the address to strip any more, so the raw pathname
 * is the right one everywhere. Only links go through next-intl.
 */
export function useSitePathname(): string {
  return usePathname();
}
