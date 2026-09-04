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
      // Fires as the top edge appears rather than once the section is well
      // into view. The rise takes over a second now, and waiting for 8% of a
      // tall section to show meant the movement was still running when the
      // section was already fully on screen.
      { rootMargin: "0px 0px -2% 0px", threshold: 0 },
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
