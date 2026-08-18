"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isContinent } from "@/lib/continents";

/**
 * Drop-in replacement for the site's <Link> used in shared navigation
 * chrome (Header, Footer, subnavs). While browsing a country site
 * (/{continent}/{slug}/...), it keeps that country prefixed on every
 * internal link instead of dropping back to the main amintl.org site —
 * e.g. clicking "Who We Are" from /europe/germany goes to
 * /europe/germany/about, not /about.
 *
 * Falls back to a plain relative link for pages that don't have tenant
 * content yet (the target route 404s the same way any missing page
 * would) and leaves external/absolute URLs untouched.
 */
export default function TenantLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const pathname = usePathname();

  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) {
    return <Link href={href} {...props} />;
  }

  const segments = pathname.split("/").filter(Boolean);
  const tenantPrefix =
    segments.length >= 2 && isContinent(segments[0]) ? `/${segments[0]}/${segments[1]}` : "";

  const isAlreadyPrefixed = tenantPrefix !== "" && href.startsWith(`${tenantPrefix}/`);
  const finalHref = tenantPrefix && !isAlreadyPrefixed ? `${tenantPrefix}${href}` : href;

  return <Link href={finalHref} {...props} />;
}
