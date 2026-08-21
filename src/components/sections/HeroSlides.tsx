"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Cross-fading background for the home hero. Only the imagery rotates — the
 * heading, buttons and stats above it stay put, so the slideshow never moves
 * the content a visitor is reading.
 *
 * Holds still for anyone who has asked for reduced motion, and while a
 * pointer is over the hero.
 */
export default function HeroSlides({
  images,
  intervalMs = 6000,
}: {
  images: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // The hero's text and buttons sit in a sibling layer above this one, so
  // hover has to be watched on the section itself — handlers here would never
  // fire while the pointer is over the content.
  useEffect(() => {
    const section = rootRef.current?.closest("section");
    if (!section) return;

    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    section.addEventListener("mouseenter", pause);
    section.addEventListener("mouseleave", resume);
    return () => {
      section.removeEventListener("mouseenter", pause);
      section.removeEventListener("mouseleave", resume);
    };
  }, []);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [images.length, intervalMs, paused]);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          // Only the first slide is a candidate for the largest paintable
          // element, so the rest stay out of the preload path.
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-8 right-6 z-20 flex gap-2.5 lg:right-10">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1} of ${images.length}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
