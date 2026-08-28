"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isTenantAwareHref } from "@/lib/tenantRoutes";
import { tenantPrefixOf } from "@/lib/tenantPrefix";

/**
 * Drop-in replacement for the site's <Link>. While browsing a country site
 * (/{slug}/...), it keeps that country prefixed on internal
 * links instead of dropping back to the main amintl.org site — e.g. clicking
 * "Who We Are" from /germany goes to /germany/about, not
 * /about.
 *
 * Only routes a country site actually serves get prefixed (see
 * lib/tenantRoutes). Everything else — the shared news/events feeds, the
 * network directory, external URLs — is left alone, so a link can never point
 * at a country URL that doesn't exist.
 */
export default function TenantLink({ href, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();

  if (typeof href !== "string" || !isTenantAwareHref(href)) {
    return <Link href={href} {...props} />;
  }

  const tenantPrefix = tenantPrefixOf(pathname);

  if (!tenantPrefix || href === tenantPrefix || href.startsWith(`${tenantPrefix}/`)) {
    return <Link href={href} {...props} />;
  }

  // "/" is the country home itself, so it becomes the bare prefix rather than
  // picking up a trailing slash.
  return <Link href={href === "/" ? tenantPrefix : `${tenantPrefix}${href}`} {...props} />;
}
