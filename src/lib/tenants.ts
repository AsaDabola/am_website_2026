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
