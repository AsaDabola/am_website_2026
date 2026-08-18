import config from "@payload-config";
import { getPayload } from "payload";

export { CONTINENTS, isContinent, type Continent } from "./continents";
import { CONTINENTS, isContinent, type Continent } from "./continents";

export async function getTenantBySlug(continent: string, countrySlug: string) {
  if (!isContinent(continent)) return null;

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: {
        and: [
          { continent: { equals: continent } },
          { slug: { equals: countrySlug } },
          { active: { equals: true } },
        ],
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
  Record<Continent, { country: string; city?: string; slug: string }[]>
> {
  const empty = {} as Record<Continent, { country: string; city?: string; slug: string }[]>;
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
