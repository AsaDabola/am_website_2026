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

export async function GET(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await payload.find({
    collection: "tenants",
    limit: 500,
    depth: 0,
    pagination: false,
  });
  const known = new Set(existing.docs.map((doc) => doc.slug));

  return NextResponse.json({
    total: COUNTRY_SITES.length,
    wouldCreate: COUNTRY_SITES.filter((site) => !known.has(site.slug)).map((site) => site.slug),
    wouldUpdate: COUNTRY_SITES.filter((site) => known.has(site.slug)).map((site) => site.slug),
    notInList: existing.docs.filter((doc) => !COUNTRY_SITES.some((site) => site.slug === doc.slug)).map((doc) => doc.slug),
    translationBacklog: translationBacklog(),
  });
}

export async function POST(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const created: string[] = [];
  const updated: string[] = [];

  for (const site of COUNTRY_SITES) {
    const data = toRecord(site);
    const existing = await payload.find({
      collection: "tenants",
      where: { slug: { equals: site.slug } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) {
      await payload.update({ collection: "tenants", id: existing.docs[0].id, data });
      updated.push(site.slug);
    } else {
      await payload.create({ collection: "tenants", data });
      created.push(site.slug);
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    updated,
    translationBacklog: translationBacklog(),
  });
}
