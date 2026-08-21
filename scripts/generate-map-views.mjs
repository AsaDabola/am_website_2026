/**
 * Precomputes every map view the network map can show: the world, plus a
 * zoomed view per region. Each view carries country outlines (and US state
 * outlines for North America) already projected into its own viewbox.
 *
 * Doing this at build time keeps d3-geo, topojson-client, world-atlas and
 * us-atlas out of the browser bundle — the client ships path strings plus a
 * handful of projection numbers.
 *
 * Every view uses the same equirectangular family so the design reads
 * identically at each zoom level, and so markers can be projected on the
 * client with plain arithmetic (see lib/chapters.ts).
 *
 * Run with:  node scripts/generate-map-views.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { geoEquirectangular, geoPath, geoBounds } from "d3-geo";
import { feature, mesh } from "topojson-client";

/**
 * geoPath emits full float precision, which triples the output for detail no
 * one can see at this size. This context rounds to one decimal place.
 */
function roundingContext(digits = 1) {
  const parts = [];
  const r = (n) => {
    const v = Number(n.toFixed(digits));
    return Number.isFinite(v) ? v : 0;
  };
  return {
    toString: () => parts.join(""),
    beginPath: () => (parts.length = 0),
    moveTo: (x, y) => parts.push(`M${r(x)},${r(y)}`),
    lineTo: (x, y) => parts.push(`L${r(x)},${r(y)}`),
    arc: () => {},
    closePath: () => parts.push("Z"),
  };
}

/** True when a feature's bounding box overlaps the view's lonLat window. */
function intersects(featureBounds, [[west, south], [east, north]]) {
  const [[fw, fs], [fe, fn]] = featureBounds;
  return !(fe < west || fw > east || fn < south || fs > north);
}

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const WIDTH = 1000;
const HEIGHT = 520;
const PAD = 18;

/**
 * lonLat bounds per view. The world view is clipped to inhabited latitudes —
 * equirectangular otherwise gives Antarctica a quarter of the frame.
 */
const VIEWS = {
  world: { bounds: [[-180, -56], [180, 80]], rotate: 100 },
  northamerica: { bounds: [[-168, 7], [-52, 70]], rotate: 0 },
  southamerica: { bounds: [[-118, -56], [-33, 33]], rotate: 0 },
  europe: { bounds: [[-25, 34], [45, 71]], rotate: 0 },
  africa: { bounds: [[-20, -36], [53, 38]], rotate: 0 },
  asia: { bounds: [[58, -11], [150, 55]], rotate: 0 },
  oceania: { bounds: [[110, -48], [179, -8]], rotate: 0 },
};

function loadCountries(resolution) {
  const topo = JSON.parse(
    readFileSync(resolve(root, `node_modules/world-atlas/countries-${resolution}.json`), "utf8"),
  );
  return {
    countries: feature(topo, topo.objects.countries),
    // Interior borders only — the coastline is already drawn by the land fill.
    borders: mesh(topo, topo.objects.countries, (a, b) => a !== b),
  };
}

const COARSE = loadCountries("110m");
const FINE = loadCountries("50m");

const usTopo = JSON.parse(
  readFileSync(resolve(root, "node_modules/us-atlas/states-10m.json"), "utf8"),
);
const usStates = mesh(usTopo, usTopo.objects.states, (a, b) => a !== b);

/**
 * Fitting to a Polygon is ambiguous: d3-geo reads a ring's winding order to
 * decide which side of the sphere it encloses, and the wrong order silently
 * fits the whole globe instead of the box. Points carry no winding, and
 * equirectangular is linear in lon/lat, so the corners fit the box exactly.
 */
function boundsCorners([[west, south], [east, north]]) {
  return {
    type: "MultiPoint",
    coordinates: [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
    ],
  };
}

const out = {};

for (const [name, config] of Object.entries(VIEWS)) {
  const projection = geoEquirectangular().rotate([config.rotate, 0]);
  projection.fitExtent(
    [
      [PAD, PAD],
      [WIDTH - PAD, HEIGHT - PAD],
    ],
    boundsCorners(config.bounds),
  );

  // Clip to the frame so off-screen geometry is not serialised at all.
  projection.clipExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ]);

  const context = roundingContext();
  const path = geoPath(projection, context);
  const source = COARSE;

  // Only the countries actually visible in this window.
  const visible = {
    type: "FeatureCollection",
    features: source.countries.features.filter((f) =>
      intersects(geoBounds(f), config.bounds),
    ),
  };

  const draw = (geometry) => {
    context.beginPath();
    path(geometry);
    return context.toString();
  };

  const view = {
    viewBox: [0, 0, WIDTH, HEIGHT],
    // Enough to reproduce the projection client-side.
    rotate: config.rotate,
    scale: projection.scale(),
    translate: projection.translate(),
    land: draw(visible),
    borders: draw(source.borders),
  };

  // State outlines only matter where the design calls for that much detail.
  if (name === "northamerica") {
    view.subdivisions = draw(usStates);
  }

  out[name] = view;
}

const TYPES = `export type MapView = {
  viewBox: readonly [number, number, number, number];
  rotate: number;
  scale: number;
  translate: readonly [number, number];
  land: string;
  borders: string;
  subdivisions?: string;
};
`;

mkdirSync(resolve(root, "src/lib/mapViews"), { recursive: true });

// One file per view, so the client can load the world immediately and pull a
// region's geometry only when someone actually zooms into it.
for (const [name, view] of Object.entries(out)) {
  writeFileSync(
    resolve(root, `src/lib/mapViews/${name}.ts`),
    `// GENERATED by scripts/generate-map-views.mjs — do not edit by hand.\n` +
      `import type { MapView } from "./types";\n` +
      `const view: MapView = ${JSON.stringify(view)};\nexport default view;\n`,
    "utf8",
  );
}

writeFileSync(
  resolve(root, "src/lib/mapViews/types.ts"),
  `// GENERATED by scripts/generate-map-views.mjs — do not edit by hand.\n${TYPES}` +
    `export type MapViewKey = ${Object.keys(out).map((k) => `"${k}"`).join(" | ")};\n`,
  "utf8",
);

// Static import map — a template literal import would defeat code splitting.
const loaders = Object.keys(out)
  .map((k) => `  ${k}: () => import("./${k}").then((m) => m.default),`)
  .join("\n");

writeFileSync(
  resolve(root, "src/lib/mapViews/index.ts"),
  `// GENERATED by scripts/generate-map-views.mjs — do not edit by hand.\n` +
    `import type { MapView, MapViewKey } from "./types";\n` +
    `export type { MapView, MapViewKey };\n` +
    `export { default as worldView } from "./world";\n\n` +
    `export const MAP_VIEW_LOADERS: Record<MapViewKey, () => Promise<MapView>> = {\n${loaders}\n};\n`,
  "utf8",
);

const sizes = Object.entries(out)
  .map(([k, v]) => `${k}=${Math.round((v.land.length + v.borders.length + (v.subdivisions?.length ?? 0)) / 1024)}KB`)
  .join(" ");
console.log(`wrote src/lib/mapViews/* (${sizes})`);
