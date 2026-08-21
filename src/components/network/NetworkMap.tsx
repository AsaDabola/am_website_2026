"use client";

import { useCallback, useMemo, useState } from "react";
import {
  worldView,
  MAP_VIEW_LOADERS,
  type MapView,
  type MapViewKey,
} from "@/lib/mapViews";
import {
  CHAPTERS,
  REGION_LABELS,
  projectForView,
  type Chapter,
  type RegionKey,
} from "@/lib/chapters";

const REGION_ORDER: RegionKey[] = [
  "northamerica",
  "southamerica",
  "europe",
  "africa",
  "asia",
  "oceania",
];

type Placed = Chapter & { x: number; y: number; id: string };

/**
 * Region captions, anchored to coordinates rather than fixed pixels so they
 * land correctly in whichever view is on screen.
 */
const REGION_CAPTIONS: { label: string; lat: number; lng: number }[] = [
  { label: "North America", lat: 52, lng: -103 },
  { label: "Latin America & Caribbean", lat: 15, lng: -83 },
  { label: "Europe", lat: 58, lng: 14 },
  { label: "Africa", lat: 14, lng: 19 },
  { label: "South Asia", lat: 25, lng: 79 },
  { label: "East & Central Asia", lat: 48, lng: 99 },
  { label: "Southeast Asia", lat: 6, lng: 109 },
  { label: "Oceania", lat: -20, lng: 134 },
];

/** Deterministic star field — a seeded sequence so server and client agree. */
const STARS = Array.from({ length: 90 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return {
    x: Math.abs(a - Math.floor(a)) * 1000,
    y: Math.abs(b - Math.floor(b)) * 520,
    r: 0.4 + Math.abs(a - Math.floor(a)) * 0.8,
    delay: (i % 7) * 0.6,
  };
});

/** Quadratic arc bowed perpendicular to the run, so routes fan out. */
function arcPath(from: Placed, to: Placed) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const bow = Math.min(distance * 0.22, 80);
  const nx = -dy / distance;
  const ny = dx / distance;
  const sign = ny > 0 ? -1 : 1;
  return `M ${from.x} ${from.y} Q ${midX + nx * bow * sign} ${midY + ny * bow * sign} ${to.x} ${to.y}`;
}

export default function NetworkMap() {
  const [viewKey, setViewKey] = useState<MapViewKey>("world");
  const [view, setView] = useState<MapView>(worldView);
  const [loadingKey, setLoadingKey] = useState<MapViewKey | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const isWorld = viewKey === "world";

  const goTo = useCallback(
    async (key: MapViewKey) => {
      if (key === viewKey) return;
      setLoadingKey(key);
      try {
        const next = key === "world" ? worldView : await MAP_VIEW_LOADERS[key]();
        setView(next);
        setViewKey(key);
        setSelected(null);
        setHovered(null);
      } finally {
        setLoadingKey(null);
      }
    },
    [viewKey],
  );

  // Zoomed views show only that region's chapters; the world shows everything.
  const visibleChapters = useMemo(
    () => (isWorld ? CHAPTERS : CHAPTERS.filter((c) => c.region === viewKey)),
    [isWorld, viewKey],
  );

  const placed = useMemo<Placed[]>(
    () =>
      visibleChapters.map((chapter) => ({
        ...chapter,
        ...projectForView(chapter.lat, chapter.lng, view),
        id: `${chapter.city}-${chapter.country}`,
      })),
    [visibleChapters, view],
  );

  const hq = placed.find((c) => c.hq) ?? null;
  const activeId = hovered ?? selected;
  const selectedChapter = placed.find((c) => c.id === selected) ?? null;

  const counts = useMemo(() => {
    const map = {} as Record<RegionKey, number>;
    for (const key of REGION_ORDER) map[key] = 0;
    for (const chapter of CHAPTERS) map[chapter.region] += 1;
    return map;
  }, []);

  /**
   * Which markers get a permanent label when zoomed in. Chapters cluster
   * tightly — the US north-east alone has eight within a few pixels — so a
   * label is dropped when it would land on one already placed. The hub is
   * always labelled; the rest are taken west to east so the choice is stable.
   */
  const labelledIds = useMemo(() => {
    // The world view packs cities far closer together, so it tolerates a
    // tighter gap before labels start colliding.
    const MIN_GAP = isWorld ? 17 : 26;
    const ordered = [...placed].sort((a, b) => {
      if (a.hq !== b.hq) return a.hq ? -1 : 1;
      return a.x - b.x;
    });

    const keep = new Set<string>();
    const taken: { x: number; y: number }[] = [];
    for (const chapter of ordered) {
      const clashes = taken.some(
        (p) => Math.hypot(p.x - chapter.x, p.y - chapter.y) < MIN_GAP,
      );
      if (clashes) continue;
      keep.add(chapter.id);
      taken.push({ x: chapter.x, y: chapter.y });
    }
    return keep;
  }, [isWorld, placed]);

  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => goTo("world")}
          aria-pressed={isWorld}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
            isWorld
              ? "bg-white text-night"
              : "border border-white/25 text-white/70 hover:border-white/60 hover:text-white"
          }`}
        >
          World {CHAPTERS.length}
        </button>
        {REGION_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => goTo(key)}
            aria-pressed={viewKey === key}
            disabled={loadingKey !== null}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-50 ${
              viewKey === key
                ? "bg-white text-night"
                : "border border-white/25 text-white/70 hover:border-white/60 hover:text-white"
            }`}
          >
            {loadingKey === key ? "Loading…" : `${REGION_LABELS[key]} ${counts[key]}`}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        {/* Warm hub glow behind the map, as in the reference. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 55% 26%, rgba(232,145,58,0.28) 0%, rgba(0,122,255,0.18) 30%, rgba(0,122,255,0) 58%)",
          }}
        />

        <svg
          viewBox={view.viewBox.join(" ")}
          className="relative w-full"
          role="img"
          aria-label={
            isWorld
              ? `World map showing all ${CHAPTERS.length} AM chapters. Use the region buttons to zoom in.`
              : `${REGION_LABELS[viewKey as RegionKey]} map showing ${placed.length} AM chapters.`
          }
        >
          <defs>
            <linearGradient id="am-arc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffb457" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#7cc4ff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0.15" />
            </linearGradient>
            <radialGradient id="am-marker-glow">
              <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="am-hq-glow">
              <stop offset="0%" stopColor="#ffb457" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffb457" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g aria-hidden>
            {STARS.map((star, i) => (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.r}
                fill="rgba(255,255,255,0.7)"
                className="am-map-twinkle"
                style={{ animationDelay: `${star.delay}s` }}
              />
            ))}
          </g>

          {/* Land, national borders, and state lines where we have them. */}
          <path
            d={view.land}
            fill="rgba(77,141,246,0.12)"
            stroke="rgba(77,141,246,0.7)"
            strokeWidth={0.75}
            strokeLinejoin="round"
          />
          {view.subdivisions && (
            <path
              d={view.subdivisions}
              fill="none"
              stroke="rgba(124,196,255,0.3)"
              strokeWidth={0.4}
            />
          )}
          <path
            d={view.borders}
            fill="none"
            stroke="rgba(77,141,246,0.4)"
            strokeWidth={0.4}
          />

          <g aria-hidden>
            {REGION_CAPTIONS.map((caption) => {
              const { x, y } = projectForView(caption.lat, caption.lng, view);
              if (x < -60 || x > 1060 || y < 0 || y > 520) return null;
              // Captions are centre-anchored and some are wide, so they are
              // held inside a margin rather than allowed to run off the frame.
              const clampedX = Math.min(Math.max(x, 96), 904);
              return (
                <text
                  key={caption.label}
                  x={clampedX}
                  y={y}
                  textAnchor="middle"
                  fill="rgba(232,238,248,0.42)"
                  fontSize={9.5}
                  fontWeight={600}
                  letterSpacing="1.6"
                  className="uppercase"
                >
                  {caption.label}
                </text>
              );
            })}
          </g>

          {/* Routes, drawn only where the hub is actually in frame. */}
          {hq && (
            <g fill="none" strokeLinecap="round">
              {placed
                .filter((chapter) => !chapter.hq)
                .map((chapter) => {
                  const d = arcPath(hq, chapter);
                  const isActive = activeId === chapter.id;
                  return (
                    <g key={`arc-${chapter.id}`}>
                      <path
                        d={d}
                        stroke="url(#am-arc)"
                        strokeWidth={isActive ? 1.4 : 0.7}
                        opacity={isActive ? 1 : 0.45}
                        className="transition-all duration-200"
                      />
                      <path
                        d={d}
                        stroke="#ffd8a3"
                        strokeWidth={1.2}
                        opacity={0.95}
                        className="am-map-flow"
                      />
                    </g>
                  );
                })}
            </g>
          )}

          <g>
            {placed.map((chapter) => {
              const isActive = activeId === chapter.id;
              const radius = chapter.hq ? 3.2 : 2;

              return (
                <g
                  key={chapter.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${chapter.city}, ${chapter.country}${chapter.hq ? " — headquarters" : ""}`}
                  aria-pressed={selected === chapter.id}
                  onMouseEnter={() => setHovered(chapter.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(chapter.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() =>
                    setSelected((current) => (current === chapter.id ? null : chapter.id))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected((current) => (current === chapter.id ? null : chapter.id));
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <circle
                    cx={chapter.x}
                    cy={chapter.y}
                    r={isActive ? radius * 5 : radius * 3}
                    fill={`url(#${chapter.hq ? "am-hq-glow" : "am-marker-glow"})`}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={chapter.x}
                    cy={chapter.y}
                    r={radius}
                    fill="none"
                    stroke={chapter.hq ? "#ffb457" : "#7cc4ff"}
                    strokeWidth={0.8}
                    className="am-map-pulse"
                  />
                  <circle
                    cx={chapter.x}
                    cy={chapter.y}
                    r={isActive ? radius * 1.6 : radius}
                    fill={chapter.hq ? "#ffb457" : "#bfe0ff"}
                    className="transition-all duration-200"
                  />
                  {(labelledIds.has(chapter.id) || isActive) && (
                    <text
                      x={chapter.x}
                      y={chapter.y - (chapter.hq ? 9 : 7)}
                      textAnchor="middle"
                      className="pointer-events-none"
                      fill={chapter.hq ? "#ffd8a3" : isActive ? "#ffffff" : "rgba(232,238,248,0.7)"}
                      fontSize={chapter.hq ? 8.5 : 7}
                      fontWeight={chapter.hq || isActive ? 700 : 500}
                    >
                      {chapter.hq ? `HQ · ${chapter.city}, NJ` : chapter.city}
                    </text>
                  )}
                  <circle cx={chapter.x} cy={chapter.y} r={9} fill="transparent" />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-6 min-h-[76px]" aria-live="polite">
        {selectedChapter ? (
          <div className="mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4 backdrop-blur-sm">
            <div>
              <p className="font-display text-lg font-bold text-white">
                {selectedChapter.city}
                {selectedChapter.hq && (
                  <span className="ml-2 rounded-full bg-[#ffb457] px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-[0.08em] text-night">
                    HQ
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-on-dark/70">
                {selectedChapter.country} · {REGION_LABELS[selectedChapter.region]}
              </p>
            </div>
            {isWorld ? (
              <button
                type="button"
                onClick={() => goTo(selectedChapter.region)}
                className="shrink-0 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-white hover:text-ink"
              >
                Zoom in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-white/60 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-on-dark/60">
            {isWorld
              ? "Hover or focus a point to see the city — select one to zoom into its region."
              : `${placed.length} ${placed.length === 1 ? "chapter" : "chapters"} in ${REGION_LABELS[viewKey as RegionKey]}. Select a point for detail, or return to the world map.`}
          </p>
        )}
      </div>
    </div>
  );
}
