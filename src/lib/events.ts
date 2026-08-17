import config from "@payload-config";
import { getPayload } from "payload";
import { mediaUrl } from "./homeBlockTypes";

export type EventSummary = {
  id: string;
  title: string;
  slug: string;
  dateLabel: string;
  startDate: string;
  location?: string;
  excerpt?: string;
  coverImage?: string;
};

export async function getEventsList(): Promise<EventSummary[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "events",
      sort: "startDate",
      limit: 24,
    });
    return result.docs.map((doc) => {
      const d = doc as Record<string, unknown>;
      return {
        id: String(d.id),
        title: d.title as string,
        slug: d.slug as string,
        dateLabel: d.dateLabel as string,
        startDate: d.startDate as string,
        location: (d.location as string) ?? undefined,
        excerpt: (d.excerpt as string) ?? undefined,
        coverImage: mediaUrl(d.coverImage as { url?: string } | string | undefined),
      };
    });
  } catch {
    return [];
  }
}
