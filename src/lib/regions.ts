import type { Continent } from "./tenants";

export const regions: { slug: Continent; label: string; from: string; to: string }[] = [
  { slug: "africa", label: "Africa", from: "#c2712f", to: "#5a2e0c" },
  { slug: "asia", label: "Asia", from: "#c23a3a", to: "#4a0f0f" },
  { slug: "europe", label: "Europe", from: "#2a5eec", to: "#0d1f52" },
  { slug: "northamerica", label: "North America", from: "#1449c6", to: "#050a2e" },
  { slug: "southamerica", label: "South America", from: "#2f9e6e", to: "#0c3324" },
  { slug: "oceania", label: "Oceania", from: "#3ab3c2", to: "#0d3a40" },
];
