import type { MapView } from "./mapViews/types";

export type Chapter = {
  city: string;
  country: string;
  region: RegionKey;
  lat: number;
  lng: number;
  /** AM's headquarters, drawn larger and used as the origin of the arcs. */
  hq?: true;
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
  // North America
  { city: "Trenton", country: "USA", region: "northamerica", lat: 40.2206, lng: -74.7597, hq: true },
  { city: "New York", country: "USA", region: "northamerica", lat: 40.7128, lng: -74.006 },
  { city: "Atlanta", country: "USA", region: "northamerica", lat: 33.749, lng: -84.388 },
  { city: "Boston", country: "USA", region: "northamerica", lat: 42.3601, lng: -71.0589 },
  { city: "Burlington", country: "USA", region: "northamerica", lat: 44.4759, lng: -73.2121 },
  { city: "Detroit", country: "USA", region: "northamerica", lat: 42.3314, lng: -83.0458 },
  { city: "Houston", country: "USA", region: "northamerica", lat: 29.7604, lng: -95.3698 },
  { city: "Los Angeles", country: "USA", region: "northamerica", lat: 34.0522, lng: -118.2437 },
  { city: "Nashville", country: "USA", region: "northamerica", lat: 36.1627, lng: -86.7816 },
  { city: "New Haven", country: "USA", region: "northamerica", lat: 41.3083, lng: -72.9279 },
  { city: "Philadelphia", country: "USA", region: "northamerica", lat: 39.9526, lng: -75.1652 },
  { city: "Princeton", country: "USA", region: "northamerica", lat: 40.3573, lng: -74.6672 },
  { city: "Raleigh", country: "USA", region: "northamerica", lat: 35.7796, lng: -78.6382 },
  { city: "San Diego", country: "USA", region: "northamerica", lat: 32.7157, lng: -117.1611 },
  { city: "San Francisco", country: "USA", region: "northamerica", lat: 37.7749, lng: -122.4194 },
  { city: "Seattle", country: "USA", region: "northamerica", lat: 47.6062, lng: -122.3321 },
  { city: "St. Louis", country: "USA", region: "northamerica", lat: 38.627, lng: -90.1994 },
  { city: "Washington DC", country: "USA", region: "northamerica", lat: 38.9072, lng: -77.0369 },
  { city: "Wichita", country: "USA", region: "northamerica", lat: 37.6872, lng: -97.3301 },
  { city: "Montreal", country: "Canada", region: "northamerica", lat: 45.5019, lng: -73.5674 },
  { city: "Toronto", country: "Canada", region: "northamerica", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", country: "Canada", region: "northamerica", lat: 49.2827, lng: -123.1207 },

  // Latin America & Caribbean
  { city: "Mexico City", country: "Mexico", region: "southamerica", lat: 19.4326, lng: -99.1332 },
  { city: "Bogotá", country: "Colombia", region: "southamerica", lat: 4.711, lng: -74.0721 },
  { city: "Caracas", country: "Venezuela", region: "southamerica", lat: 10.4806, lng: -66.9036 },
  { city: "Lima", country: "Peru", region: "southamerica", lat: -12.0464, lng: -77.0428 },
  { city: "La Paz", country: "Bolivia", region: "southamerica", lat: -16.4897, lng: -68.1193 },
  { city: "São Paulo", country: "Brazil", region: "southamerica", lat: -23.5505, lng: -46.6333 },
  { city: "Montevideo", country: "Uruguay", region: "southamerica", lat: -34.9011, lng: -56.1645 },
  { city: "Buenos Aires", country: "Argentina", region: "southamerica", lat: -34.6037, lng: -58.3816 },

  // Europe
  { city: "London", country: "United Kingdom", region: "europe", lat: 51.5074, lng: -0.1278 },
  { city: "Dublin", country: "Ireland", region: "europe", lat: 53.3498, lng: -6.2603 },
  { city: "Paris", country: "France", region: "europe", lat: 48.8566, lng: 2.3522 },
  { city: "Amsterdam", country: "Netherlands", region: "europe", lat: 52.3676, lng: 4.9041 },
  { city: "Frankfurt", country: "Germany", region: "europe", lat: 50.1109, lng: 8.6821 },
  { city: "Madrid", country: "Spain", region: "europe", lat: 40.4168, lng: -3.7038 },
  { city: "Warsaw", country: "Poland", region: "europe", lat: 52.2297, lng: 21.0122 },

  // Africa
  { city: "Cairo", country: "Egypt", region: "africa", lat: 30.0444, lng: 31.2357 },
  { city: "Lagos", country: "Nigeria", region: "africa", lat: 6.5244, lng: 3.3792 },
  { city: "Kinshasa", country: "DR Congo", region: "africa", lat: -4.4419, lng: 15.2663 },
  { city: "Addis Ababa", country: "Ethiopia", region: "africa", lat: 9.03, lng: 38.74 },
  { city: "Nairobi", country: "Kenya", region: "africa", lat: -1.2921, lng: 36.8219 },
  { city: "Kampala", country: "Uganda", region: "africa", lat: 0.3476, lng: 32.5825 },
  { city: "Dar es Salaam", country: "Tanzania", region: "africa", lat: -6.7924, lng: 39.2083 },
  { city: "Lusaka", country: "Zambia", region: "africa", lat: -15.3875, lng: 28.3228 },
  { city: "Harare", country: "Zimbabwe", region: "africa", lat: -17.8252, lng: 31.0335 },

  // Asia
  { city: "Seoul", country: "South Korea", region: "asia", lat: 37.5665, lng: 126.978 },
  { city: "Tokyo", country: "Japan", region: "asia", lat: 35.6762, lng: 139.6503 },
  { city: "Beijing", country: "China", region: "asia", lat: 39.9042, lng: 116.4074 },
  { city: "Macau", country: "Macau", region: "asia", lat: 22.1987, lng: 113.5439 },
  { city: "Ulaanbaatar", country: "Mongolia", region: "asia", lat: 47.8864, lng: 106.9057 },
  { city: "Hanoi", country: "Vietnam", region: "asia", lat: 21.0278, lng: 105.8342 },
  { city: "Vientiane", country: "Laos", region: "asia", lat: 17.9757, lng: 102.6331 },
  { city: "Bangkok", country: "Thailand", region: "asia", lat: 13.7563, lng: 100.5018 },
  { city: "Phnom Penh", country: "Cambodia", region: "asia", lat: 11.5564, lng: 104.9282 },
  { city: "Kuala Lumpur", country: "Malaysia", region: "asia", lat: 3.139, lng: 101.6869 },
  { city: "Jakarta", country: "Indonesia", region: "asia", lat: -6.2088, lng: 106.8456 },
  { city: "Manila", country: "Philippines", region: "asia", lat: 14.5995, lng: 120.9842 },
  { city: "Chennai", country: "India", region: "asia", lat: 13.0827, lng: 80.2707 },

  // Oceania
  { city: "Sydney", country: "Australia", region: "oceania", lat: -33.8688, lng: 151.2093 },
];

export const HQ = CHAPTERS.find((chapter) => chapter.hq)!;
