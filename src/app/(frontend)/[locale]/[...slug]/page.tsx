import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestTenant } from "@/lib/tenantContent";
import { getContentMessages } from "@/i18n/content";
import PageRenderer from "@/components/pages/PageRenderer";
import LivePreviewListener from "@/components/pages/LivePreviewListener";
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

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
  /**
   * Forwarded to whichever page renders below. The news listings read sort,
   * page and per-page from here; without it a country's listing would answer
   * every page of its own pagination with page one.
   */
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function DynamicPage({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const resolved = await resolve(slug);

  if (!resolved) notFound();
  const { tenant, page, isTenantRoute } = resolved;

  // Declare which country is being rendered before any content below runs, so
  // the tenant-aware `getTranslations` in @/i18n/content layers this
  // country's copy changes over the main version, and so a feed scoped to
  // this country also picks up whatever was released to its continent. Off a
  // country route both stay null and everything reads the main copy.
  setRequestTenant(
    isTenantRoute && tenant ? String(tenant.id) : null,
    isTenantRoute && tenant && isContinent(tenant.continent) ? tenant.continent : null,
  );

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

  // Server components pick up this country's copy through the request store
  // above, but client components ("use client" subnavs, the network map) read
  // their messages from a provider instead. On a country route the subtree
  // gets its own provider carrying the merged catalogue, so both halves of
  // the page say the same thing.
  const wrap = async (node: React.ReactNode) => {
    // Every branch below returns through here, so the admin's Live Preview
    // listener only needs mounting once.
    const withPreview = (
      <>
        <LivePreviewListener />
        {node}
      </>
    );
    return isTenantRoute ? (
      <NextIntlClientProvider messages={await getContentMessages()}>
        {withPreview}
      </NextIntlClientProvider>
    ) : (
      withPreview
    );
  };

  // A country site's home route renders the same rich, block-based
  // homepage as the main site — scoped to that tenant's own posts, events,
  // and chapters. An editor customizes it per country by authoring a home
  // Page (with `sections`) for that Tenant in /admin; until then, every new
  // country site still gets the full marketing homepage instead of a bare
  // stub, so it reads as a real, complete site from day one.
  if (isTenantHome) {
    const tenantId = String(tenant!.id);

    if (page?.sections?.length) {
      return wrap(<>{page.sections.map((block) => renderHomeBlock(block, tenantId))}</>);
    }

    if (page) {
      const crumbs = [{ label: "Home", href: "/" }, { label: tenant!.country }];
      return wrap(
        <>
          <PageRenderer page={page} crumbs={crumbs} />
          <Media tenantId={tenantId} />
          <Events tenantId={tenantId} />
          <PartnerWithUs />
          <Newsletter />
        </>,
      );
    }

    return wrap(<DefaultHomeBlocks tenantId={tenantId} />);
  }

  // No country-specific Page authored yet — serve the main site's version of
  // this route rather than a 404, so every country site is browsable in full
  // from the day it is created.
  if (!page && isTenantRoute) {
    const loadStaticPage = getTenantStaticPage(resolved.restSlug);
    if (loadStaticPage) {
      const { default: StaticPage } = await loadStaticPage();
      return wrap(<StaticPage searchParams={searchParams} />);
    }

    // An article read from a country's listing stays on that country's site.
    // Its slug cannot be in the static map — that map is exact paths — so it
    // is matched here and given the params the article page expects.
    const article = /^news\/(.+)$/.exec(resolved.restSlug);
    if (article) {
      const { default: ArticlePage } = await import("../news/[slug]/page");
      return wrap(<ArticlePage params={Promise.resolve({ locale, slug: article[1] })} />);
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

  return wrap(
    <>
      <PageRenderer page={page} crumbs={crumbs} />
      <Newsletter />
    </>,
  );
}
