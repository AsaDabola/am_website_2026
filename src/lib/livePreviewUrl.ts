import type { Payload } from "payload";
import { CODE_FOR_SLUG } from "./countrySites";

/**
 * Where a Pages document is actually served, so the editor can watch it change
 * beside the form.
 *
 * A page with no tenant belongs to the main site and sits at /{slug}; one with
 * a tenant belongs to that country site and sits at /{code}/{slug}.
 * `isHome` means the page is the site's root,
 * so it drops the slug rather than adding an empty segment.
 *
 * The tenant arrives as an id or as the row itself depending on the depth the
 * admin loaded the document at, so it is resolved either way.
 */
export async function livePreviewUrl({
  data,
  payload,
  serverURL,
}: {
  data: Record<string, unknown>;
  payload: Payload;
  serverURL: string;
}): Promise<string> {
  const slug = typeof data.slug === "string" ? data.slug : "";
  const isHome = data.isHome === true;

  let prefix = "";
  const tenant = data.tenant;
  if (tenant) {
    const row =
      typeof tenant === "object"
        ? (tenant as { continent?: string; slug?: string })
        : await payload
            .findByID({ collection: "tenants", id: tenant as string | number, depth: 0 })
            .catch(() => null);
    // The preview opens the address the page is actually served at, which is
    // the country's code.
    if (row?.slug) prefix = `/${CODE_FOR_SLUG.get(row.slug) ?? row.slug}`;
  }

  // A country home page is the prefix itself; the main site's is "/".
  if (isHome || !slug) return `${serverURL}${prefix || "/"}`;
  return `${serverURL}${prefix}/${slug}`;
}
