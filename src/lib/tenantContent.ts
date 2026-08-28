import { cache } from "react";
import config from "@payload-config";
import { getPayload } from "payload";
import { coerceOverride } from "./messageKeys";
import type { Continent } from "./continents";

/**
 * Per-country copy overrides, resolved for the current request.
 *
 * The tenant is carried in a React `cache()` store rather than a request
 * header on purpose. Reading `headers()` anywhere in the i18n config marks
 * every route dynamic — measured, it turned all 49 prerendered routes into
 * on-demand renders — whereas `cache()` is per-request without touching the
 * dynamic APIs, so the main site stays static.
 */

type TenantRequestState = { tenantId: string | null; continent: Continent | null };

const tenantRequestState = cache(
  (): TenantRequestState => ({ tenantId: null, continent: null }),
);

/**
 * Records which country site is being rendered. Called by the tenant route
 * before it renders any content, so anything below it sees the override set.
 *
 * The continent rides along because content can be released to a whole
 * continent, and the components that read a country's feed are handed only a
 * tenant id. Passing the continent down as well would mean a second prop on
 * every one of them, and the failure mode of forgetting one is silent — the
 * article simply never appears. Here it is set once, in the same place and at
 * the same moment as the tenant it belongs to.
 */
export function setRequestTenant(
  tenantId: string | null,
  continent: Continent | null = null,
): void {
  const state = tenantRequestState();
  state.tenantId = tenantId;
  state.continent = continent;
}

export function getRequestTenant(): string | null {
  return tenantRequestState().tenantId;
}

export function getRequestContinent(): Continent | null {
  return tenantRequestState().continent;
}

export type OverrideMap = Record<string, string | string[]>;

/**
 * The copy changes that apply to the page being rendered, flattened to dotted
 * keys.
 *
 * Four things can have something to say about one string, and they are
 * layered weakest to strongest:
 *
 *   1. the main site, in every language
 *   2. the main site, in this language
 *   3. this country, in every language
 *   4. this country, in this language
 *
 * A change with no country is the main site's own wording — it is how the
 * fixed pages are edited without a deploy, and it reaches all ~68 country
 * sites, because a country shows the main version until it says otherwise.
 * Underneath everything sits messages/<locale>.json, which is what a string
 * falls back to when nobody has changed it.
 */
export const getTenantOverrides = cache(
  async (tenantId: string | null, locale: string): Promise<OverrideMap> => {
    try {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "tenant-content",
        // The main site's changes are read on every request, country route or
        // not; a country's own are read alongside them in the same query.
        where: tenantId
          ? { or: [{ tenant: { exists: false } }, { tenant: { equals: tenantId } }] }
          : { tenant: { exists: false } },
        limit: 100,
        depth: 0,
      });

      const layers: OverrideMap[] = [{}, {}, {}, {}];

      for (const doc of result.docs) {
        const entry = doc as unknown as {
          tenant?: unknown;
          locale?: string | null;
          overrides?: { key?: string | null; value?: string | null }[] | null;
        };
        if (entry.locale && entry.locale !== locale) continue;

        const target = layers[(entry.tenant ? 2 : 0) + (entry.locale ? 1 : 0)];
        for (const row of entry.overrides ?? []) {
          if (!row?.key || row.value == null || row.value === "") continue;
          target[row.key] = coerceOverride(row.key, row.value);
        }
      }

      return Object.assign({}, ...layers) as OverrideMap;
    } catch {
      // Overrides are an enhancement, never a dependency: if the database is
      // unreachable the site still renders the copy it shipped with.
      return {};
    }
  },
);

/** Overrides for whichever country the current request is rendering. */
export async function getRequestOverrides(locale: string): Promise<OverrideMap> {
  return getTenantOverrides(getRequestTenant(), locale);
}

/**
 * Folds dotted overrides into a nested messages object, for handing to
 * NextIntlClientProvider — client components read messages from the provider
 * rather than from the server request config.
 */
export function applyOverrides<T extends Record<string, unknown>>(
  messages: T,
  overrides: OverrideMap,
): T {
  if (Object.keys(overrides).length === 0) return messages;

  // Structural clone of only the branches that change, so untouched
  // namespaces keep pointing at the original objects.
  const next: Record<string, unknown> = { ...messages };

  for (const [key, value] of Object.entries(overrides)) {
    const path = key.split(".");
    let cursor = next;
    let ok = true;

    for (let i = 0; i < path.length - 1; i += 1) {
      const segment = path[i];
      const child = cursor[segment];
      if (!child || typeof child !== "object" || Array.isArray(child)) {
        // The key names a branch this catalogue does not have — a stale
        // override left behind after a rename. Skip it rather than
        // inventing a namespace no component reads.
        ok = false;
        break;
      }
      const copy = { ...(child as Record<string, unknown>) };
      cursor[segment] = copy;
      cursor = copy;
    }

    if (!ok) continue;

    // Refuse to overwrite a whole namespace with a single value. The admin
    // picker only offers leaf keys, but a key that was a leaf when the
    // override was saved can become a branch after a rename — and replacing
    // `Home.Hero` with a string takes out every component reading under it.
    const leaf = path[path.length - 1];
    const existing = cursor[leaf];
    if (existing && typeof existing === "object" && !Array.isArray(existing)) continue;

    cursor[leaf] = value;
  }

  return next as T;
}
