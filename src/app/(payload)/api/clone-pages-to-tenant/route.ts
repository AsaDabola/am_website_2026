import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";

// Bulk-copies every main-site Page (tenant empty) into a given country
// Tenant, as a starting point an editor can then customize per country.
// Requires a logged-in admin session (same cookie the /admin UI uses).
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const { tenantId } = await request.json();
  if (!tenantId) {
    return NextResponse.json({ ok: false, message: "tenantId is required" }, { status: 400 });
  }

  const tenant = await payload.findByID({ collection: "tenants", id: tenantId }).catch(() => null);
  if (!tenant) {
    return NextResponse.json({ ok: false, message: "Tenant not found" }, { status: 404 });
  }

  const sourcePages = await payload.find({
    collection: "pages",
    where: { tenant: { exists: false } },
    limit: 500,
    depth: 0,
  });

  const created: string[] = [];
  const skipped: string[] = [];

  for (const source of sourcePages.docs) {
    const existing = await payload.find({
      collection: "pages",
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: source.slug } }] },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      skipped.push(source.slug || source.title);
      continue;
    }

    await payload.create({
      collection: "pages",
      data: {
        title: source.title,
        slug: source.slug,
        tenant: tenantId,
        isHome: source.isHome,
        published: source.published,
        navLabel: source.navLabel,
        hero: source.hero,
        body: source.body,
        meta: source.meta,
      },
    });
    created.push(source.slug || source.title);
  }

  return NextResponse.json({ ok: true, tenant: tenant.country, created, skipped });
}
