import type { Where } from "payload";

/**
 * Builds the `where` clause for fetching syndicated content (Posts, Events)
 * scoped to a site: pass a tenant id for a country site's feed, or omit it
 * for the main amintl.org feed. See collections/fields/syndication.ts for
 * the fields this reads.
 */
export function tenantContentWhere(tenantId?: string | number): Where {
  if (tenantId) {
    return {
      or: [
        { tenant: { equals: tenantId } },
        { shareWithAllTenants: { equals: true } },
        { shareWithTenants: { contains: tenantId } },
      ],
    };
  }

  return {
    or: [
      { tenant: { exists: false } },
      { shareWithAllTenants: { equals: true } },
      { shareWithMainSite: { equals: true } },
    ],
  };
}
