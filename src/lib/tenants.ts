import { cache } from "react";
import config from "@payload-config";
import { getPayload } from "payload";

export { CONTINENTS, isContinent, type Continent } from "./continents";
import { CONTINENTS, isContinent, type Continent } from "./continents";

export async function getTenantBySlug(countrySlug: string) {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: {
        and: [{ slug: { equals: countrySlug } }, { active: { equals: true } }],
      },
      limit: 1,
    });
    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getTenantsByContinent(continent: string) {
  if (!isContinent(continent)) return [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: { and: [{ continent: { equals: continent } }, { active: { equals: true } }] },
      sort: "country",
      limit: 200,
    });
    return result.docs;
  } catch {
    return [];
  }
}

export async function getAllActiveTenantsByContinent(): Promise<
  Record<Continent, { country: string; city?: string; slug: string; locale?: string }[]>
> {
  const empty = {} as Record<
    Continent,
    { country: string; city?: string; slug: string; locale?: string }[]
  >;
  for (const continent of CONTINENTS) empty[continent] = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: { active: { equals: true } },
      sort: "country",
      limit: 500,
      depth: 0,
    });
    for (const tenant of result.docs) {
      if (!isContinent(tenant.continent)) continue;
      empty[tenant.continent].push({
        country: tenant.country,
        city: tenant.city ?? undefined,
        slug: tenant.slug,
        locale: tenant.locale ?? undefined,
      });
    }
    return empty;
  } catch {
    return empty;
  }
}

export async function getActiveTenantCountByContinent(): Promise<Record<string, number>> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: { active: { equals: true } },
      limit: 1000,
      depth: 0,
    });
    const counts: Record<string, number> = {};
    for (const tenant of result.docs) {
      counts[tenant.continent] = (counts[tenant.continent] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

/**
 * the slug of every active tenant.
 *
 * The country directory is built from the static COUNTRY_SITES list so it is
 * complete whatever the CMS holds, but only a country with a tenant behind it
 * actually resolves at /{slug} — see the catch-all route. This is
 * what lets the directory link the ones that resolve and leave the rest as
 * plain text rather than shipping links to 404s.
 */
export async function getActiveTenantKeys(): Promise<Set<string>> {
  return new Set((await getActiveTenantRows()).keys());
}

export type TenantRow = {
  orgName?: string;
  address?: string;
  contactEmail?: string;
};

/**
 * Active tenants keyed by slug, carrying the fields a country
 * can override in its footer. One query serves both this and the directory's
 * live check, so asking for either costs the same request.
 */
export const getActiveTenantRows = cache(async (): Promise<Map<string, TenantRow>> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: { active: { equals: true } },
      limit: 1000,
      depth: 0,
    });
    return new Map(
      result.docs.map((t) => [
        String(t.slug),
        {
          orgName: (t as { orgName?: string | null }).orgName ?? undefined,
          address: (t as { address?: string | null }).address ?? undefined,
          contactEmail: (t as { contactEmail?: string | null }).contactEmail ?? undefined,
        },
      ]),
    );
  } catch {
    return new Map();
  }
});
