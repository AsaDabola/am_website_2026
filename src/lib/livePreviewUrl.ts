import type { Payload } from "payload";

/**
 * Where a Pages document is actually served, so the editor can watch it change
 * beside the form.
 *
 * A page with no tenant belongs to the main site and sits at /{slug}; one with
 * a tenant belongs to that country site and sits at /{country}/{slug}.
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
    if (row?.slug) prefix = `/${row.slug}`;
  }

  // A country home page is the prefix itself; the main site's is "/".
  if (isHome || !slug) return `${serverURL}${prefix || "/"}`;
  return `${serverURL}${prefix}/${slug}`;
}
