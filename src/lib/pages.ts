import config from "@payload-config";
import { getPayload } from "payload";

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
