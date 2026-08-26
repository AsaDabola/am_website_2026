import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_SITES, LANGUAGE_NAMES, untranslatedLanguages } from "@/lib/countrySites";

/**
 * Seeds the Tenants collection from AM's G20 + M40 mission country list
 * (src/lib/countrySites.ts) as path-based country sites — one per row, at
 * /{continent}/{slug}.
 *
 * Idempotent: a slug that already exists is updated to match the list rather
 * than duplicated, so re-running after editing countrySites.ts brings the
 * database back in line. It never deactivates or deletes anything — chapters
 * seeded before this list existed (Venezuela, Bolivia, Ireland and so on)
 * stay exactly as they are.
 *
 * POST to seed. GET reports what would change, plus the translation backlog,
 * without writing. Both require a logged-in admin.
 */

function toRecord(site: (typeof COUNTRY_SITES)[number]) {
  return {
    country: site.country,
    city: site.city ?? null,
    continent: site.continent,
    slug: site.slug,
    locale: site.locale,
    countryCodes: site.countryCodes.join(","),
    languages: site.nativeLanguages.join(","),
    tier: site.tier,
    active: true,
  };
}

/**
 * Countries reading the site in a language they do not speak, grouped by the
 * language they are waiting on. This is the translation backlog — the reason
 * a country's `locale` may not match its `languages`.
 */
function translationBacklog() {
  const byLanguage = new Map<string, string[]>();
  for (const site of COUNTRY_SITES) {
    for (const tag of untranslatedLanguages(site)) {
      const countries = byLanguage.get(tag) ?? [];
      countries.push(site.country);
      byLanguage.set(tag, countries);
    }
  }
  return [...byLanguage.entries()]
    .map(([tag, countries]) => ({
      language: LANGUAGE_NAMES[tag] ?? tag,
      tag,
      countries: countries.sort(),
    }))
    .sort((a, b) => b.countries.length - a.countries.length || a.language.localeCompare(b.language));
}

async function requireAdmin(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  return user ? payload : null;
}

/**
 * Anything thrown in here used to escape as a bare 500 with an empty body,
 * which reads in a browser console as "Unexpected end of JSON input" and says
 * nothing about what actually failed. Whatever goes wrong now comes back as
 * JSON you can read.
 *
 * The chain matters as much as the message: a database failure surfaces as a
 * Drizzle "Failed query: select …" that quotes the SQL and names nothing,
 * while the Postgres error underneath it — the missing column, the bad type —
 * is on `cause`. So the causes are unwrapped too, along with the `code` and
 * `detail` a pg error carries.
 */
function describe(error: unknown): string[] {
  const chain: string[] = [];
  let current: unknown = error;

  for (let depth = 0; current && depth < 5; depth += 1) {
    if (current instanceof Error) {
      const { code, detail } = current as Error & { code?: string; detail?: string };
      chain.push([current.message, code && `[${code}]`, detail].filter(Boolean).join(" "));
      current = (current as { cause?: unknown }).cause;
    } else {
      chain.push(String(current));
      break;
    }
  }

  return chain;
}

function failed(error: unknown) {
  console.error("[seed-tenants]", error);
  return NextResponse.json({ ok: false, error: describe(error) }, { status: 500 });
}

/** Every existing tenant's slug → id, in one query rather than one per row. */
async function existingBySlug(payload: Awaited<ReturnType<typeof getPayload>>) {
  const result = await payload.find({
    collection: "tenants",
    limit: 1000,
    depth: 0,
    pagination: false,
  });
  return new Map(result.docs.map((doc) => [doc.slug as string, doc.id]));
}

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const known = await existingBySlug(payload);

    return NextResponse.json({
      total: COUNTRY_SITES.length,
      wouldCreate: COUNTRY_SITES.filter((site) => !known.has(site.slug)).map((site) => site.slug),
      wouldUpdate: COUNTRY_SITES.filter((site) => known.has(site.slug)).map((site) => site.slug),
      notInList: [...known.keys()].filter(
        (slug) => !COUNTRY_SITES.some((site) => site.slug === slug),
      ),
      translationBacklog: translationBacklog(),
    });
  } catch (error) {
    return failed(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // One lookup for the whole set, then a write per row — sixty-odd rows used
    // to mean sixty-odd extra reads, and on a serverless function with a short
    // execution limit that is time this does not need to spend.
    const known = await existingBySlug(payload);

    const created: string[] = [];
    const updated: string[] = [];
    const failed: { slug: string; error: string[] }[] = [];

    // Per country rather than all-or-nothing. One bad row used to abort the
    // whole run, so a single unseedable country left the other sixty-seven
    // unwritten and reported one error with no indication of which country
    // caused it. Now every country is attempted and the failures are named.
    for (const site of COUNTRY_SITES) {
      const data = toRecord(site);
      const id = known.get(site.slug);

      try {
        if (id !== undefined) {
          await payload.update({ collection: "tenants", id, data });
          updated.push(site.slug);
        } else {
          await payload.create({ collection: "tenants", data });
          created.push(site.slug);
        }
      } catch (error) {
        failed.push({ slug: site.slug, error: describe(error) });
      }
    }

    return NextResponse.json({
      ok: failed.length === 0,
      created,
      updated,
      failed,
      translationBacklog: translationBacklog(),
    });
  } catch (error) {
    return failed(error);
  }
}
