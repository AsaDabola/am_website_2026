"use client";

import { useState } from "react";

export type Milestone = {
  tag: string;
  title: string;
  description: string;
};

/**
 * Milestones as an accordion on a progress rail: one entry is open at a time,
 * the rail fills to whichever that is, and the rest collapse to a headline.
 *
 * The open panel animates via grid-template-rows rather than a measured pixel
 * height, so it works from the first paint and reflows correctly if the text
 * wraps differently at another width.
 */
export default function HistoryTimeline({ milestones }: { milestones: Milestone[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const progress =
    milestones.length > 1 ? (openIndex / (milestones.length - 1)) * 100 : 100;

  return (
    <div className="relative mx-auto max-w-[760px]">
      {/* Rail */}
      <div
        aria-hidden
        className="absolute bottom-3 start-[7px] top-3 w-0.5 rounded-full bg-brand-blue/15"
      >
        <div
          className="w-full rounded-full bg-brand-blue transition-[height] duration-500 ease-out motion-reduce:transition-none"
          style={{ height: `${progress}%` }}
        />
      </div>

      <ol className="relative space-y-1">
        {milestones.map((item, index) => {
          const isOpen = index === openIndex;
          const isPast = index <= openIndex;

          return (
            <li key={item.tag} className="relative ps-10">
              <span
                aria-hidden
                className={`absolute start-0 top-[15px] size-4 rounded-full border-2 transition-colors duration-300 ${
                  isPast
                    ? "border-brand-blue bg-brand-blue"
                    : "border-brand-blue/30 bg-white"
                }`}
              />

              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-expanded={isOpen}
                  aria-controls={`milestone-panel-${index}`}
                  className="group w-full rounded-lg py-3 text-start transition-colors"
                >
                  <span
                    className={`block text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                      isPast ? "text-brand-blue" : "text-ink-muted"
                    }`}
                  >
                    {item.tag}
                  </span>
                  <span
                    className={`mt-1 block font-display text-lg font-bold transition-colors ${
                      isOpen ? "text-ink" : "text-ink/70 group-hover:text-ink"
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
              </h3>

              <div
                id={`milestone-panel-${index}`}
                className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out motion-reduce:transition-none ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pb-5 text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
