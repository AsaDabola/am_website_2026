import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageRenderer from "@/components/pages/PageRenderer";
import Media from "@/components/sections/Media";
import Events from "@/components/sections/Events";
import Newsletter from "@/components/sections/Newsletter";
import { isContinent, getTenantBySlug } from "@/lib/tenants";
import { getPageBySlug } from "@/lib/pages";

type Props = { params: Promise<{ locale: string; slug: string[] }> };

async function resolve(slug: string[]) {
  if (slug.length >= 2 && isContinent(slug[0])) {
    const tenant = await getTenantBySlug(slug[0], slug[1]);
    if (!tenant) return null;

    const restSlug = slug.slice(2).join("/");
    const page = await getPageBySlug(String(tenant.id), restSlug);
    return { tenant, page, isTenantRoute: true as const };
  }

  const page = await getPageBySlug(null, slug.join("/"));
  if (!page) return null;
  return { tenant: null, page, isTenantRoute: false as const };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved?.page) return {};

  return {
    title: resolved.page.meta?.title || `${resolved.page.title} | AM International`,
    description: resolved.page.meta?.description || undefined,
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolve(slug);

  if (!resolved) notFound();
  const { tenant, page, isTenantRoute } = resolved;

  // A tenant with no home Page yet still gets a minimal live page instead
  // of a 404, so a new country site works as soon as the Tenant is created.
  if (isTenantRoute && !page && slug.length === 2) {
    return (
      <>
        <PageRenderer
          page={{ title: tenant!.country, hero: { heading: tenant!.country } }}
          crumbs={[{ label: "Home", href: "/" }, { label: tenant!.country }]}
        />
        <Media tenantId={String(tenant!.id)} />
        <Events tenantId={String(tenant!.id)} />
        <Newsletter />
      </>
    );
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
      {isTenantRoute && slug.length === 2 && (
        <>
          <Media tenantId={String(tenant!.id)} />
          <Events tenantId={String(tenant!.id)} />
        </>
      )}
      <Newsletter />
    </>
  );
}
