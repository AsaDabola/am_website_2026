// Pure, client-safe constants split out of lib/tenants.ts (which imports
// the Payload config and can't be pulled into client bundles) so client
// components — like the tenant-aware nav Link — can check whether a URL
// segment is a continent without dragging in server-only code.
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
