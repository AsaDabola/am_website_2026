import { cache } from "react";
import config from "@payload-config";
import { getPayload } from "payload";
import { getLocale } from "next-intl/server";
import { getRequestTenant } from "./tenantContent";
import { SOURCE_LOCALE, translateSections } from "./pageTranslations";
import type { PageBlockData } from "./pageBlockTypes";

/**
 * The language this page is being read in, degrading to the language sections
 * are authored in outside a request — a script, a build-time helper — rather
 * than throwing. Same shape as lib/posts does for articles.
 */
async function readingLocale(): Promise<string> {
  try {
    return (await getLocale()) || SOURCE_LOCALE;
  } catch {
    return SOURCE_LOCALE;
  }
}

/**
 * How a page built in code is allowed to be rearranged from the admin.
 *
 * The site's thirty-odd pages are React, designed in Figma, and rewriting
 * every one of them as records would trade a good design for an editable one.
 * This is the way out of that trade: each of those pages keeps its coded
 * layout *and* carries a list of authored sections, and the page says where
 * those sections go.
 *
 *   inherit  — the page as the site ships it. The default, and what every
 *              page does until someone chooses otherwise.
 *   before   — the authored sections above the coded page.
 *   after    — below it. The usual choice: a country adding its own band.
 *   replace  — only the authored sections. The page is now editable end to
 *              end, and the coded version is still there to go back to by
 *              setting this to "inherit" again.
 *
 * Nothing here is destructive: the coded page is never deleted, and every
 * choice is reversible from one select in the admin.
 */
export type LayoutMode = "inherit" | "before" | "after" | "replace";

export type PageLayout = {
  mode: LayoutMode;
  sections: PageBlockData[];
};

/** "/about/mission" → "about/mission", the slug a Page record carries. */
export function slugForRoute(route: string): string {
  return route === "/" ? "" : route.replace(/^\//, "");
}

/**
 * The authored layout for one built-in route, on the site being rendered.
 *
 * Layered the same way the site's wording is: a country's own entry wins, and
 * a country that has not said anything follows the main site. So a section
 * added once on amintl.org reaches all ~68 country sites, and a country that
 * wants something different says so in one place.
 *
 * `cache()` keeps it to one query per route per request even though both
 * `generateMetadata` and the page itself ask for it.
 *
 * Every failure returns null, which renders the coded page. That is the
 * important property: this feature being switched off — by a database that
 * cannot be reached, or a column that has not been added yet — costs the
 * authored sections, never the page.
 */
export const getRouteLayout = cache(async (route: string): Promise<PageLayout | null> => {
  const slug = slugForRoute(route);
  const tenantId = getRequestTenant();

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      where: {
        and: [
          { slug: { equals: slug } },
          { published: { equals: true } },
          tenantId
            ? { or: [{ tenant: { equals: tenantId } }, { tenant: { exists: false } }] }
            : { tenant: { exists: false } },
        ],
      },
      limit: 2,
      depth: 2,
    });

    const docs = result.docs as unknown as {
      id: string | number;
      tenant?: { id?: string | number } | string | number | null;
      layoutMode?: LayoutMode | null;
      layout?: PageBlockData[] | null;
    }[];

    // The country's own row first, whichever order the query returned them in.
    const own = tenantId
      ? docs.find((doc) => {
          const tenant = doc.tenant;
          const id = tenant && typeof tenant === "object" ? tenant.id : tenant;
          return id != null && String(id) === tenantId;
        })
      : undefined;
    const doc = own ?? docs.find((row) => !row.tenant);
    if (!doc) return null;

    const mode = doc.layoutMode ?? "inherit";
    const sections = doc.layout ?? [];
    if (mode === "inherit" || sections.length === 0) return null;

    // In the language being read, where there is one. A section with nothing
    // stored keeps the words it was authored in — see lib/pageTranslations.
    return { mode, sections: await translateSections(payload, doc.id, await readingLocale(), sections) };
  } catch {
    return null;
  }
});
