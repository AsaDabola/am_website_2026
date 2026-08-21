"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  worldView,
  MAP_VIEW_LOADERS,
  type MapView,
  type MapViewKey,
} from "@/lib/mapViews";
import {
  CHAPTERS,
  networkRoutes,
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

/** Width of every generated map view's viewBox — see scripts/generate-map-views.mjs. */
const WIDTH = 1000;

const CAPTION_FONT_SIZE = 9.5;
const CAPTION_TRACKING = 1.6;

/**
 * Region captions, anchored to coordinates rather than fixed pixels so they
 * land correctly in whichever view is on screen. The text itself comes from
 * the messages, so these are keys rather than labels.
 */
const REGION_CAPTIONS: { key: string; lat: number; lng: number }[] = [
  { key: "regions.northamerica", lat: 52, lng: -103 },
  { key: "regions.southamerica", lat: 15, lng: -83 },
  { key: "regions.europe", lat: 58, lng: 14 },
  { key: "regions.africa", lat: 14, lng: 19 },
  { key: "map.captionSouthAsia", lat: 25, lng: 79 },
  { key: "map.captionEastCentralAsia", lat: 48, lng: 99 },
  { key: "map.captionSoutheastAsia", lat: 6, lng: 109 },
  { key: "regions.oceania", lat: -20, lng: 134 },
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

/**
 * Roughly half the width of a marker's label, in viewBox units. Approximated
 * from the glyph metrics rather than measured, which is all the label
 * declutter below needs.
 */
function labelReach(chapter: Placed) {
  const isGlobal = chapter.role === "global";
  const fontSize = isGlobal ? 8.5 : chapter.role === "regional" ? 8 : 7;
  const text = isGlobal ? `HQ \u00b7 ${chapter.city}, NJ` : chapter.city;
  return (text.length * fontSize * 0.5) / 2;
}

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
  const t = useTranslations("Network");
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

  // Routes follow the sending structure rather than fanning out of one point
  // — see networkRoutes. In a zoomed view only that continent's chapters are
  // passed in, so what comes back is that continent's spokes alone.
  const routes = useMemo(() => networkRoutes(placed), [placed]);

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
      const rank = (c: Placed) => (c.role === "global" ? 0 : c.role === "regional" ? 1 : 2);
      return rank(a) - rank(b) || a.x - b.x;
    });

    const keep = new Set<string>();
    const taken: { x: number; y: number; reach: number }[] = [];
    for (const chapter of ordered) {
      // A headquarters is never dropped — it is the anchor of everything
      // drawn around it, so an unlabelled one would read as an ordinary dot.
      const pinned = chapter.role !== undefined;
      const clashes =
        !pinned &&
        taken.some((p) => Math.hypot(p.x - chapter.x, p.y - chapter.y) < p.reach + MIN_GAP / 2);
      if (clashes) continue;
      keep.add(chapter.id);
      // How far this label reaches: a plain dot keeps its neighbours half a
      // gap away, but "HQ · Trenton, NJ" is several times the width of
      // "Paris", so the keep-out comes from the text rather than a flat
      // multiplier — a blanket one silently swallowed Dublin and Madrid.
      taken.push({ x: chapter.x, y: chapter.y, reach: Math.max(MIN_GAP / 2, labelReach(chapter)) });
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
          {t("map.world")} {CHAPTERS.length}
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
            {loadingKey === key ? t("map.loading") : `${t(`regions.${key}`)} ${counts[key]}`}
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
              ? t("map.worldAria", { count: CHAPTERS.length })
              : t("map.regionAria", {
                  count: placed.length,
                  region: t(`regions.${viewKey as RegionKey}`),
                })
          }
        >
          <defs>
            <radialGradient id="am-marker-glow">
              <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="am-hq-glow">
              <stop offset="0%" stopColor="#ffb457" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffb457" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="am-regional-glow">
              <stop offset="0%" stopColor="#eaf5ff" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#9fd4ff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
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

              // Captions are centre-anchored, so half the label hangs off each
              // side of x. The margin has to come from the label actually being
              // drawn, not a constant: translated names run much longer than
              // the English ones (a fixed clamp let "Восточная и Центральная
              // Азия" fall off the left edge). Approximated from the glyph
              // metrics below rather than measured, which is close enough to
              // keep the text inside the frame.
              const label = t(caption.key);
              const halfWidth = (label.length * (CAPTION_FONT_SIZE * 0.72 + CAPTION_TRACKING)) / 2;
              const margin = Math.min(halfWidth + 6, WIDTH / 2);
              const clampedX = Math.min(Math.max(x, margin), WIDTH - margin);
              return (
                <text
                  key={caption.key}
                  x={clampedX}
                  y={y}
                  textAnchor="middle"
                  fill="rgba(232,238,248,0.42)"
                  fontSize={CAPTION_FONT_SIZE}
                  fontWeight={600}
                  letterSpacing={CAPTION_TRACKING}
                  className="uppercase"
                >
                  {t(caption.key)}
                </text>
              );
            })}
          </g>

          <g fill="none" strokeLinecap="round">
            {routes.map(({ from, to }) => {
              const d = arcPath(from, to);
              // Trunk routes leave the international headquarters; spokes
              // leave a continental one. Colouring them apart is what makes
              // the two tiers readable at a glance.
              const isTrunk = from.role === "global";
              const isActive = activeId === to.id || activeId === from.id;
              return (
                <g key={`arc-${from.id}-${to.id}`}>
                  <path
                    d={d}
                    stroke={isTrunk ? "#ffb457" : "#7cc4ff"}
                    strokeWidth={isActive ? 1.6 : isTrunk ? 1.1 : 0.75}
                    opacity={isActive ? 1 : isTrunk ? 0.8 : 0.6}
                    className="transition-all duration-200"
                  />
                  <path
                    d={d}
                    stroke={isTrunk ? "#ffd8a3" : "#9fd4ff"}
                    strokeWidth={isTrunk ? 1.2 : 0.9}
                    opacity={0.95}
                    className="am-map-flow"
                  />
                </g>
              );
            })}
          </g>

          <g>
            {placed.map((chapter) => {
              const isActive = activeId === chapter.id;
              const isGlobal = chapter.role === "global";
              const isRegional = chapter.role === "regional";
              const radius = isGlobal ? 3.2 : isRegional ? 2.7 : 2;
              // The trunk is orange, the continental hubs are white-hot, and
              // the chapters they reach are the same blue as their spokes.
              const colour = isGlobal ? "#ffb457" : isRegional ? "#ffffff" : "#bfe0ff";

              return (
                <g
                  key={chapter.id}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isGlobal
                      ? `${chapter.city}, ${chapter.country} — ${t("map.hqBadge")}`
                      : isRegional
                        ? `${chapter.city}, ${chapter.country} — ${t("map.regionalHqBadge")}`
                        : `${chapter.city}, ${chapter.country}`
                  }
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
                    fill={`url(#${
                      isGlobal ? "am-hq-glow" : isRegional ? "am-regional-glow" : "am-marker-glow"
                    })`}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={chapter.x}
                    cy={chapter.y}
                    r={radius}
                    fill="none"
                    stroke={isGlobal ? "#ffb457" : isRegional ? "#dcefff" : "#7cc4ff"}
                    strokeWidth={0.8}
                    className="am-map-pulse"
                  />
                  <circle
                    cx={chapter.x}
                    cy={chapter.y}
                    r={isActive ? radius * 1.6 : radius}
                    fill={colour}
                    className="transition-all duration-200"
                  />
                  {(labelledIds.has(chapter.id) || isActive) && (
                    <text
                      x={chapter.x}
                      y={chapter.y - (isGlobal ? 9 : isRegional ? 8 : 7)}
                      textAnchor="middle"
                      className="pointer-events-none"
                      fill={
                        isGlobal
                          ? "#ffd8a3"
                          : isRegional || isActive
                            ? "#ffffff"
                            : "rgba(232,238,248,0.7)"
                      }
                      fontSize={isGlobal ? 8.5 : isRegional ? 8 : 7}
                      fontWeight={isGlobal || isRegional || isActive ? 700 : 500}
                    >
                      {isGlobal ? `${t("map.hqBadge")} · ${chapter.city}, NJ` : chapter.city}
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
                {selectedChapter.role && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-[0.08em] text-night ${
                      selectedChapter.role === "global" ? "bg-[#ffb457]" : "bg-white"
                    }`}
                  >
                    {selectedChapter.role === "global"
                      ? t("map.hqBadge")
                      : t("map.regionalHqBadge")}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-on-dark/70">
                {selectedChapter.country} · {t(`regions.${selectedChapter.region}`)}
              </p>
            </div>
            {isWorld ? (
              <button
                type="button"
                onClick={() => goTo(selectedChapter.region)}
                className="shrink-0 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-white hover:text-ink"
              >
                {t("map.zoomIn")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-white/60 hover:text-white"
              >
                {t("map.clear")}
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-on-dark/60">
            {isWorld
              ? t("map.worldHint")
              : t("map.regionHint", {
                  count: placed.length,
                  region: t(`regions.${viewKey as RegionKey}`),
                })}
          </p>
        )}
      </div>
    </div>
  );
}
