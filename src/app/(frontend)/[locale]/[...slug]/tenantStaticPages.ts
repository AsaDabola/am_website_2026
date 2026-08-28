import type { Metadata } from "next";
import type { ComponentType } from "react";
import type { TenantRoute } from "@/lib/tenantRoutes";

/**
 * Search params reach the page below because the news listings read their
 * sort, page and page-size from them. Optional: every other page here ignores
 * them, and a country route is the only caller that has any to pass.
 */
type StaticPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type StaticPageModule = {
  default: ComponentType<StaticPageProps>;
  metadata?: Metadata;
};

/**
 * A country site should be a whole site, not just a homepage. Until an editor
 * authors a country-specific Page in the CMS, every route under
 * /{country}/… falls back to the main site's version so the
 * country site is browsable in full from the day it is created.
 *
 * Typed as an exhaustive Record over TenantRoute: adding a route to
 * lib/tenantRoutes without adding it here is a compile error, which is what
 * keeps links and renderable pages from drifting apart.
 *
 * Paths are relative rather than "@/app/…" because the route directory names
 * contain brackets and parentheses, which are awkward in module specifiers.
 */
export const TENANT_STATIC_PAGES: Record<TenantRoute, () => Promise<StaticPageModule>> = {
  "/about": () => import("../about/page"),
  "/about/mission": () => import("../about/mission/page"),
  "/about/statement-of-faith": () => import("../about/statement-of-faith/page"),
  "/about/history": () => import("../about/history/page"),
  "/about/chairman": () => import("../about/chairman/page"),
  "/about/leadership": () => import("../about/leadership/page"),
  "/about/membership": () => import("../about/membership/page"),

  "/what-we-do/pillars-of-mission": () => import("../what-we-do/pillars-of-mission/page"),
  "/what-we-do/administration": () => import("../what-we-do/administration/page"),

  "/bible-study": () => import("../bible-study/page"),
  "/bible-study/join": () => import("../bible-study/join/page"),

  "/get-involved": () => import("../get-involved/page"),
  "/get-involved/volunteer": () => import("../get-involved/volunteer/page"),
  "/get-involved/internship": () => import("../get-involved/internship/page"),
  "/get-involved/group-activities": () => import("../get-involved/group-activities/page"),
  "/get-involved/bible-teacher-training": () =>
    import("../get-involved/bible-teacher-training/page"),
  "/get-involved/chapter-affiliation": () => import("../get-involved/chapter-affiliation/page"),
  "/get-involved/chapter-staff": () => import("../get-involved/chapter-staff/page"),
  "/get-involved/alumni-connect": () => import("../get-involved/alumni-connect/page"),
  "/get-involved/online-bible-study": () => import("../get-involved/online-bible-study/page"),
  "/get-involved/donate": () => import("../get-involved/donate/page"),

  "/news": () => import("../news/page"),
  "/news/editorial": () => import("../news/editorial/page"),
  "/news/photo-news": () => import("../news/photo-news/page"),
  "/news/testimony": () => import("../news/testimony/page"),
  "/events": () => import("../events/page"),

  "/contact": () => import("../contact/page"),
};

/** Looks up the fallback page for a country-relative slug like "about/history". */
export function getTenantStaticPage(restSlug: string) {
  return TENANT_STATIC_PAGES[`/${restSlug}` as TenantRoute] ?? null;
}
