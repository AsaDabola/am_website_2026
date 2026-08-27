"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LAND_LAT, LAND_LNG } from "@/lib/globePoints";
import { CHAPTERS } from "@/lib/chapters";
import { SearchIcon, CloseIcon, ChevronDownIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { DirectoryCountry } from "@/lib/countryDirectory";

/**
 * The network as a turning globe rather than a flat map.
 *
 * The point cloud is precomputed (scripts/generate-globe-points.mjs) and
 * projected here with plain trigonometry, so no projection library reaches the
 * browser — the same bargain the flat map makes. Everything is drawn to one
 * canvas: 13,000 dots as DOM nodes would not survive a scroll.
 */

const TO_RAD = Math.PI / 180;

/** Degrees per second. Slow enough to read a country name off the surface. */
const SPIN = 4;
/** Tilt, so the globe is seen slightly from above like the reference. */
const TILT = 14 * TO_RAD;

type Filter = { id: string; label: string; options: string[] };

export default function NetworkGlobe({
  heading,
  subtitle,
  searchPlaceholder,
  countries,
  regionLabels,
  primaryCta,
  secondaryCta,
  stats,
}: {
  heading: string;
  subtitle: string;
  searchPlaceholder: string;
  countries: DirectoryCountry[];
  /** Continent key to its translated name, so the globe stays server-free. */
  regionLabels: Record<string, string>;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: { label: string; value: string }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, string>>({});

  /**
   * Longitude of the point facing the viewer. Held in a ref rather than state
   * because it changes every frame and nothing in the DOM depends on it.
   */
  const spin = useRef(0);
  /** Where the user has dragged to, added to the automatic spin. */
  const drag = useRef({ active: false, startX: 0, startSpin: 0, offset: 0 });

  const filters: Filter[] = useMemo(() => {
    const unique = (values: (string | undefined)[]) =>
      Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
    return [
      {
        id: "region",
        label: "Region",
        options: unique(countries.map((c) => regionLabels[c.continent])),
      },
      { id: "country", label: "Country", options: unique(countries.map((c) => c.country)) },
      { id: "status", label: "Site status", options: ["Live", "Coming soon"] },
    ];
  }, [countries, regionLabels]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return countries.filter((country) => {
      if (chosen.region && regionLabels[country.continent] !== chosen.region) return false;
      if (chosen.country && country.country !== chosen.country) return false;
      if (chosen.status === "Live" && !country.live) return false;
      if (chosen.status === "Coming soon" && country.live) return false;
      if (!needle) return false;
      return (
        country.country.toLowerCase().includes(needle) ||
        (country.city ?? "").toLowerCase().includes(needle) ||
        (regionLabels[country.continent] ?? "").toLowerCase().includes(needle)
      );
    });
  }, [countries, query, chosen, regionLabels]);

  const hasFilters = Object.values(chosen).some(Boolean);
  const showResults = query.trim() !== "" || hasFilters;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let radius = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const box = canvas!.getBoundingClientRect();
      width = box.width;
      height = box.height;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Sized off both axes so the globe fills a tall frame without
      // overflowing a wide one — on a laptop it bleeds past the top and
      // bottom the way the reference does.
      radius = Math.min(width * 0.42, height * 0.58);
    }

    /** Chapter coordinates, as the bright clusters on the surface. */
    const markers = CHAPTERS.map((chapter) => ({ lat: chapter.lat, lng: chapter.lng }));

    function draw(time: number) {
      if (!reduced) spin.current = (time / 1000) * SPIN;
      const rotation = (spin.current + drag.current.offset) * TO_RAD;
      const cx = width / 2;
      const cy = height / 2;

      context!.clearRect(0, 0, width, height);

      // Atmosphere: a soft disc behind the surface so the rim reads as a
      // sphere rather than a circle of dots.
      const glow = context!.createRadialGradient(cx, cy, radius * 0.68, cx, cy, radius * 1.2);
      glow.addColorStop(0, "rgba(70,135,255,0.14)");
      glow.addColorStop(0.7, "rgba(40,96,220,0.09)");
      glow.addColorStop(1, "rgba(10,20,60,0)");
      context!.fillStyle = glow;
      context!.beginPath();
      context!.arc(cx, cy, radius * 1.16, 0, Math.PI * 2);
      context!.fill();

      // Graticule: meridians and parallels, faint, drawn before the land so
      // the dots sit on top of the wireframe.
      context!.strokeStyle = "rgba(150,180,230,0.10)";
      context!.lineWidth = 0.6;
      for (let lat = -60; lat <= 60; lat += 20) {
        context!.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 3) {
          const point = project(lat, lng, rotation, cx, cy, radius);
          if (!point) {
            started = false;
            continue;
          }
          if (started) context!.lineTo(point.x, point.y);
          else {
            context!.moveTo(point.x, point.y);
            started = true;
          }
        }
        context!.stroke();
      }
      for (let lng = -180; lng < 180; lng += 20) {
        context!.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 3) {
          const point = project(lat, lng, rotation, cx, cy, radius);
          if (!point) {
            started = false;
            continue;
          }
          if (started) context!.lineTo(point.x, point.y);
          else {
            context!.moveTo(point.x, point.y);
            started = true;
          }
        }
        context!.stroke();
      }

      // Land. Dots near the rim are dimmer and smaller, which is what makes a
      // flat scatter read as a curved surface.
      for (let i = 0; i < LAND_LAT.length; i++) {
        const point = project(LAND_LAT[i] / 10, LAND_LNG[i] / 10, rotation, cx, cy, radius);
        if (!point) continue;
        const depth = point.z;
        context!.globalAlpha = 0.22 + depth * 0.78;
        context!.fillStyle = "#eaf2ff";
        const size = 0.7 + depth * 1.3;
        context!.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      }

      // Chapters, as haloed points bright enough to find at a glance.
      for (const marker of markers) {
        const point = project(marker.lat, marker.lng, rotation, cx, cy, radius);
        if (!point) continue;
        const depth = point.z;
        context!.globalAlpha = 0.12 + depth * 0.5;
        context!.fillStyle = "#7db4ff";
        context!.beginPath();
        context!.arc(point.x, point.y, 5 + depth * 5, 0, Math.PI * 2);
        context!.fill();
        context!.globalAlpha = 0.5 + depth * 0.5;
        context!.fillStyle = "#ffffff";
        context!.beginPath();
        context!.arc(point.x, point.y, 1 + depth * 1.1, 0, Math.PI * 2);
        context!.fill();
      }

      context!.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /** Drag to turn the globe by hand; the automatic spin carries on beneath. */
  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    drag.current.active = true;
    drag.current.startX = event.clientX;
    drag.current.startSpin = drag.current.offset;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current.active) return;
    drag.current.offset = drag.current.startSpin + (event.clientX - drag.current.startX) * 0.25;
  }
  function onPointerUp() {
    drag.current.active = false;
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#05070f]">
      <canvas
        ref={canvasRef}
        aria-hidden
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing"
      />
      {/* Darkens the top and bottom so the heading and the footer row keep
          their contrast wherever the globe happens to have turned to. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,15,0.86) 0%, rgba(5,7,15,0.25) 32%, rgba(5,7,15,0.25) 62%, rgba(5,7,15,0.9) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[760px] w-full max-w-[1280px] flex-col px-6 py-16 lg:px-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="max-w-[22ch] font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[56px] lg:text-[68px]">
            {heading}
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-white/70">{subtitle}</p>

          <div className="mt-10 w-full max-w-[1000px]">
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 backdrop-blur-sm focus-within:border-white/35">
              <span className="text-white/60">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/45 focus:outline-none"
              />
              {(query || hasFilters) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setChosen({});
                  }}
                  aria-label="Clear search"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  <CloseIcon className="size-4" />
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2.5">
              {filters.map((filter) => (
                <div key={filter.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
                    aria-expanded={openFilter === filter.id}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                      chosen[filter.id]
                        ? "border-white/45 bg-white/15 text-white"
                        : "border-white/15 bg-white/[0.06] text-white/70 hover:text-white"
                    }`}
                  >
                    {chosen[filter.id] ?? filter.label}
                    <ChevronDownIcon />
                  </button>
                  {/* The panel is centred under its chip where there is room,
                      and pinned to the chip's leading edge on a phone, where a
                      centred panel runs off the side of the screen. */}
                  {openFilter === filter.id && (
                    <div className="absolute top-full z-20 mt-2 max-h-72 w-[min(14rem,calc(100vw-3rem))] overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1020] p-1.5 text-start shadow-2xl max-sm:start-0 sm:left-1/2 sm:-translate-x-1/2">
                      <button
                        type="button"
                        onClick={() => {
                          setChosen((previous) => ({ ...previous, [filter.id]: "" }));
                          setOpenFilter(null);
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-[13px] text-white/60 hover:bg-white/10"
                      >
                        Any {filter.label.toLowerCase()}
                      </button>
                      {filter.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setChosen((previous) => ({ ...previous, [filter.id]: option }));
                            setOpenFilter(null);
                          }}
                          className="block w-full rounded-xl px-3 py-2 text-[13px] text-white/85 hover:bg-white/10"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showResults && (
              <div className="mx-auto mt-4 max-h-72 w-full max-w-[640px] overflow-y-auto rounded-2xl border border-white/12 bg-[#0b1020]/95 p-2 text-start backdrop-blur-sm">
                {results.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-white/55">No countries match that.</p>
                ) : (
                  results.slice(0, 40).map((country) => {
                    const inner = (
                      <>
                        <span className="text-sm text-white">
                          {country.country}
                          {country.city ? <span className="text-white/50">, {country.city}</span> : null}
                        </span>
                        <span className="text-xs uppercase tracking-[0.08em] text-white/40">
                          {country.live ? regionLabels[country.continent] : "Coming soon"}
                        </span>
                      </>
                    );
                    return country.live ? (
                      <a
                        key={country.key}
                        href={`/${country.key}`}
                        className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 hover:bg-white/10"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div
                        key={country.key}
                        className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 opacity-60"
                      >
                        {inner}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy"
            >
              {primaryCta.label}
              <ArrowRightIcon />
            </a>
            <a
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-ink"
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>

        {/* Monospaced and right-aligned, like the reference's world overview —
            a readout rather than a headline statistic. */}
        <dl className="ms-auto mt-10 w-fit text-end font-mono text-[11px] leading-6 text-white/45">
          <dt className="mb-1 uppercase tracking-[0.18em] text-white/70">Network overview</dt>
          {stats.map((stat) => (
            <div key={stat.label} className="flex justify-end gap-6">
              <dd className="order-2 w-14 text-white/80">{stat.value}</dd>
              <span className="order-1">{stat.label}</span>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * Orthographic projection of a coordinate onto the visible face of the globe.
 * Returns null for points on the far side, and `z` as a 0–1 measure of how
 * near the centre a point is — the depth cue the dots are shaded by.
 */
function project(
  lat: number,
  lng: number,
  rotation: number,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number; z: number } | null {
  const phi = lat * TO_RAD;
  const theta = lng * TO_RAD + rotation;

  const x = Math.cos(phi) * Math.sin(theta);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(theta);

  // Tilt about the horizontal axis.
  const ty = y * Math.cos(TILT) - z * Math.sin(TILT);
  const tz = y * Math.sin(TILT) + z * Math.cos(TILT);

  if (tz <= 0) return null;
  return { x: cx + x * radius, y: cy - ty * radius, z: tz };
}
