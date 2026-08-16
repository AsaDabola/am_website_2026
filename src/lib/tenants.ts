import config from "@payload-config";
import { getPayload } from "payload";

export const CONTINENTS = [
  "africa",
  "asia",
  "europe",
  "northamerica",
  "southamerica",
  "oceania",
] as const;

export type Continent = (typeof CONTINENTS)[number];

export function isContinent(value: string): value is Continent {
  return (CONTINENTS as readonly string[]).includes(value);
}

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
