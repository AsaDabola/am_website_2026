"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LAND_LAT, LAND_LNG } from "@/lib/globePoints";
import { CHAPTERS, networkRoutes } from "@/lib/chapters";
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
/** Tilt at rest, so the globe is seen slightly from above. */
const REST_TILT = 14;

/**
 * Where the camera goes when a region is chosen, and the target each click is
 * matched against. Centres are the visual middle of the landmass rather than
 * its centroid — Asia's centroid sits in a desert nobody thinks of as Asia.
 */
const REGION_VIEW: Record<string, { lat: number; lng: number }> = {
  northamerica: { lat: 44, lng: -100 },
  southamerica: { lat: -15, lng: -60 },
  europe: { lat: 52, lng: 14 },
  africa: { lat: 2, lng: 20 },
  asia: { lat: 34, lng: 95 },
  oceania: { lat: -25, lng: 134 },
};

/**
 * How much closer the camera sits when a region is in focus. Deliberately
 * modest — past about 1.6 the sphere is wider than the frame and the dots
 * read as a flat field rather than a curved surface.
 */
const FOCUS_ZOOM = 1.2;

/**
 * How wide the lit area is around a focused region, in degrees of arc. Held
 * as the cosine so the draw loop can compare it against a dot product instead
 * of taking an arccos per point.
 */
const HIGHLIGHT_COS = Math.cos(46 * TO_RAD);

/** Great-circle distance in degrees, for matching a click to a region. */
function arc(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = (aLat - bLat) * TO_RAD;
  const dLng = (aLng - bLng) * TO_RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * TO_RAD) * Math.cos(bLat * TO_RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(h))) / TO_RAD;
}

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

  /** Which region the camera has flown to, or null for the turning world. */
  const [focus, setFocus] = useState<string | null>(null);

  /**
   * The camera. `lng`/`lat` are the coordinate facing the viewer and `zoom`
   * scales the radius; each frame eases the live values toward the target.
   * Held in refs rather than state because they change every frame and
   * nothing in the DOM reads them.
   */
  const camera = useRef({ lng: 0, lat: REST_TILT, zoom: 1, shift: 0 });
  const target = useRef({ lng: 0, lat: REST_TILT, zoom: 1, shift: 0 });
  /** Set while the camera is flying, so the idle spin does not fight it. */
  const flying = useRef(false);
  /** Pointer drag, and whether it moved far enough to not count as a click. */
  const drag = useRef({ active: false, startX: 0, startY: 0, moved: false });
  const geometry = useRef({ cx: 0, cy: 0, radius: 0 });
  /** Unit vector of the region in focus, or null. Read by the draw loop. */
  const focusVector = useRef<[number, number, number] | null>(null);

  /** Reverse of regionLabels, so a chosen chip label can find its region. */
  const regionBySlugLabel = useMemo(
    () => Object.fromEntries(Object.entries(regionLabels).map(([slug, label]) => [label, slug])),
    [regionLabels],
  );

  /** Flies the camera to a region, or back out to the turning world. */
  function focusRegion(region: string | null) {
    setFocus(region);
    setChosen((previous) => ({ ...previous, region: region ? regionLabels[region] : "" }));
    if (region && REGION_VIEW[region]) {
      const { lat, lng } = REGION_VIEW[region];
      target.current = { lat, lng, zoom: FOCUS_ZOOM, shift: -0.17 };
      const phi = lat * TO_RAD;
      const lambda = lng * TO_RAD;
      focusVector.current = [
        Math.cos(phi) * Math.sin(lambda),
        Math.sin(phi),
        Math.cos(phi) * Math.cos(lambda),
      ];
      flying.current = true;
    } else {
      target.current = { lng: camera.current.lng, lat: REST_TILT, zoom: 1, shift: 0 };
      focusVector.current = null;
      flying.current = false;
    }
  }

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

  const hasFilters = Object.values(chosen).some(Boolean);

  /**
   * A filter on its own is enough to list countries — zooming into Africa
   * should show Africa. The typed query only narrows further; with neither,
   * the list stays closed so the globe is not covered by a panel of all 68.
   */
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle && !hasFilters) return [];
    return countries.filter((country) => {
      if (chosen.region && regionLabels[country.continent] !== chosen.region) return false;
      if (chosen.country && country.country !== chosen.country) return false;
      if (chosen.status === "Live" && !country.live) return false;
      if (chosen.status === "Coming soon" && country.live) return false;
      if (!needle) return true;
      return (
        country.country.toLowerCase().includes(needle) ||
        (country.city ?? "").toLowerCase().includes(needle) ||
        (regionLabels[country.continent] ?? "").toLowerCase().includes(needle)
      );
    });
  }, [countries, query, chosen, regionLabels, hasFilters]);

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
      radius = Math.min(width * 0.38, height * 0.5);
    }

    /**
     * Each land point as a unit vector, computed once. The draw loop then
     * costs a handful of multiplications per point instead of four trig calls,
     * and the same vectors answer "is this inside the focused region?" with a
     * dot product.
     */
    const count = LAND_LAT.length;
    const ux = new Float32Array(count);
    const uy = new Float32Array(count);
    const uz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const phi = (LAND_LAT[i] / 10) * TO_RAD;
      const lambda = (LAND_LNG[i] / 10) * TO_RAD;
      ux[i] = Math.cos(phi) * Math.sin(lambda);
      uy[i] = Math.sin(phi);
      uz[i] = Math.cos(phi) * Math.cos(lambda);
    }

    /** Chapter coordinates, as the bright clusters on the surface. */
    const markers = CHAPTERS.map((chapter) => ({ lat: chapter.lat, lng: chapter.lng }));

    /**
     * The sending routes — Trenton out to the continental headquarters, and
     * each of those out to its own chapters — as great circles lifted off the
     * surface so they arc rather than lie flat. Sampled once here; the draw
     * loop only rotates and projects them.
     *
     * The lift is proportional to the length of the hop, so a short European
     * route does not balloon as high as a transatlantic one.
     */
    const ARC_STEPS = 26;
    const arcs = networkRoutes(CHAPTERS).map(({ from, to }) => {
      const toVec = (lat: number, lng: number): [number, number, number] => {
        const phi = lat * TO_RAD;
        const lambda = lng * TO_RAD;
        return [Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)];
      };
      const a = toVec(from.lat, from.lng);
      const b = toVec(to.lat, to.lng);
      const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const omega = Math.acos(dot);
      const lift = 0.06 + (omega / Math.PI) * 0.28;

      const points: [number, number, number][] = [];
      for (let step = 0; step <= ARC_STEPS; step++) {
        const t = step / ARC_STEPS;
        // Spherical interpolation, so the path follows the sphere rather than
        // cutting through it.
        const s1 = omega < 1e-6 ? 1 - t : Math.sin((1 - t) * omega) / Math.sin(omega);
        const s2 = omega < 1e-6 ? t : Math.sin(t * omega) / Math.sin(omega);
        const height = 1 + lift * Math.sin(Math.PI * t);
        points.push([
          (a[0] * s1 + b[0] * s2) * height,
          (a[1] * s1 + b[1] * s2) * height,
          (a[2] * s1 + b[2] * s2) * height,
        ]);
      }
      return points;
    });

    let last = 0;
    function draw(time: number) {
      const elapsed = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;

      // The world turns on its own only while nothing is in focus and the
      // pointer is not on it; a focused region holds still to be read.
      if (!reduced && !flying.current && !drag.current.active) {
        target.current.lng -= SPIN * elapsed;
      }

      // Ease toward the target. A fixed fraction per second rather than per
      // frame, so the flight takes the same time at 60Hz and at 120Hz.
      const ease = 1 - Math.pow(0.001, elapsed);
      const c = camera.current;
      const t = target.current;
      c.lng += (t.lng - c.lng) * ease;
      c.lat += (t.lat - c.lat) * ease;
      c.zoom += (t.zoom - c.zoom) * ease;
      c.shift += (t.shift - c.shift) * ease;
      if (flying.current && Math.abs(t.lng - c.lng) < 0.2 && Math.abs(t.zoom - c.zoom) < 0.01) {
        flying.current = false;
      }

      // Slides left when a region is in focus, so the country list beside it
      // is not sitting on top of the continent you just chose.
      const cx = width / 2 + width * c.shift;
      const cy = height / 2;
      const scaled = radius * c.zoom;
      geometry.current = { cx, cy, radius: scaled };

      context!.clearRect(0, 0, width, height);

      // Atmosphere: a soft disc behind the surface so the rim reads as a
      // sphere rather than a circle of dots.
      const glow = context!.createRadialGradient(cx, cy, scaled * 0.68, cx, cy, scaled * 1.2);
      glow.addColorStop(0, "rgba(86,158,255,0.32)");
      glow.addColorStop(0.7, "rgba(55,120,245,0.2)");
      glow.addColorStop(1, "rgba(12,26,74,0)");
      context!.fillStyle = glow;
      context!.beginPath();
      context!.arc(cx, cy, scaled * 1.16, 0, Math.PI * 2);
      context!.fill();

      // Graticule: meridians and parallels, faint, drawn before the land so
      // the dots sit on top of the wireframe.
      context!.strokeStyle = "rgba(150,190,255,0.2)";
      context!.lineWidth = 0.6;
      for (let lat = -60; lat <= 60; lat += 20) {
        context!.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 3) {
          const point = project(lat, lng, c, cx, cy, scaled);
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
          const point = project(lat, lng, c, cx, cy, scaled);
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

      // Sending routes. Drawn under the land dots so a chapter's marker still
      // reads on top of the line arriving at it.
      const arcCosCam = Math.cos(c.lng * TO_RAD);
      const arcSinCam = Math.sin(c.lng * TO_RAD);
      const arcCosTilt = Math.cos(c.lat * TO_RAD);
      const arcSinTilt = Math.sin(c.lat * TO_RAD);
      const fade = focusVector.current ? 0.35 : 1;
      for (const points of arcs) {
        context!.beginPath();
        let started = false;
        let brightest = 0;
        for (const [vx, vy, vz] of points) {
          const x = vx * arcCosCam - vz * arcSinCam;
          const z = vz * arcCosCam + vx * arcSinCam;
          const ty = vy * arcCosTilt - z * arcSinTilt;
          const tz = vy * arcSinTilt + z * arcCosTilt;
          // Arcs stand above the surface, so a little of the far side shows
          // over the horizon; -0.08 is where that stops looking like a glitch.
          if (tz <= -0.08) {
            started = false;
            continue;
          }
          brightest = Math.max(brightest, tz);
          const px = cx + x * scaled;
          const py = cy - ty * scaled;
          if (started) context!.lineTo(px, py);
          else {
            context!.moveTo(px, py);
            started = true;
          }
        }
        // Two passes: a wide, faint one for the glow around the line, then
        // the line itself. Cheaper than a shadow blur and it does not bleed
        // over the land dots the way one does.
        context!.strokeStyle = "#6aa8ff";
        context!.globalAlpha = (0.07 + brightest * 0.22) * fade;
        context!.lineWidth = 3.4;
        context!.stroke();
        context!.strokeStyle = "#bcd8ff";
        context!.globalAlpha = (0.2 + brightest * 0.75) * fade;
        context!.lineWidth = 1.1;
        context!.stroke();
      }
      context!.globalAlpha = 1;

      // Land. Dots near the rim are dimmer and smaller, which is what makes a
      // flat scatter read as a curved surface. With a region in focus, the
      // rest of the world stays visible but recedes, so the globe is still a
      // globe rather than a crop of one.
      const focused = focusVector.current;
      const cosCam = Math.cos(c.lng * TO_RAD);
      const sinCam = Math.sin(c.lng * TO_RAD);
      const cosTilt = Math.cos(c.lat * TO_RAD);
      const sinTilt = Math.sin(c.lat * TO_RAD);
      const grow = Math.sqrt(c.zoom);
      context!.fillStyle = "#dbe9ff";
      for (let i = 0; i < count; i++) {
        const vx = ux[i];
        const vy = uy[i];
        const vz = uz[i];

        const x = vx * cosCam - vz * sinCam;
        const z = vz * cosCam + vx * sinCam;
        const ty = vy * cosTilt - z * sinTilt;
        const tz = vy * sinTilt + z * cosTilt;
        if (tz <= 0) continue;

        let alpha = 0.34 + tz * 0.66;
        if (focused) {
          const inside =
            vx * focused[0] + vy * focused[1] + vz * focused[2] >= HIGHLIGHT_COS;
          if (!inside) alpha *= 0.3;
        }
        context!.globalAlpha = alpha;
        // Grows with the zoom: the spacing between points grows with the
        // sphere, and dots held at one size would thin out as it closes in.
        const size = (0.85 + tz * 1.45) * grow;
        context!.fillRect(cx + x * scaled - size / 2, cy - ty * scaled - size / 2, size, size);
      }

      // Chapters, as haloed points bright enough to find at a glance.
      for (const marker of markers) {
        const point = project(marker.lat, marker.lng, c, cx, cy, scaled);
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

  /** Drag turns the globe by hand; a press that does not travel is a click. */
  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    drag.current = { active: true, startX: event.clientX, startY: event.clientY, moved: false };
    flying.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.startX;
    const dy = event.clientY - drag.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
    drag.current.startX = event.clientX;
    drag.current.startY = event.clientY;
    // Degrees per pixel falls off with zoom, so a focused region does not fly
    // past under the same hand movement that turns the whole world.
    const perPixel = 0.28 / camera.current.zoom;
    target.current.lng -= dx * perPixel;
    target.current.lat = Math.max(-70, Math.min(80, target.current.lat + dy * perPixel));
  }

  function onPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const wasDrag = drag.current.moved;
    drag.current.active = false;
    if (wasDrag) return;

    const box = event.currentTarget.getBoundingClientRect();
    const { cx, cy, radius } = geometry.current;
    const hit = unproject(
      event.clientX - box.left,
      event.clientY - box.top,
      camera.current,
      cx,
      cy,
      radius,
    );
    if (!hit) {
      // A click on the empty sky pulls back out to the whole world.
      if (focus) focusRegion(null);
      return;
    }

    // Nearest region centre wins, but only within reach — a click in the
    // middle of the Pacific should not snap to Oceania.
    let nearest: string | null = null;
    let best = Infinity;
    for (const [region, centre] of Object.entries(REGION_VIEW)) {
      const distance = arc(hit.lat, hit.lng, centre.lat, centre.lng);
      if (distance < best) {
        best = distance;
        nearest = region;
      }
    }
    if (nearest && best < 55) focusRegion(nearest === focus ? null : nearest);
    else if (focus) focusRegion(null);
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#050b1e]">
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
            "linear-gradient(180deg, rgba(5,11,30,0.86) 0%, rgba(5,11,30,0.12) 32%, rgba(5,11,30,0.12) 62%, rgba(5,11,30,0.9) 100%)",
        }}
      />

      {/* Transparent to the pointer, so a press anywhere that is not a control
          falls through to the globe behind it. Each control below turns
          pointer events back on for itself — without this the column covered
          the canvas edge to edge and the globe could not be dragged at all. */}
      <div className="pointer-events-none relative mx-auto flex min-h-[760px] w-full max-w-[1280px] flex-col px-6 py-16 lg:px-10">
        {/* Sits above the heading so it never covers the search. At rest it
            says what the globe will do; in focus it is the way back. */}
        <div className="pointer-events-none flex justify-center">
          {focus ? (
            <button
              type="button"
              onClick={() => focusRegion(null)}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              &larr; {regionLabels[focus]} &mdash; back to the world
            </button>
          ) : (
            <span className="rounded-full border border-white/10 px-4 py-2 text-[12px] uppercase tracking-[0.14em] text-white/40">
              Click a continent to zoom in
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="max-w-[22ch] font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[56px] lg:text-[68px]">
            {heading}
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-white/70">{subtitle}</p>

          <div className="mt-10 w-full max-w-[1000px]">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 backdrop-blur-sm focus-within:border-white/35">
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
                    focusRegion(null);
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
                <div key={filter.id} className="pointer-events-auto relative">
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
                    {chosen[filter.id] || filter.label}
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
                          if (filter.id === "region") focusRegion(null);
                          else setChosen((previous) => ({ ...previous, [filter.id]: "" }));
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
                            if (filter.id === "region") focusRegion(regionBySlugLabel[option] ?? null);
                            else setChosen((previous) => ({ ...previous, [filter.id]: option }));
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
              // Centred under the search while it is only a search result;
              // pushed to the right once a region is in focus, opposite the
              // globe, which has slid the other way to make room.
              <div
                className={`pointer-events-auto mt-4 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/12 bg-[#0b1020]/95 p-2 text-start backdrop-blur-sm ${
                  focus ? "max-w-[640px] lg:ms-auto lg:me-0 lg:max-w-[420px]" : "mx-auto max-w-[640px]"
                }`}
              >
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
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy"
            >
              {primaryCta.label}
              <ArrowRightIcon />
            </a>
            <a
              href={secondaryCta.href}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-ink"
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>

        {/* Sits under the globe, in the same monospace as the readout: the
            globe does not look draggable, so it says so. */}
        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
          Drag to explore
        </p>

        {/* Monospaced and right-aligned, like the reference's world overview —
            a readout rather than a headline statistic. */}
        <dl className="ms-auto mt-6 w-fit text-end font-mono text-[11px] leading-6 text-white/45">
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
 * The camera's longitude turns the sphere; its latitude tilts it. Returns null
 * for points on the far side, and `z` as a 0–1 measure of how near the centre
 * a point is — the depth cue the dots are shaded by.
 */
function project(
  lat: number,
  lng: number,
  camera: { lng: number; lat: number },
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number; z: number } | null {
  const phi = lat * TO_RAD;
  const theta = (lng - camera.lng) * TO_RAD;
  const tilt = camera.lat * TO_RAD;

  const x = Math.cos(phi) * Math.sin(theta);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(theta);

  const ty = y * Math.cos(tilt) - z * Math.sin(tilt);
  const tz = y * Math.sin(tilt) + z * Math.cos(tilt);

  if (tz <= 0) return null;
  return { x: cx + x * radius, y: cy - ty * radius, z: tz };
}

/**
 * The reverse: canvas point back to a coordinate, so a click can be matched to
 * a region. Null when the click missed the sphere.
 */
function unproject(
  px: number,
  py: number,
  camera: { lng: number; lat: number },
  cx: number,
  cy: number,
  radius: number,
): { lat: number; lng: number } | null {
  const x = (px - cx) / radius;
  const ty = (cy - py) / radius;
  const squared = x * x + ty * ty;
  if (squared > 1) return null;
  const tz = Math.sqrt(1 - squared);

  const tilt = camera.lat * TO_RAD;
  const y = ty * Math.cos(tilt) + tz * Math.sin(tilt);
  const z = -ty * Math.sin(tilt) + tz * Math.cos(tilt);

  const lat = Math.asin(Math.max(-1, Math.min(1, y))) / TO_RAD;
  const lng = Math.atan2(x, z) / TO_RAD + camera.lng;
  return { lat, lng: ((((lng + 180) % 360) + 360) % 360) - 180 };
}
