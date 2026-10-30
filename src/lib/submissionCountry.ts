import type { CollectionBeforeValidateHook } from "payload";
import { COUNTRY_BY_CODE } from "./countrySites";
import { isSuperAdmin } from "./adminAccess";

/**
 * Files a public submission under the country site it was sent from.
 *
 * The forms are client components posting to the REST API from the browser,
 * so the request carries no route context the way a page render does — the
 * server handling the POST has no idea which country's site the visitor was
 * looking at. Two things tell it, in this order:
 *
 *   1. `countryCode` in the body, which every form now sends, read from the
 *      first segment of its own path ("de" while browsing Germany).
 *   2. the Referer header, as a fallback — a same-origin fetch sends the full
 *      path, so a form that forgets to send the code still lands in the right
 *      country, and so does one added later.
 *
 * Neither is a privilege boundary and neither pretends to be: these forms are
 * open to anyone, so the worst a forged value does is file the sender's own
 * enquiry under the wrong country. What matters is that the *code* is resolved
 * to a tenant here rather than an id being accepted from the browser, so a
 * submission can only ever name a country site that exists.
 *
 * Nothing recognisable means no tenant, which is the main site — and that is
 * also every submission that arrived before this existed.
 */
export const attributeToCountrySite: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  if (!data || operation !== "create") return data;

  const claimed = typeof data.countryCode === "string" ? data.countryCode : null;
  delete data.countryCode;

  // A signed-in CMS user creating a record by hand is a different case: the
  // tenant field's own hook puts it under their country, and a super admin
  // chooses. Leave both alone.
  if (req.user) {
    if (isSuperAdmin(req.user) || data.tenant) return data;
  }

  const code = (claimed ?? countryCodeFromReferer(req.headers?.get?.("referer"))) || null;
  if (!code) return data;

  const site = COUNTRY_BY_CODE.get(code.toLowerCase());
  if (!site) return data;

  const found = await req.payload
    .find({
      collection: "tenants",
      where: { slug: { equals: site.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null);

  const tenant = found?.docs?.[0];
  if (tenant) data.tenant = tenant.id;
  return data;
};

/** The country code in the first path segment of the page that posted. */
function countryCodeFromReferer(referer?: string | null): string | null {
  if (!referer) return null;
  try {
    const [first] = new URL(referer).pathname.split("/").filter(Boolean);
    return first && COUNTRY_BY_CODE.has(first) ? first : null;
  } catch {
    return null;
  }
}
