import config from "@payload-config";
import { getPayload } from "payload";
import { mediaUrl } from "./homeBlockTypes";
import { tenantContentWhere } from "./tenantContentWhere";
import { getRequestTenant } from "./tenantContent";

export type EventSummary = {
  id: string;
  title: string;
  slug: string;
  dateLabel: string;
  /** Only where it is known — the list these came from carried no years. */
  startDate?: string;
  location?: string;
  excerpt?: string;
  coverImage?: string;
};

export const EVENT_SORTS = ["newest", "oldest"] as const;
export type EventSort = (typeof EVENT_SORTS)[number];

function toSummary(doc: unknown): EventSummary {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.id),
    title: d.title as string,
    slug: d.slug as string,
    dateLabel: d.dateLabel as string,
    startDate: (d.startDate as string) ?? undefined,
    location: (d.location as string) ?? undefined,
    excerpt: (d.excerpt as string) ?? undefined,
    coverImage: mediaUrl(d.coverImage as { url?: string } | string | undefined),
  };
}

export async function getEventsList(): Promise<EventSummary[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "events",
      sort: "sortOrder",
      limit: 24,
      // Same reason as the news listing: without this the events page showed
      // every country's events regardless of who they were shared with.
      where: tenantContentWhere(getRequestTenant() ?? undefined),
    });
    return result.docs.map(toSummary);
  } catch {
    return [];
  }
}

/**
 * One page of the events listing.
 *
 * Ordered by the place each event holds in the list it came from, not by date:
 * that list is all that is known about when these happened — the titles carry
 * "Dec. 6-7" and no year — so the order is the information, and inventing a
 * year to sort by would be inventing the answer. "Newest" reads the list from
 * the top, which is how it was given: most recent first.
 */
export async function getEventsPage(
  options: { sort?: EventSort; page?: number; perPage?: number } = {},
): Promise<{ events: EventSummary[]; page: number; totalPages: number; total: number }> {
  const { sort = "newest", page = 1, perPage = 12 } = options;
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "events",
      sort: sort === "newest" ? "sortOrder" : "-sortOrder",
      page,
      limit: perPage,
      where: tenantContentWhere(getRequestTenant() ?? undefined),
    });
    return {
      events: result.docs.map(toSummary),
      page: result.page ?? 1,
      totalPages: result.totalPages ?? 1,
      total: result.totalDocs ?? 0,
    };
  } catch {
    return { events: [], page: 1, totalPages: 1, total: 0 };
  }
}
