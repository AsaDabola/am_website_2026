import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { buildHomeSections } from "@/lib/homeSections";
import { routing } from "@/i18n/routing";

// Bulk-copies every main-site Page (tenant empty) into a given country
// Tenant, as a starting point an editor can then customize per country.
// Requires a logged-in admin session (same cookie the /admin UI uses).
/**
 * Blocks and array rows carry their own row `id`s. Copied verbatim into a
 * `create`, Payload rejects them — so the clone has to hand over the content
 * and let the new page mint its own ids.
 *
 * Safe to walk blindly because the source is fetched at depth 0: related
 * documents are plain id values on their own field, never nested objects
 * with an `id` key of their own.
 */
function stripRowIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripRowIds(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === "id") continue;
      out[key] = stripRowIds(child);
    }
    return out as T;
  }
  return value;
}

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

  // The country's own language decides how its rebuilt home page reads.
  const tenantLocale =
    (tenant as { locale?: string | null }).locale || routing.defaultLocale;

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

    // A block-based home page is rebuilt from the message catalogue in this
    // country's own language rather than copied. Copying it verbatim handed a
    // German or Thai site the English wording and called it a starting point;
    // rebuilding gives the country its page already in its language, with any
    // copy changes it has made folded in. Other pages have no keys behind
    // them, so they are still copied as-is.
    const sections =
      source.isHome && Array.isArray(source.sections) && source.sections.length > 0
        ? await buildHomeSections(tenantLocale, String(tenantId))
        : stripRowIds(source.sections);

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
        // `sections` carries the block-based layout — the whole homepage, in
        // practice. Leaving it out of the copy produced a page that looked
        // cloned in the admin list and rendered blank on the country site.
        sections,
        meta: source.meta,
      },
    });
    created.push(source.slug || source.title);
  }

  return NextResponse.json({ ok: true, tenant: tenant.country, created, skipped });
}
