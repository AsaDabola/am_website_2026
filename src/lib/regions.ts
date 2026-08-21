import type { Continent } from "./tenants";

// Slug plus the gradient the region card is painted with. The human-readable
// name is NOT here — it comes from the `Network.regions` messages so it is
// translated, and having a second copy would only let the two drift apart.
export const regions: { slug: Continent; from: string; to: string }[] = [
  { slug: "africa", from: "#c2712f", to: "#5a2e0c" },
  { slug: "asia", from: "#c23a3a", to: "#4a0f0f" },
  { slug: "europe", from: "#2a5eec", to: "#0d1f52" },
  { slug: "northamerica", from: "#1449c6", to: "#050a2e" },
  { slug: "southamerica", from: "#2f9e6e", to: "#0c3324" },
  { slug: "oceania", from: "#3ab3c2", to: "#0d3a40" },
];
