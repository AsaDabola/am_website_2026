import type { Payload } from "payload";
import { dbPool } from "@/lib/dbPool";
import { CONTINENT_LABELS, type Continent } from "@/lib/continents";

/**
 * How many leaders there are, by continent and by country.
 *
 * One query rather than one per country: the question is asked about the whole
 * network at once, and sixty-eight round trips to answer it is the difference
 * between a screen that opens and one that does not.
 *
 * Counted in SQL rather than by reading the rows, for the same reason —
 * nothing here needs a leader's record, only how many there are.
 */

export type CountryCount = {
  tenantId: string;
  country: string;
  continent: Continent | null;
  leaders: number;
};

export type ContinentCount = {
  continent: Continent | null;
  label: string;
  leaders: number;
  countries: CountryCount[];
};

export type LeaderCounts = {
  total: number;
  continents: ContinentCount[];
  /** Countries with no leaders recorded, which is a finding rather than a gap. */
  empty: CountryCount[];
};

/**
 * @param onlyTenants restricts the count to these country ids, for an
 *   administrator who is not a super admin. Undefined means the whole network.
 */
export async function getLeaderCounts(
  payload: Payload,
  onlyTenants?: string[],
): Promise<LeaderCounts> {
  try {
    // Every active country, left-joined to its leaders, so a country with none
    // still appears — "which countries have nobody recorded" is exactly the
    // question this screen exists to answer, and an inner join would hide it.
    const { rows } = await dbPool(payload).query(
      `SELECT t.id::text  AS tenant_id,
              t.country   AS country,
              t.continent AS continent,
              count(l.id) AS leaders
         FROM tenants t
         LEFT JOIN leaders l ON l.tenant_id = t.id
        WHERE ($1::text[] IS NULL OR t.id::text = ANY($1::text[]))
        GROUP BY t.id, t.country, t.continent
        ORDER BY t.country`,
      [onlyTenants && onlyTenants.length ? onlyTenants : null],
    );

    const byContinent = new Map<string, ContinentCount>();
    const empty: CountryCount[] = [];
    let total = 0;

    for (const row of rows) {
      const count: CountryCount = {
        tenantId: String(row.tenant_id),
        country: (row.country as string) ?? "Unknown",
        continent: (row.continent as Continent | null) ?? null,
        leaders: Number(row.leaders) || 0,
      };
      total += count.leaders;
      if (count.leaders === 0) empty.push(count);

      const key = count.continent ?? "unknown";
      if (!byContinent.has(key)) {
        byContinent.set(key, {
          continent: count.continent,
          label: count.continent ? CONTINENT_LABELS[count.continent] : "No continent set",
          leaders: 0,
          countries: [],
        });
      }
      const group = byContinent.get(key)!;
      group.leaders += count.leaders;
      // Only countries that have someone; the empty ones are listed separately
      // so a continent's list is people rather than mostly zeroes.
      if (count.leaders > 0) group.countries.push(count);
    }

    const continents = [...byContinent.values()]
      .filter((group) => group.leaders > 0 || group.countries.length > 0)
      .sort((a, b) => b.leaders - a.leaders || a.label.localeCompare(b.label));
    for (const group of continents) group.countries.sort((a, b) => b.leaders - a.leaders);

    return { total, continents, empty };
  } catch {
    // The table not being there yet, or the database being unreachable, costs
    // the numbers — not the screen.
    return { total: 0, continents: [], empty: [] };
  }
}
