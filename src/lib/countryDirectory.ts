import { COUNTRY_SITES, countryCode, defaultOrgName } from "./countrySites";
import { flagCodeFor } from "./countryFlags";
import { CONTINENTS, type Continent } from "./continents";
import { getActiveTenantRows } from "./tenants";

export type DirectoryCountry = {
  country: string;
  city?: string;
  continent: Continent;
  slug: string;
  /** The country's two-letter code, which is also the site's path. */
  key: string;
  flag: string | null;
  /** The country's own default language. */
  locale: string;
  /** A tenant exists for it, so /{code} resolves. */
  live: boolean;
  /** Footer identity, where the country has filled it in. */
  orgName?: string;
  address?: string;
  contactEmail?: string;
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
  const rows = await getActiveTenantRows();

  return COUNTRY_SITES.map((site) => {
    const key = countryCode(site);
    // The tenants are keyed by slug, which is what the database stores; the
    // key above is the address. Looking the row up by the address would find
    // nothing and mark every country as not yet live.
    const row = rows.get(site.slug);
    return {
      country: site.country,
      city: site.city,
      continent: site.continent,
      slug: site.slug,
      key,
      flag: flagCodeFor(site),
      locale: site.locale,
      live: rows.has(site.slug),
      // Falls back to the country's own name, not head office's — see
      // defaultOrgName. Only a country that has actually been edited in the
      // admin overrides it.
      orgName: row?.orgName || defaultOrgName(site.country),
      address: row?.address,
      contactEmail: row?.contactEmail,
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
