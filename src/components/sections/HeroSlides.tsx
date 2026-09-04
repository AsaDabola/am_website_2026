"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import HeroStats from "@/components/sections/HeroStats";

export type HeroSlide = {
  image: string;
  /** White line. */
  line1: string;
  /** Sky-blue line under it. */
  line2: string;
};

/**
 * The home hero: a cross-fading photograph with its own headline.
 *
 * The headline used to be fixed while only the imagery rotated, which is why
 * it lives here now rather than in the server component above — each of the
 * design's four photographs carries its own line, so the two have to change
 * together. Everything else on the hero — the eyebrow, the buttons, the
 * statistics — stays put, so the slideshow never moves what a visitor is part
 * way through reading.
 *
 * Holds still for anyone who has asked for reduced motion, and while a pointer
 * is over the hero.
 */
export default function HeroSlides({
  slides,
  eyebrow,
  joinBibleStudyLabel,
  whoWeAreLabel,
  stats,
  intervalMs = 6000,
}: {
  slides: HeroSlide[];
  eyebrow: string;
  joinBibleStudyLabel: string;
  whoWeAreLabel: string;
  stats: { value: string; label: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs, paused]);

  const current = slides[index] ?? slides[0];

  return (
    <>
      <div ref={rootRef} className="absolute inset-0">
        {slides.map((slide, i) => (
          <Image
            key={slide.image}
            src={slide.image}
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
      </div>

      {/*
        No wash over the photograph any more.

        There used to be one — a left-to-right darkening, taken down a fifth
        twice (70 and 20, then 56 and 16, then 45 and 13) before being dropped
        here. The banner photographs now carry their own grading, so the wash
        was darkening a picture that had already been darkened deliberately.
        The headline keeps its own drop shadow, which is what actually holds it
        against a bright frame; if a future photograph needs more than that,
        the answer is to grade that photograph rather than to put a sheet back
        over all of them.
      */}

      <Container className="relative flex min-h-[720px] flex-col justify-center py-24">
        <Eyebrow tone="light">{eyebrow}</Eyebrow>

        {/* Two lines, the second in the pale blue: the colouring the design
            asks for, and the reason the line break is in the copy rather than
            left to the width. `key` restarts the fade when the slide turns. */}
        <h1
          key={index}
          className="max-w-3xl animate-[fadeIn_700ms_ease-out] font-display text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white [text-shadow:0px_4px_14px_rgba(0,0,0,0.4)] sm:text-6xl lg:text-[80px]"
        >
          {current.line1}
          <br />
          <span className="text-[#c5ddff]">{current.line2}</span>
        </h1>

        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="/bible-study" variant="solidNavy">
            {joinBibleStudyLabel}
          </Button>
          <Button href="/about" variant="outlineLight" icon={false}>
            {whoWeAreLabel}
          </Button>
        </div>

        <HeroStats stats={stats} />
      </Container>

      {slides.length > 1 && (
        <div className="absolute bottom-8 end-6 z-20 flex gap-2.5 lg:end-10">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
