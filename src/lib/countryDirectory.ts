import { COUNTRY_SITES } from "./countrySites";
import { flagCodeFor } from "./countryFlags";
import { CONTINENTS, type Continent } from "./continents";
import { getActiveTenantKeys } from "./tenants";

export type DirectoryCountry = {
  country: string;
  city?: string;
  continent: Continent;
  slug: string;
  /** "{continent}/{slug}", which is also the site's path. */
  key: string;
  flag: string | null;
  /** The country's own default language. */
  locale: string;
  /** A tenant exists for it, so /{continent}/{slug} resolves. */
  live: boolean;
};

/**
 * The country list, built from the static COUNTRY_SITES sheet rather than the
 * Tenants collection, so the directory is complete on day one and stays
 * complete if the CMS is unreachable — the same reason the seed endpoint
 * reads from that file. What the database is asked for is only which of them
 * currently resolve, so the ones that do can be linked and the ones that do
 * not are still listed, just not as links.
 */
export async function getCountryDirectory(): Promise<DirectoryCountry[]> {
  const liveKeys = await getActiveTenantKeys();

  return COUNTRY_SITES.map((site) => {
    const key = `${site.continent}/${site.slug}`;
    return {
      country: site.country,
      city: site.city,
      continent: site.continent,
      slug: site.slug,
      key,
      flag: flagCodeFor(site),
      locale: site.locale,
      live: liveKeys.has(key),
    };
  }).sort((a, b) => a.country.localeCompare(b.country));
}

/** The same list grouped by continent, each group already name-sorted. */
export function groupByContinent(
  countries: DirectoryCountry[],
): Record<Continent, DirectoryCountry[]> {
  const grouped = {} as Record<Continent, DirectoryCountry[]>;
  for (const continent of CONTINENTS) grouped[continent] = [];
  for (const country of countries) grouped[country.continent].push(country);
  return grouped;
}
