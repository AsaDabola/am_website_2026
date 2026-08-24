import { cache } from "react";
import config from "@payload-config";
import { getPayload } from "payload";
import { coerceOverride } from "./messageKeys";

/**
 * Per-country copy overrides, resolved for the current request.
 *
 * The tenant is carried in a React `cache()` store rather than a request
 * header on purpose. Reading `headers()` anywhere in the i18n config marks
 * every route dynamic — measured, it turned all 49 prerendered routes into
 * on-demand renders — whereas `cache()` is per-request without touching the
 * dynamic APIs, so the main site stays static.
 */

type TenantRequestState = { tenantId: string | null };

const tenantRequestState = cache((): TenantRequestState => ({ tenantId: null }));

/**
 * Records which country site is being rendered. Called by the tenant route
 * before it renders any content, so anything below it sees the override set.
 */
export function setRequestTenant(tenantId: string | null): void {
  tenantRequestState().tenantId = tenantId;
}

export function getRequestTenant(): string | null {
  return tenantRequestState().tenantId;
}

export type OverrideMap = Record<string, string | string[]>;

/**
 * Overrides for one country in one language, flattened to dotted keys.
 *
 * Two entries can apply: one scoped to a language and one that applies to
 * every language. The all-languages entry is the base and the language
 * specific one wins over it, so a country can set its general wording once
 * and still say something different in a second language.
 */
export const getTenantOverrides = cache(
  async (tenantId: string | null, locale: string): Promise<OverrideMap> => {
    if (!tenantId) return {};

    try {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "tenant-content",
        where: { tenant: { equals: tenantId } },
        limit: 100,
        depth: 0,
      });

      const anyLocale: OverrideMap = {};
      const thisLocale: OverrideMap = {};

      for (const doc of result.docs) {
        const entry = doc as unknown as {
          locale?: string | null;
          overrides?: { key?: string | null; value?: string | null }[] | null;
        };
        if (entry.locale && entry.locale !== locale) continue;

        const target = entry.locale ? thisLocale : anyLocale;
        for (const row of entry.overrides ?? []) {
          if (!row?.key || row.value == null || row.value === "") continue;
          target[row.key] = coerceOverride(row.key, row.value);
        }
      }

      return { ...anyLocale, ...thisLocale };
    } catch {
      // Overrides are an enhancement, never a dependency: if the database is
      // unreachable the country site still renders the main copy.
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
