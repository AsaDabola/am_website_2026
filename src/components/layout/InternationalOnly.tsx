"use client";

import type { ReactNode } from "react";
import { useSitePathname } from "@/lib/useSitePathname";
import { tenantPrefixOf } from "@/lib/tenantPrefix";

/**
 * Renders its children only on amintl.org, not on a country site.
 *
 * For the handful of pages that exist once for the whole network — the campus
 * tour is one — a link in a country site's footer would carry the reader off
 * that site without saying so. The footer is a server component rendered above
 * the route, so which country is being served is only knowable from the path,
 * which is what this reads.
 */
export default function InternationalOnly({ children }: { children: ReactNode }) {
  return tenantPrefixOf(useSitePathname()) ? null : <>{children}</>;
}
