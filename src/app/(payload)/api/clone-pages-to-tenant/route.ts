import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { buildHomeSections } from "@/lib/homeSections";
import { routing } from "@/i18n/routing";
import { continentsOf, isSuperAdmin, tenantIds } from "@/lib/adminAccess";

// Copies every main-site Page (tenant empty) into a country Tenant, as the
// starting point an editor then customizes. Until a country has its own
// copies, its Pages list in /admin is empty and its site renders the coded
// fallback pages — so this is what makes a country site editable at all.
//
// Called with a `tenantId` it does one country. Called without one it works
// through every active country that is missing pages, `limit` at a time, and
// reports how many are left; that keeps a single request inside the function
// timeout and makes the whole thing safe to repeat until `remaining` is 0.
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

/**
 * Whether this person may write into that country.
 *
 * This used to be "is anyone signed in", which was the whole check: the
 * tenant came from the request body, and the clone writes through the local
 * API, which bypasses access control. One country's admin could therefore
 * fill another country's site with pages. That mattered little when a handful
 * of people had accounts and matters a great deal now that every country has
 * one.
 */
function mayWriteInto(user: unknown, tenant: { id: number | string; continent?: string | null }) {
  if (isSuperAdmin(user)) return true;
  if (tenantIds(user).some((id) => String(id) === String(tenant.id))) return true;
  const continents = continentsOf(user);
  return Boolean(tenant.continent && continents.includes(tenant.continent as never));
}

type TenantRecord = {
  id: number | string;
  country: string;
  continent?: string | null;
  locale?: string | null;
};

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { tenantId } = body as { tenantId?: number | string };

  // No tenant named: every active country that has no pages yet, a few at a
  // time. Writing into all of them at once is a super admin's call.
  if (!tenantId) {
    if (!isSuperAdmin(user)) {
      return NextResponse.json(
        { ok: false, message: "Only a super admin can clone pages for every country." },
        { status: 403 },
      );
    }
    return cloneForEveryTenant(payload, Number((body as { limit?: number }).limit) || 5);
  }

  const tenant = (await payload
    .findByID({ collection: "tenants", id: tenantId })
    .catch(() => null)) as TenantRecord | null;
  if (!tenant) {
    return NextResponse.json({ ok: false, message: "Tenant not found" }, { status: 404 });
  }

  if (!mayWriteInto(user, tenant)) {
    return NextResponse.json(
      { ok: false, message: "That country is not yours to add pages to." },
      { status: 403 },
    );
  }

  const result = await cloneInto(payload, tenant);
  return NextResponse.json({ ok: true, tenant: tenant.country, ...result });
}

/**
 * Copies the main site's pages into one country, skipping any slug it
 * already has — so a re-run tops a country up rather than duplicating it.
 */
async function cloneInto(
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenant: TenantRecord,
) {
  // The country's own language decides how its rebuilt home page reads.
  const tenantLocale = tenant.locale || routing.defaultLocale;

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
      where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: source.slug } }] },
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
        ? await buildHomeSections(tenantLocale, String(tenant.id))
        : stripRowIds(source.sections);

    await payload.create({
      collection: "pages",
      data: {
        title: source.title,
        slug: source.slug,
        tenant: tenant.id,
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

  return { created, skipped };
}

/**
 * Works through the active countries that have no pages of their own.
 *
 * `limit` countries per call, with `remaining` reporting the rest, because
 * cloning every page into sixty-odd countries is thousands of queries and a
 * single request would not survive the function timeout. Re-running is safe:
 * a country that already has a slug keeps it, so the caller just repeats
 * until `remaining` reaches 0.
 */
async function cloneForEveryTenant(
  payload: Awaited<ReturnType<typeof getPayload>>,
  limit: number,
) {
  const tenants = (await payload.find({
    collection: "tenants",
    where: { active: { equals: true } },
    limit: 500,
    depth: 0,
    sort: "country",
  })) as unknown as { docs: TenantRecord[] };

  const pending: TenantRecord[] = [];
  for (const tenant of tenants.docs) {
    const owned = await payload.count({
      collection: "pages",
      where: { tenant: { equals: tenant.id } },
    });
    if (owned.totalDocs === 0) pending.push(tenant);
  }

  const batch = pending.slice(0, Math.max(1, limit));
  const done: { tenant: string; created: number }[] = [];

  for (const tenant of batch) {
    const { created } = await cloneInto(payload, tenant);
    done.push({ tenant: tenant.country, created: created.length });
  }

  const remaining = pending.length - batch.length;
  return NextResponse.json({
    ok: true,
    done,
    remaining,
    message:
      remaining > 0
        ? `Gave ${done.length} more country site(s) their pages; ${remaining} still to go — run it again.`
        : `Gave ${done.length} country site(s) their pages. Every active country now has its own.`,
  });
}
