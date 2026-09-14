import { mediaUrl } from "@/lib/homeBlockTypes";
import CampusTourMap from "@/components/tour/CampusTourMap";
import { CAMPUS_AERIAL, CAMPUS_BUILDINGS, type CampusBuilding } from "@/components/tour/campusBuildings";
import type { CampusTourData } from "@/lib/pageBlockTypes";

/**
 * The authored campus tour, as the page builder stores it.
 *
 * This is the seam between a Payload record and the map: upload fields hold
 * documents rather than addresses, and the map wants addresses. A section with
 * no buildings filled in falls back to the ones the site ships, so an editor
 * who adds the section and saves before typing gets the tour rather than a
 * blank band.
 *
 * Deliberately not wrapped in the usual `Section` shell: the map is two bands
 * of its own — the aerial on the page's ground, the cards on the paper one —
 * and a background chosen around it would paint over that.
 */
export default function CampusTourSection({ data }: { data: CampusTourData }) {
  const authored: CampusBuilding[] = (data.buildings ?? [])
    .filter((row) => row.name)
    .map((row, index) => ({
      id: row.id ?? `building-${index}`,
      name: row.name!,
      tag: row.tag ?? undefined,
      text: row.text ?? undefined,
      photo: mediaUrl(row.photo) ?? null,
      gallery: (row.gallery ?? []).map((shot) => ({
        url: mediaUrl(shot.image) ?? null,
        caption: shot.caption ?? null,
      })),
      shape: row.shape ?? "",
      leader: {
        x1: row.leaderX1 ?? 0,
        y1: row.leaderY1 ?? 0,
        x2: row.leaderX2 ?? 0,
        y2: row.leaderY2 ?? 0,
      },
      pin: { left: row.pinLeft ?? 50, top: row.pinTop ?? 50 },
    }));

  return (
    <CampusTourMap
      aerial={mediaUrl(data.aerial) ?? CAMPUS_AERIAL}
      buildings={authored.length > 0 ? authored : CAMPUS_BUILDINGS}
      eyebrow={data.eyebrow}
      heading={data.heading}
      hint={data.hint}
    />
  );
}
