import type { MapView } from "./mapViews/types";

/**
 * Where a chapter sits in AM's sending structure.
 *
 * "global"   — Trenton, the international headquarters. Every trunk route
 *              starts here.
 * "regional" — a continental headquarters. The trunk reaches it, and it in
 *              turn reaches the chapters of its own continent.
 *
 * Chapters with no role are reached by their own continent's headquarters.
 */
export type ChapterRole = "global" | "regional";

export type Chapter = {
  city: string;
  country: string;
  region: RegionKey;
  lat: number;
  lng: number;
  role?: ChapterRole;
};

export type RegionKey =
  | "northamerica"
  | "southamerica"
  | "europe"
  | "africa"
  | "asia"
  | "oceania";

/**
 * Projects a coordinate into a given view's viewbox.
 *
 * Every view uses d3's equirectangular projection, which is linear in
 * longitude and latitude, so reproducing it here is arithmetic — no
 * projection library needs to reach the browser. Mirrors
 * scripts/generate-map-views.mjs.
 */
export function projectForView(lat: number, lng: number, view: MapView): { x: number; y: number } {
  let rotated = lng + view.rotate;
  while (rotated > 180) rotated -= 360;
  while (rotated < -180) rotated += 360;

  const toRad = Math.PI / 180;
  return {
    x: view.translate[0] + view.scale * rotated * toRad,
    y: view.translate[1] - view.scale * lat * toRad,
  };
}

export const CHAPTERS: Chapter[] = [
  // Trenton is the international headquarters; every route starts here.
  { city: "Trenton", country: "USA", region: "northamerica", lat: 40.2206, lng: -74.7597, role: "global" },

  // North America
  { city: "New York", country: "USA", region: "northamerica", lat: 40.7128, lng: -74.006 },
  { city: "Princeton", country: "USA", region: "northamerica", lat: 40.3573, lng: -74.6672 },
  { city: "Raleigh", country: "USA", region: "northamerica", lat: 35.7796, lng: -78.6382 },
  { city: "San Diego", country: "USA", region: "northamerica", lat: 32.7157, lng: -117.1611 },
  { city: "San Francisco", country: "USA", region: "northamerica", lat: 37.7749, lng: -122.4194 },
  { city: "Washington DC", country: "USA", region: "northamerica", lat: 38.9072, lng: -77.0369 },

  // Latin America & Caribbean
  { city: "Bogotá", country: "Colombia", region: "southamerica", lat: 4.711, lng: -74.0721 },

  // Europe
  { city: "Frankfurt", country: "Germany", region: "europe", lat: 50.1109, lng: 8.6821 },
  { city: "London", country: "United Kingdom", region: "europe", lat: 51.5072, lng: -0.1276 },
  { city: "Paris", country: "France", region: "europe", lat: 48.8566, lng: 2.3522 },
  { city: "Amsterdam", country: "Netherlands", region: "europe", lat: 52.3676, lng: 4.9041 },

  // Africa
  { city: "Bujumbura", country: "Burundi", region: "africa", lat: -3.3614, lng: 29.3599 },
  { city: "Kigali", country: "Rwanda", region: "africa", lat: -1.9441, lng: 30.0619 },

  // Asia
  { city: "Chennai", country: "India", region: "asia", lat: 13.0827, lng: 80.2707 },
  { city: "Beijing", country: "China", region: "asia", lat: 39.9042, lng: 116.4074 },
  { city: "Seoul", country: "South Korea", region: "asia", lat: 37.5665, lng: 126.978 },
  { city: "Manila", country: "Philippines", region: "asia", lat: 14.5995, lng: 120.9842 },

  // Oceania
  { city: "Sydney", country: "Australia", region: "oceania", lat: -33.8688, lng: 151.2093 },
];

export const HQ = CHAPTERS.find((chapter) => chapter.role === "global")!;

/**
 * The routes drawn on the network map, as AM's structure actually works: the
 * international headquarters reaches its own continent's chapters directly
 * and every continental headquarters; each continental headquarters then
 * reaches the chapters of its own continent. Nothing crosses continents
 * except the trunk out of Trenton.
 *
 * Generic over the chapter shape so the map can pass its already-projected
 * markers straight in. Only the chapters actually given are linked, so a
 * zoomed region view yields exactly that continent's spokes.
 */
export function networkRoutes<T extends { region: RegionKey; role?: ChapterRole }>(
  chapters: T[],
): { from: T; to: T }[] {
  const global = chapters.find((chapter) => chapter.role === "global") ?? null;
  const routes: { from: T; to: T }[] = [];

  for (const chapter of chapters) {
    if (chapter.role === "global") continue;

    if (chapter.role === "regional") {
      // Continental headquarters hang off the trunk.
      if (global) routes.push({ from: global, to: chapter });
      continue;
    }

    // Everyone else is reached by their own continent's headquarters, which
    // is Trenton itself for North America.
    // Its own continent's headquarters where there is one — which is Trenton
    // itself for North America — and Trenton directly where there is not.
    // Falling through to the global node matters now that the chapter sheet
    // names no continental headquarters: without it most of the network would
    // simply have no route drawn.
    const parent =
      global && chapter.region === global.region
        ? global
        : (chapters.find((c) => c.role === "regional" && c.region === chapter.region) ?? global);

    if (parent) routes.push({ from: parent, to: chapter });
  }

  return routes;
}

/**
 * The country site a chapter belongs to, where one exists.
 *
 * A chapter filed under its country appears on that country's site as well as
 * in the international network. Burundi and China have chapters but no country
 * site yet, so theirs are listed internationally and wait for one.
 */
export const CHAPTER_COUNTRY_SLUGS: Record<string, string | null> = {
  USA: "united-states",
  Colombia: "colombia",
  Germany: "germany",
  "United Kingdom": "united-kingdom",
  France: "france",
  Netherlands: "netherlands",
  Rwanda: "rwanda",
  Burundi: null,
  India: "india",
  China: null,
  "South Korea": "south-korea",
  Philippines: "philippines",
  Australia: "australia",
};

/** "AM Seoul" — what a chapter is called in the network list. */
export function chapterName(chapter: Chapter): string {
  return `AM ${chapter.city}`;
}

/** "Seoul, South Korea" — the line under the name. */
export function chapterLocation(chapter: Chapter): string {
  return `${chapter.city}, ${chapter.country}`;
}

/**
 * The chapters as the network lists them: every one but the international
 * headquarters, which is head office rather than a campus chapter.
 */
export const CHAPTER_LIST = CHAPTERS.filter((chapter) => chapter.role !== "global");
