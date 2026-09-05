import { cache } from "react";
import config from "@payload-config";
import { getPayload } from "payload";
import { getRequestTenant } from "./tenantContent";
import { mediaUrl } from "./homeBlockTypes";

/**
 * The photographs a country has replaced, resolved for the current request.
 *
 * The exact shape of the wording overrides next door, and for the same reason:
 * a country shows the main site's picture until it says otherwise, so a
 * photograph changed once on amintl.org reaches all ~68 sites, and a country
 * with its own picture of its own students keeps it.
 *
 * Layered weakest to strongest, the same four ways:
 *
 *   1. the main site, in every language
 *   2. the main site, in this language
 *   3. this country, in every language
 *   4. this country, in this language
 *
 * Underneath sits the path written into the component, which is what a
 * photograph nobody has replaced falls back to.
 *
 * `cache()` keeps this to one query per request however many pictures the page
 * draws, and a failure returns nothing at all — a country that cannot reach
 * the database gets the site's own photographs, not a page of empty frames.
 */

/** Replaced path -> the address to draw instead. */
export type ImageMap = Record<string, string>;

export const getTenantImages = cache(
  async (tenantId: string | null, locale: string): Promise<ImageMap> => {
    try {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "tenant-content",
        where: tenantId
          ? { or: [{ tenant: { exists: false } }, { tenant: { equals: tenantId } }] }
          : { tenant: { exists: false } },
        limit: 100,
        // One deeper than the wording query, because an upload field at depth 0
        // is an id and what is wanted here is the file's address.
        depth: 1,
      });

      const layers: ImageMap[] = [{}, {}, {}, {}];

      for (const doc of result.docs) {
        const entry = doc as unknown as {
          tenant?: unknown;
          locale?: string | null;
          images?: { key?: string | null; image?: { url?: string | null } | string | null }[] | null;
        };
        if (entry.locale && entry.locale !== locale) continue;

        const target = layers[(entry.tenant ? 2 : 0) + (entry.locale ? 1 : 0)];
        for (const row of entry.images ?? []) {
          const url = mediaUrl(row?.image);
          if (!row?.key || !url) continue;
          target[row.key] = url;
        }
      }

      return Object.assign({}, ...layers) as ImageMap;
    } catch {
      return {};
    }
  },
);

/** The replacements for whichever country the current request is rendering. */
export async function getRequestImages(locale: string): Promise<ImageMap> {
  return getTenantImages(getRequestTenant(), locale);
}
