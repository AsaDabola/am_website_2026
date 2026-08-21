"use client";

import { useMemo, useState } from "react";
import { WORLD_DOTS, WORLD_VIEWBOX } from "@/lib/worldDots";
import {
  CHAPTERS,
  REGION_LABELS,
  projectToMap,
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

/** Quadratic arc from HQ, bowed perpendicular to the run so routes fan out. */
function arcPath(from: Placed, to: Placed) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const bow = Math.min(distance * 0.22, 70);
  // Perpendicular offset, always bowing "upward" on screen.
  const nx = -dy / (distance || 1);
  const ny = dx / (distance || 1);
  const sign = ny > 0 ? -1 : 1;
  return `M ${from.x} ${from.y} Q ${midX + nx * bow * sign} ${midY + ny * bow * sign} ${to.x} ${to.y}`;
}

export default function NetworkMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [region, setRegion] = useState<RegionKey | "all">("all");

  const placed = useMemo<Placed[]>(
    () =>
      CHAPTERS.map((chapter) => ({
        ...chapter,
        ...projectToMap(chapter.lat, chapter.lng),
        id: `${chapter.city}-${chapter.country}`,
      })),
    [],
  );

  const hq = useMemo(() => placed.find((c) => c.hq)!, [placed]);
  const activeId = hovered ?? selected;
  const active = placed.find((c) => c.id === activeId) ?? null;
  const selectedChapter = placed.find((c) => c.id === selected) ?? null;

  const isDimmed = (chapter: Placed) => region !== "all" && chapter.region !== region;

  const counts = useMemo(() => {
    const map = {} as Record<RegionKey, number>;
    for (const key of REGION_ORDER) map[key] = 0;
    for (const chapter of CHAPTERS) map[chapter.region] += 1;
    return map;
  }, []);

  return (
    <div className="relative">
      {/* Region filter */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setRegion("all")}
          aria-pressed={region === "all"}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
            region === "all"
              ? "bg-white text-night"
              : "border border-white/25 text-white/70 hover:border-white/60 hover:text-white"
          }`}
        >
          All {CHAPTERS.length}
        </button>
        {REGION_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRegion(region === key ? "all" : key)}
            aria-pressed={region === key}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
              region === key
                ? "bg-white text-night"
                : "border border-white/25 text-white/70 hover:border-white/60 hover:text-white"
            }`}
          >
            {REGION_LABELS[key]} {counts[key]}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 ${WORLD_VIEWBOX.minY} ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.cropHeight}`}
          className="w-full"
          role="img"
          aria-label={`World map showing ${CHAPTERS.length} AM chapters. Use Tab to move between chapters.`}
        >
          <defs>
            <radialGradient id="am-marker-glow">
              <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="am-hq-glow">
              <stop offset="0%" stopColor="#ffb457" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffb457" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Land */}
          <g fill="#2a5eec" opacity={0.32}>
            {WORLD_DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={0.9} />
            ))}
          </g>

          {/* Routes from HQ */}
          <g fill="none" strokeLinecap="round">
            {placed
              .filter((chapter) => !chapter.hq)
              .map((chapter) => {
                const isActive = activeId === chapter.id;
                return (
                  <path
                    key={`arc-${chapter.id}`}
                    d={arcPath(hq, chapter)}
                    stroke={isActive ? "#ffb457" : "#4d8df6"}
                    strokeWidth={isActive ? 1.1 : 0.4}
                    opacity={isDimmed(chapter) ? 0.04 : isActive ? 0.95 : 0.22}
                    className="transition-all duration-200"
                  />
                );
              })}
          </g>

          {/* Chapter markers */}
          <g>
            {placed.map((chapter) => {
              const isActive = activeId === chapter.id;
              const dimmed = isDimmed(chapter);
              const radius = chapter.hq ? 3.4 : 2.1;

              return (
                <g
                  key={chapter.id}
                  role="button"
                  tabIndex={dimmed ? -1 : 0}
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
                  opacity={dimmed ? 0.18 : 1}
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
                    r={isActive ? radius * 1.6 : radius}
                    fill={chapter.hq ? "#ffb457" : "#bfe0ff"}
                    className="transition-all duration-200"
                  />
                  {/* Generous invisible hit area — the dots themselves are tiny. */}
                  <circle cx={chapter.x} cy={chapter.y} r={9} fill="transparent" />
                </g>
              );
            })}
          </g>

          {/* Label for whichever marker is active */}
          {active && (
            <text
              x={active.x}
              y={active.y - 12}
              textAnchor="middle"
              className="pointer-events-none"
              fill="#ffffff"
              fontSize={11}
              fontWeight={700}
            >
              {active.city}
            </text>
          )}
        </svg>
      </div>

      {/* Detail panel for the selected chapter */}
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
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-white/60 hover:text-white"
            >
              Clear
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-on-dark/60">
            Hover or focus a point to see the city — select one to keep it open.
          </p>
        )}
      </div>
    </div>
  );
}
