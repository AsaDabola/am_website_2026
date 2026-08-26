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

export const CONTINENT_LABELS: Record<Continent, string> = {
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  northamerica: "North America",
  southamerica: "South America",
  oceania: "Oceania",
};

/** The shape Payload's `select` fields want, so the wording is written once. */
export const CONTINENT_OPTIONS = CONTINENTS.map((value) => ({
  label: CONTINENT_LABELS[value],
  value,
}));
