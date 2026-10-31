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

  const limit = Number((body as { limit?: number }).limit) || 5;

  // Pages copied before the clone carried `builtIn` arrived as ordinary empty
  // pages and shadow the coded ones they describe. Repairing is separate from
  // cloning because it touches countries that already have pages, which
  // cloning deliberately leaves alone.
  if ((body as { repair?: boolean }).repair) {
    return repairMine(payload, user, limit);
  }

  // No tenant named means "the countries I am responsible for": every active
  // one for a super admin, and your own for everybody else — a country admin
  // should not have to know their tenant's numeric id to set their own site
  // up. Either way it works through them a few at a time.
  if (!tenantId) {
    return cloneForMine(payload, user, limit);
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
 * A value that could be a media document: an id, not a file path.
 *
 * The home blocks carry `defaultValue` rows (see withHomeDefaults in
 * blocks/homeBlocks.ts) whose images are the paths the site ships —
 * "/images/hero-slide-bible-study.webp" — rather than rows in the media
 * table. An upload field wants an id, so a path fails validation exactly the
 * way an empty value does.
 */
function isMediaRef(value: unknown): boolean {
  if (typeof value === "number") return true;
  if (value && typeof value === "object") return true;
  return typeof value === "string" && value !== "" && !value.startsWith("/");
}

/** The arrays on a home block whose rows each require a picture. */
const PICTURE_ROWS = ["slides", "cards"] as const;

/**
 * Puts the main site's pictures back on a rebuilt home page.
 *
 * The home page is rebuilt from the message catalogue rather than copied, so
 * the country gets its own language rather than English to translate — but
 * rebuilding only produces words, and the blocks it leaves empty are then
 * filled by their `defaultValue`, which carries shipped file paths an upload
 * field cannot accept. A photograph is not language-specific, so the right
 * source for it is the page being cloned: the country gets the same pictures
 * as the main site, with its own wording over them.
 */
function carryPicturesFromSource(rebuilt: unknown, source: unknown): unknown {
  if (!Array.isArray(rebuilt) || !Array.isArray(source)) return rebuilt;

  const byType = new Map<string, Record<string, unknown>>();
  for (const block of source as Record<string, unknown>[]) {
    const type = block && typeof block === "object" ? block.blockType : undefined;
    if (typeof type === "string" && !byType.has(type)) byType.set(type, block);
  }

  return (rebuilt as Record<string, unknown>[]).map((block) => {
    const from = byType.get(String(block?.blockType));
    if (!from) return block;

    const merged: Record<string, unknown> = { ...block };
    for (const rows of PICTURE_ROWS) {
      if (Array.isArray(from[rows])) merged[rows] = stripRowIds(from[rows]);
    }
    for (const single of ["backgroundImage", "image"]) {
      if (isMediaRef(from[single])) merged[single] = from[single];
    }
    return merged;
  });
}

/**
 * Drops the rows the source page has but Payload will not accept back.
 *
 * A hero slide and a Get Involved card each require an image. The main site
 * has rows that do not have one: its content was put there by the hand-written
 * SQL migrations and the seed script, neither of which runs Payload's
 * validation, so the page reads fine and renders fine and cannot be written
 * back through `create`. Copying one verbatim threw, and because the throw
 * escaped the loop it took the whole batch with it — which is what turned a
 * clone of sixty-eight countries into a 500 with some countries half done.
 *
 * A slide or a card with no image cannot draw anything anyway, so leaving it
 * out costs nothing and is reported rather than done quietly. A cards block
 * left with none is dropped whole: the field requires at least one row, and a
 * block that cannot hold a row cannot be saved.
 */
function dropRowsPayloadWontAccept(sections: unknown): { sections: unknown; dropped: string[] } {
  if (!Array.isArray(sections)) return { sections, dropped: [] };
  const dropped: string[] = [];

  const kept = sections.flatMap((block) => {
    if (!block || typeof block !== "object") return [block];
    const b = block as Record<string, unknown>;

    for (const rows of PICTURE_ROWS) {
      if (!Array.isArray(b[rows])) continue;
      const before = (b[rows] as unknown[]).length;
      const after = (b[rows] as Record<string, unknown>[]).filter((row) => isMediaRef(row?.image));
      if (after.length === before) continue;

      dropped.push(`${String(b.blockType)}: ${before - after.length} ${rows} with no usable image`);
      if (rows === "cards" && after.length === 0) {
        dropped.push(`${String(b.blockType)}: block dropped, it needs at least one card`);
        return [];
      }
      b[rows] = after;
    }
    return [b];
  });

  return { sections: kept, dropped };
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
  const failed: { page: string; why: string }[] = [];
  const dropped: string[] = [];

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
    const rebuilt =
      source.isHome && Array.isArray(source.sections) && source.sections.length > 0
        ? carryPicturesFromSource(
            await buildHomeSections(tenantLocale, String(tenant.id)),
            source.sections,
          )
        : stripRowIds(source.sections);
    const { sections, dropped: lost } = dropRowsPayloadWontAccept(rebuilt);
    for (const note of lost) dropped.push(`${source.slug || source.title} — ${note}`);

    // One unsaveable page must not cost the country its other thirty, nor the
    // countries after it in the batch. Record why and carry on.
    try {
      await payload.create({
        collection: "pages",
        data: {
          title: source.title,
          slug: source.slug,
          tenant: tenant.id,
          isHome: source.isHome,
          published: source.published,
          navLabel: source.navLabel,
          /**
           * Carried across, and they were not before.
           *
           * A built-in page is React and its record describes it: `builtIn`
           * says so, and `layoutMode` plus `layout` say what a site has added
           * around the coded design. Copying a page without them turned the
           * country's /news from the news listing into an empty record, and
           * silently dropped whatever sections the main site had added to
           * every page it shipped.
           */
          builtIn: source.builtIn,
          layoutMode: source.layoutMode,
          layout: stripRowIds(source.layout),
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
    } catch (error) {
      failed.push({
        page: source.slug || source.title,
        why: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { created, skipped, failed, dropped };
}

/**
 * Works through the countries this person is responsible for that have no
 * pages of their own.
 *
 * `limit` countries per call, with `remaining` reporting the rest, because
 * cloning every page into sixty-odd countries is thousands of queries and a
 * single request would not survive the function timeout. Re-running is safe:
 * a country that already has a slug keeps it, so the caller just repeats
 * until `remaining` reaches 0.
 */
async function cloneForMine(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: unknown,
  limit: number,
) {
  const tenants = (await payload.find({
    collection: "tenants",
    where: { active: { equals: true } },
    limit: 500,
    depth: 0,
    sort: "country",
  })) as unknown as { docs: TenantRecord[] };

  const mine = tenants.docs.filter((tenant) => mayWriteInto(user, tenant));
  if (mine.length === 0) {
    return NextResponse.json(
      { ok: false, message: "You have no country sites to add pages to." },
      { status: 403 },
    );
  }

  const pending: TenantRecord[] = [];
  for (const tenant of mine) {
    const owned = await payload.count({
      collection: "pages",
      where: { tenant: { equals: tenant.id } },
    });
    if (owned.totalDocs === 0) pending.push(tenant);
  }

  const batch = pending.slice(0, Math.max(1, limit));
  const done: { tenant: string; created: number; failed?: number }[] = [];
  const problems: { tenant: string; page: string; why: string }[] = [];
  const dropped: string[] = [];

  for (const tenant of batch) {
    const result = await cloneInto(payload, tenant);
    done.push({
      tenant: tenant.country,
      created: result.created.length,
      ...(result.failed.length ? { failed: result.failed.length } : {}),
    });
    for (const f of result.failed) problems.push({ tenant: tenant.country, ...f });
    dropped.push(...result.dropped.map((d) => `${tenant.country}: ${d}`));
  }

  const remaining = pending.length - batch.length;
  // "Every country" is only true for whoever can reach every country; for a
  // country admin this did their own, and saying otherwise would be a lie
  // they could not check.
  const allOfThem = isSuperAdmin(user) ? "Every active country" : "Every country you hold";
  return NextResponse.json({
    ok: true,
    done,
    remaining,
    // Named, not counted: a page that would not save is the one thing here
    // worth a person's attention, and a number alone sends them hunting.
    ...(problems.length ? { problems } : {}),
    ...(dropped.length ? { dropped } : {}),
    message:
      remaining > 0
        ? `Gave ${done.length} more country site(s) their pages; ${remaining} still to go — run it again.`
        : done.length > 0
          ? `Gave ${done.length} country site(s) their pages. ${allOfThem} now has its own.${
              problems.length ? ` ${problems.length} page(s) would not save — see "problems".` : ""
            }`
          : `${allOfThem} already had its own pages; nothing to do.`,
  });
}

/**
 * Puts `builtIn`, `layoutMode` and `layout` back on pages copied before the
 * clone carried them.
 *
 * Those copies arrived claiming to be ordinary pages. A country route draws a
 * built-in page from its React page and an ordinary one from its record, so a
 * copy that lies about which it is replaces the news listing — and every other
 * coded page — with an empty shell. The fix is the three fields, taken from
 * the main-site page of the same slug; nothing is deleted and nothing a
 * country has written is touched.
 *
 * Batched and idempotent like the clone: a page already matching its source
 * is left alone, so this converges and can be repeated safely.
 */
async function repairMine(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: unknown,
  limit: number,
) {
  const tenants = (await payload.find({
    collection: "tenants",
    where: { active: { equals: true } },
    limit: 500,
    depth: 0,
    sort: "country",
  })) as unknown as { docs: TenantRecord[] };

  const mine = tenants.docs.filter((tenant) => mayWriteInto(user, tenant));
  if (mine.length === 0) {
    return NextResponse.json(
      { ok: false, message: "You have no country sites to repair." },
      { status: 403 },
    );
  }

  const sources = await payload.find({
    collection: "pages",
    where: { tenant: { exists: false } },
    limit: 500,
    depth: 0,
  });
  const sourceBySlug = new Map<string, Record<string, unknown>>();
  for (const doc of sources.docs as unknown as Record<string, unknown>[]) {
    if (typeof doc.slug === "string") sourceBySlug.set(doc.slug, doc);
  }

  const pending: TenantRecord[] = [];
  for (const tenant of mine) {
    const wrong = await payload.count({
      collection: "pages",
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { builtIn: { not_equals: true } },
          { slug: { in: [...sourceBySlug].filter(([, d]) => d.builtIn).map(([slug]) => slug) } },
        ],
      },
    });
    if (wrong.totalDocs > 0) pending.push(tenant);
  }

  const batch = pending.slice(0, Math.max(1, limit));
  const done: { tenant: string; repaired: number }[] = [];
  const problems: { tenant: string; page: string; why: string }[] = [];

  for (const tenant of batch) {
    const owned = await payload.find({
      collection: "pages",
      where: { tenant: { equals: tenant.id } },
      limit: 500,
      depth: 0,
    });

    let repaired = 0;
    for (const page of owned.docs as unknown as Record<string, unknown>[]) {
      const source = typeof page.slug === "string" ? sourceBySlug.get(page.slug) : undefined;
      if (!source) continue;
      if (Boolean(source.builtIn) === Boolean(page.builtIn)) continue;

      try {
        await payload.update({
          collection: "pages",
          id: page.id as number,
          data: {
            builtIn: source.builtIn,
            layoutMode: source.layoutMode,
            layout: stripRowIds(source.layout),
          } as never,
        });
        repaired += 1;
      } catch (error) {
        problems.push({
          tenant: tenant.country,
          page: String(page.slug),
          why: error instanceof Error ? error.message : String(error),
        });
      }
    }
    done.push({ tenant: tenant.country, repaired });
  }

  const remaining = pending.length - batch.length;
  return NextResponse.json({
    ok: true,
    done,
    remaining,
    ...(problems.length ? { problems } : {}),
    message:
      remaining > 0
        ? `Repaired ${done.reduce((n, d) => n + d.repaired, 0)} page(s) across ${done.length} country site(s); ${remaining} country site(s) still to go — run it again.`
        : done.length > 0
          ? `Repaired ${done.reduce((n, d) => n + d.repaired, 0)} page(s) across ${done.length} country site(s). Nothing left to repair.`
          : `Nothing to repair — every copied page already matches the page it describes.`,
  });
}
