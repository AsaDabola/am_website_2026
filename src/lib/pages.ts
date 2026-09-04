import config from "@payload-config";
import { getPayload } from "payload";
import type { PageBlockData } from "./pageBlockTypes";

export type PageDoc = {
  id?: string | number;
  title: string;
  meta?: { title?: string | null; description?: string | null } | null;
  hero?: {
    heading?: string | null;
    subheading?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image?: any;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections?: any[];
  /** The general page builder's sections — see collections/blocks/pageBlocks. */
  layout?: PageBlockData[] | null;
};

/**
 * Looks up an editor-managed Page. Pass tenantId for a country site's page,
 * or omit it for a main amintl.org page. Pass an empty slug to find a
 * tenant's home page (isHome === true).
 */
export async function getPageBySlug(
  tenantId: string | null,
  slug: string,
): Promise<PageDoc | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      where: {
        and: [
          tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
          slug ? { slug: { equals: slug } } : { isHome: { equals: true } },
          { published: { equals: true } },
          // A built-in page is a listing entry for a page the code renders.
          // It has no body of its own, so it must never be rendered as one —
          // and it never is: a real route answers that address first. This
          // says so out loud rather than relying on that.
          { builtIn: { not_equals: true } },
        ],
      },
      limit: 1,
      depth: 2,
    });
    return (result.docs[0] as PageDoc | undefined) ?? null;
  } catch {
    return null;
  }
}

/** A page an editor asked to appear in the site navigation. */
export type NavPage = {
  label: string;
  href: string;
  /**
   * Which site the page belongs to: "" for the main amintl.org site, or
   * "/{country}" for a country's. The nav shows a page only while
   * that site is the one being browsed, so a page written for one country
   * never appears in another country's menu.
   */
  scope: string;
};

/**
 * The editor-managed pages that asked for a place in the navigation — the ones
 * with a Nav Label filled in. Leaving it empty keeps a page out of the menu
 * while still serving it at its address, which is what makes a page linked to
 * from elsewhere possible.
 */
export async function getNavPages(): Promise<NavPage[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      where: {
        and: [
          { navLabel: { exists: true } },
          { published: { equals: true } },
          // The built-in pages are already in the navigation, in the order the
          // design puts them. Listing them again would print each twice.
          { builtIn: { not_equals: true } },
        ],
      },
      limit: 100,
      depth: 1,
      sort: "title",
    });

    const pages: NavPage[] = [];
    for (const doc of result.docs) {
      const page = doc as unknown as {
        navLabel?: string | null;
        slug?: string | null;
        isHome?: boolean | null;
        tenant?: { continent?: string | null; slug?: string | null } | null;
      };

      const label = page.navLabel?.trim();
      if (!label) continue;

      const tenant = page.tenant;
      const scope =
        tenant && tenant.slug ? `/${tenant.slug}` : "";

      // A home page is its site's root rather than a path below it.
      const slug = page.isHome ? "" : page.slug?.trim() ?? "";
      const href = slug ? `${scope}/${slug}` : scope || "/";

      pages.push({ label, href, scope });
    }
    return pages;
  } catch {
    // The nav is built on every page of the site: a database that cannot be
    // reached costs the extra links, not the menu.
    return [];
  }
}
