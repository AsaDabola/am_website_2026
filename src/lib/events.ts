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

/**
 * How an events query is ordered, in one place.
 *
 * There were three answers to this and they disagreed: the listing sorted on
 * `sortOrder` ascending for "newest", the home strip sorted on `startDate` —
 * a column nothing fills, so its order was whatever Postgres felt like — and
 * the short list used ascending again. Ordering is one decision, so it is
 * made once here and read everywhere.
 *
 * **Descending is newest.** `sortOrder` counts up as events are added, so the
 * highest number is the most recent one entered; ascending was serving the
 * oldest under a button that said Newest. The import script's own comment
 * claimed the opposite — that the list it read ran most-recent-first — but
 * that describes the file it imported from, not the numbers in the database
 * now, and the site is what the reader sees.
 *
 * `startDate` deliberately does not come into it. The importer never writes
 * one — the titles carry "Dec. 6-7" with no year — so it is null on every row,
 * and sorting on a column that is always null orders by nothing at all. That
 * is what the home strip was doing.
 */
export function eventOrder(sort: EventSort): string {
  return sort === "newest" ? "-sortOrder" : "sortOrder";
}

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
      // The same order the listing opens on, so the short list and the full
      // one agree about which event is the most recent.
      sort: eventOrder("newest"),
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
 * Ordered by the place each event holds in the list, not by date: no event
 * carries a year — the titles say "Dec. 6-7" — so the position is all that is
 * known about when it happened, and inventing a date to sort by would be
 * inventing the answer. Which direction that runs is decided once, in
 * `eventOrder`.
 */
export async function getEventsPage(
  options: { sort?: EventSort; page?: number; perPage?: number } = {},
): Promise<{ events: EventSummary[]; page: number; totalPages: number; total: number }> {
  const { sort = "newest", page = 1, perPage = 12 } = options;
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "events",
      sort: eventOrder(sort),
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
