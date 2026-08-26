import type { Where } from "payload";
import type { Continent } from "./continents";
import { getRequestContinent } from "./tenantContent";

/**
 * Builds the `where` clause for fetching syndicated content (Posts, Events)
 * scoped to a site: pass a tenant id for a country site's feed, or omit it
 * for the main amintl.org feed. See collections/fields/syndication.ts for
 * the fields this reads.
 *
 * There are four ways an article can reach a country site, and they are
 * additive rather than a hierarchy — it was written there, it went to
 * everyone, it went to that country's continent, or that country was named.
 * A regional office releasing to Africa and head office naming one extra
 * country do not have to agree; both show.
 *
 * The continent defaults to the one recorded for this request by the tenant
 * route, so the callers that already pass a tenant id get continent scoping
 * without a second argument. Pass it explicitly anywhere outside a rendered
 * tenant route, where the request store is not set.
 */
export function tenantContentWhere(
  tenantId?: string | number,
  continent: Continent | null = getRequestContinent(),
): Where {
  if (tenantId) {
    const or: Where[] = [
      { tenant: { equals: tenantId } },
      { shareWithAllTenants: { equals: true } },
      { shareWithTenants: { contains: tenantId } },
    ];

    if (continent) or.push({ shareWithContinents: { contains: continent } });

    return { or };
  }

  return {
    or: [
      { tenant: { exists: false } },
      { shareWithAllTenants: { equals: true } },
      { shareWithMainSite: { equals: true } },
    ],
  };
}
