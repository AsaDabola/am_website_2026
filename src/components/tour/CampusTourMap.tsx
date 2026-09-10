"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import { CAMPUS_BUILDINGS, type CampusBuilding } from "./campusBuildings";

/**
 * The campus tour: an aerial photograph with each building's roofline traced
 * over it, and a card for each building below. Hovering either the roofline
 * or its name tag lights both plus the line joining them; choosing one opens
 * a dialog with that building's photos.
 *
 * Highlighting runs through React state rather than CSS `:hover`, because the
 * roofline, the tag and the leader line are three separate elements in two
 * different stacking contexts — one piece of state keeps them in step and
 * makes the same highlight work for keyboard focus.
 */
export default function CampusTourMap({
  aerial = "/images/hero-slide-campus-aerial.webp",
  hasPhotos = false,
}: {
  /**
   * Named directly rather than read from the CMS image keys: the outlines in
   * campusBuildings.ts are traced against this exact photograph.
   */
  aerial?: string;
  /** False until the four building photographs are in the repo. */
  hasPhotos?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<CampusBuilding | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={aerial}
              alt="Aerial photograph of the AM campus, showing the dormitory, Immanuel Theological Seminary, the general office and the chapel"
              width={3840}
              height={1929}
              sizes="(min-width: 1280px) 1200px, 100vw"
              priority
              className="w-full"
            />

            {/* Rooflines and leader lines, drawn in the photo's own
                coordinate space so they track it at any width. */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1200 603"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {CAMPUS_BUILDINGS.map((building) => {
                const on = active === building.id;
                return (
                  <g key={`leader-${building.id}`} opacity={on ? 1 : 0}>
                    <line
                      x1={building.leader.x1}
                      y1={building.leader.y1}
                      x2={building.leader.x2}
                      y2={building.leader.y2}
                      stroke="white"
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={building.leader.x1}
                      cy={building.leader.y1}
                      r={5}
                      fill="white"
                    />
                  </g>
                );
              })}

              {CAMPUS_BUILDINGS.map((building) => {
                const on = active === building.id;
                return (
                  <path
                    key={building.id}
                    d={building.shape}
                    fill={on ? "rgba(0,122,255,0.42)" : "rgba(0,122,255,0)"}
                    stroke={on ? "#ffffff" : "transparent"}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer transition-[fill,stroke] duration-200"
                    style={{ pointerEvents: "fill" }}
                    tabIndex={0}
                    role="button"
                    aria-label={building.name}
                    onMouseEnter={() => setActive(building.id)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(building.id)}
                    onBlur={() => setActive(null)}
                    onClick={() => setOpen(building)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setOpen(building);
                      }
                    }}
                  />
                );
              })}
            </svg>

            {CAMPUS_BUILDINGS.map((building) => {
              const on = active === building.id;
              return (
                <button
                  key={`pin-${building.id}`}
                  type="button"
                  className={`absolute -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase shadow-lg transition-colors ${
                    on
                      ? "bg-brand-blue text-white"
                      : "bg-night/80 text-on-dark backdrop-blur-sm"
                  }`}
                  style={{ left: building.pin.left, top: building.pin.top }}
                  onMouseEnter={() => setActive(building.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(building.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => setOpen(building)}
                >
                  {building.name}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-sm text-ink-muted">
            Hover or tap a building on the photo to explore it.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-16 lg:py-20">
        <Container>
          <div className="mb-12 text-center">
            <div className="flex justify-center">
              <Eyebrow>Around the campus</Eyebrow>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Four buildings, one campus.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAMPUS_BUILDINGS.map((building) => (
              <button
                key={building.id}
                type="button"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mist bg-white text-left transition-transform duration-300 hover:-translate-y-1"
                onClick={() => setOpen(building)}
                onMouseEnter={() => setActive(building.id)}
                onMouseLeave={() => setActive(null)}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {hasPhotos ? (
                    <Image
                      src={building.photo}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <PlaceholderPhoto className="absolute inset-0" label={building.name} />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-night/75 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-brand-navy-light uppercase backdrop-blur-sm">
                    {building.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-display text-lg font-bold text-ink">{building.name}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{building.text}</p>
                  <span className="mt-auto pt-2 text-xs font-semibold tracking-[0.12em] text-brand-blue uppercase">
                    See photos
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>

      <dialog
        ref={dialogRef}
        className="w-[min(92vw,640px)] rounded-2xl p-0 backdrop:bg-night/70 backdrop:backdrop-blur-sm"
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(null);
        }}
      >
        {open ? (
          <div className="relative p-7">
            <button
              type="button"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-2xl leading-none text-ink-muted transition-colors hover:bg-mist"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              &times;
            </button>

            <p className="text-xs font-semibold tracking-[0.15em] text-brand-blue uppercase">
              {open.tag}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
              {open.name}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{open.text}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {open.gallery.map((caption) => (
                <figure key={caption} className="m-0">
                  <PlaceholderPhoto className="aspect-[4/3] w-full rounded-xl" />
                  <figcaption className="mt-2 text-xs text-ink-muted">{caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
