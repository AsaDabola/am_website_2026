"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Reveals its children as they scroll into view — a short rise and fade,
 * once, then the observer is dropped.
 *
 * Motion is handled entirely in CSS so that `prefers-reduced-motion` collapses
 * the transition to nothing rather than needing a second code path, and so a
 * browser without IntersectionObserver simply shows the content immediately.
 */
export default function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  /** Stagger within a group. Keep well under a second — this is a hint, not a show. */
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // No observer available: show the content outright. Written straight to
    // the attribute the CSS keys off, so this path needs no render pass.
    if (typeof IntersectionObserver === "undefined") {
      element.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Fire a little before the element is fully in view, so the movement has
      // finished by the time it is properly on screen.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-revealed={shown ? "true" : "false"}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`am-reveal ${className}`}
    >
      {children}
    </div>
  );
}
