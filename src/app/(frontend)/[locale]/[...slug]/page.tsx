import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageRenderer from "@/components/pages/PageRenderer";
import Media from "@/components/sections/Media";
import Events from "@/components/sections/Events";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { isContinent, getTenantBySlug } from "@/lib/tenants";
import { getPageBySlug } from "@/lib/pages";
import { renderHomeBlock, DefaultHomeBlocks } from "@/lib/renderHomeBlocks";
import { redirect } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { getTenantStaticPage } from "./tenantStaticPages";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; slug: string[] }> };

async function resolve(slug: string[]) {
  if (slug.length >= 2 && isContinent(slug[0])) {
    const tenant = await getTenantBySlug(slug[0], slug[1]);
    if (!tenant) return null;

    const restSlug = slug.slice(2).join("/");
    const page = await getPageBySlug(String(tenant.id), restSlug);
    return { tenant, page, restSlug, isTenantRoute: true as const };
  }

  const page = await getPageBySlug(null, slug.join("/"));
  if (!page) return null;
  return { tenant: null, page, restSlug: "", isTenantRoute: false as const };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved) return {};

  if (resolved.page) {
    return {
      title: resolved.page.meta?.title || `${resolved.page.title} | AM International`,
      description: resolved.page.meta?.description || undefined,
    };
  }

  // A tenant home route with no Page doc yet still gets real, unique
  // metadata — this (plus the sitemap and the tenant-locale redirect) is
  // what lets a country's site surface as its own result in search rather
  // than just as a path under the main site.
  if (resolved.isTenantRoute && slug.length === 2) {
    const tenant = resolved.tenant!;
    return {
      title: `AM ${tenant.country} | Apostolos Missions International`,
      description: `Apostolos Missions International in ${tenant.country}${tenant.city ? ` (${tenant.city})` : ""} — an interdenominational ministry spreading the gospel and sending students out on mission.`,
    };
  }

  // Inherit the fallback page's own metadata, re-branded for this country so
  // the two versions don't compete for the same search result.
  if (resolved.isTenantRoute) {
    const loadStaticPage = getTenantStaticPage(resolved.restSlug);
    if (loadStaticPage) {
      const { metadata = {} } = await loadStaticPage();
      const country = resolved.tenant!.country;
      const ownTitle =
        typeof metadata.title === "string" ? metadata.title.split(" | ")[0] : null;

      return {
        ...metadata,
        title: ownTitle ? `${ownTitle} | AM ${country}` : `AM ${country}`,
      };
    }
  }

  return {};
}

export default async function DynamicPage({ params }: Props) {
  const { slug, locale } = await params;
  const resolved = await resolve(slug);

  if (!resolved) notFound();
  const { tenant, page, isTenantRoute } = resolved;

  // Every country site has one language it's meant to be browsed in
  // (Tenant.locale). Landing on it under a different locale — e.g. a link
  // that dropped the prefix, or a visitor's browser default — redirects to
  // the same page under the tenant's own language instead of silently
  // serving the wrong one.
  if (
    isTenantRoute &&
    tenant!.locale &&
    tenant!.locale !== locale &&
    (locales as readonly string[]).includes(tenant!.locale)
  ) {
    redirect({ href: `/${slug.join("/")}`, locale: tenant!.locale });
  }

  const isTenantHome = isTenantRoute && slug.length === 2;

  // A country site's home route renders the same rich, block-based
  // homepage as the main site — scoped to that tenant's own posts, events,
  // and chapters. An editor customizes it per country by authoring a home
  // Page (with `sections`) for that Tenant in /admin; until then, every new
  // country site still gets the full marketing homepage instead of a bare
  // stub, so it reads as a real, complete site from day one.
  if (isTenantHome) {
    const tenantId = String(tenant!.id);

    if (page?.sections?.length) {
      return <>{page.sections.map((block) => renderHomeBlock(block, tenantId))}</>;
    }

    if (page) {
      const crumbs = [{ label: "Home", href: "/" }, { label: tenant!.country }];
      return (
        <>
          <PageRenderer page={page} crumbs={crumbs} />
          <Media tenantId={tenantId} />
          <Events tenantId={tenantId} />
          <PartnerWithUs />
          <Newsletter />
        </>
      );
    }

    return <DefaultHomeBlocks tenantId={tenantId} />;
  }

  // No country-specific Page authored yet — serve the main site's version of
  // this route rather than a 404, so every country site is browsable in full
  // from the day it is created.
  if (!page && isTenantRoute) {
    const loadStaticPage = getTenantStaticPage(resolved.restSlug);
    if (loadStaticPage) {
      const { default: StaticPage } = await loadStaticPage();
      return <StaticPage />;
    }
  }

  if (!page) notFound();

  const crumbs = isTenantRoute
    ? [
        { label: "Home", href: "/" },
        { label: tenant!.country, href: `/${slug[0]}/${slug[1]}` },
        { label: page.title },
      ]
    : [{ label: "Home", href: "/" }, { label: page.title }];

  return (
    <>
      <PageRenderer page={page} crumbs={crumbs} />
      <Newsletter />
    </>
  );
}
