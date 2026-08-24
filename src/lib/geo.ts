import config from "@payload-config";
import { getPayload } from "payload";
import { parseCountryCodes, matchesCountryCode } from "./countryCodes";

export type GeoTenant = {
  id: string | number;
  country: string;
  continent: string;
  slug: string;
  locale?: string | null;
  countryCodes?: string | null;
};

/**
 * Every active tenant, unfiltered. There are under a hundred of these and
 * they are tiny, so pulling the whole set and matching in JS costs less than
 * the round trips it saves — and it lets the match be exact rather than a
 * database substring test (see lib/countryCodes).
 */
async function allActiveTenants(): Promise<GeoTenant[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: { active: { equals: true } },
      limit: 1000,
      depth: 0,
    });
    return result.docs as unknown as GeoTenant[];
  } catch {
    // The database is unreachable. Callers treat this the same as "no
    // match", which leaves the visitor on the main site rather than
    // failing the request.
    return [];
  }
}

/**
 * Resolves an ISO 3166-1 alpha-2 code to the country site that answers for
 * it, or null when AM has no site there — roughly three quarters of the
 * world's codes, which is the expected case and not an error.
 */
export async function findTenantByCountryCode(code: string): Promise<GeoTenant | null> {
  const tenants = await allActiveTenants();
  return tenants.find((tenant) => matchesCountryCode(tenant.countryCodes, code)) ?? null;
}

export type CodeConflict = {
  code: string;
  tenants: { id: string | number; country: string; slug: string }[];
};

export type GeoAudit = {
  tenantCount: number;
  codeCount: number;
  /** code -> the single tenant that answers for it. */
  resolved: Record<string, string>;
  /** Codes claimed by more than one tenant: geo picks one arbitrarily. */
  conflicts: CodeConflict[];
  /** Entries that are not a well-formed alpha-2 code. */
  malformed: { tenant: string; code: string }[];
  /** Active tenants with no codes at all — unreachable by geo detection. */
  tenantsWithoutCodes: string[];
};

/**
 * Proves the invariant the geo redirect depends on: every code belongs to
 * exactly one country site. Exposed through /api/geo/audit so the data can be
 * checked against the live database rather than only against the seed file.
 */
export async function auditCountryCodes(): Promise<GeoAudit> {
  const tenants = await allActiveTenants();
  const owners = new Map<string, GeoTenant[]>();
  const malformed: { tenant: string; code: string }[] = [];
  const tenantsWithoutCodes: string[] = [];

  for (const tenant of tenants) {
    const codes = parseCountryCodes(tenant.countryCodes);
    if (codes.length === 0) {
      tenantsWithoutCodes.push(tenant.country);
      continue;
    }
    for (const code of codes) {
      if (!/^[A-Z]{2}$/.test(code)) malformed.push({ tenant: tenant.country, code });
      owners.set(code, [...(owners.get(code) ?? []), tenant]);
    }
  }

  const resolved: Record<string, string> = {};
  const conflicts: CodeConflict[] = [];
  for (const [code, claimants] of [...owners].sort(([a], [b]) => a.localeCompare(b))) {
    resolved[code] = claimants[0].country;
    if (claimants.length > 1) {
      conflicts.push({
        code,
        tenants: claimants.map((t) => ({ id: t.id, country: t.country, slug: t.slug })),
      });
    }
  }

  return {
    tenantCount: tenants.length,
    codeCount: owners.size,
    resolved,
    conflicts,
    malformed,
    tenantsWithoutCodes,
  };
}
