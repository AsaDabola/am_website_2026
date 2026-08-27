"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * The staggered photo strip that closes Group Activities: two narrow frames
 * bracketing two wide ones, all the same height. The widths carry the design's
 * 150 / 274 / 274 / 150 as flex ratios rather than pixels, so the set fills
 * whatever column it is given at desktop width and keeps its rhythm.
 *
 * Below that it scrolls: four frames at a readable size do not fit a phone, and
 * squeezing them to fit turns each into a slot too narrow to make out. That is
 * also what makes the design's two arrows worth having — they scroll the strip,
 * and disable themselves at each end, so on a wide screen where everything is
 * already visible they are visibly inert rather than decorative.
 */
export default function WeekendPhotoStrip({
  photos,
  children,
}: {
  photos: { src: string; wide: boolean }[];
  /** The section's heading and copy, which the arrows sit beneath. */
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    // A one-pixel tolerance: fractional scroll widths mean scrollLeft can stop
    // a hair short of the end and leave the arrow enabled with nowhere to go.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  /**
   * Both buttons draw the same SVG, one of them rotated. They used to draw a
   * text arrow — and the → glyph is not centred in its em box, so rotating it
   * moved it to the other side of centre and the two circles ended up with
   * their arrows at visibly different heights. An SVG with a square viewBox
   * turns about its own middle, so the pair matches.
   */
  const arrow =
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy-deep text-white transition-opacity hover:bg-brand-navy disabled:cursor-default disabled:opacity-35";

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[480px_1fr] lg:gap-14">
      <div>
        {children}
        {/* Under the copy, not under the photographs — where the design puts
            them. They still drive the strip in the next column. */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label="Previous photos"
            className={arrow}
          >
            <ArrowRightIcon className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label="Next photos"
            className={arrow}
          >
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* `min-w-0` because this is a grid item, and a grid item's default
          `min-width: auto` refuses to shrink below its content. Without it the
          strip stays its full 728px, the scroller never scrolls — leaving both
          arrows dead — and the whole page scrolls sideways on a phone. */}
      <div
        ref={scroller}
        onScroll={sync}
        className="flex min-w-0 gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo) => (
          <div
            key={photo.src}
            // Never shrinks. The design's section runs from the page gutter
            // out to the edge of the viewport, which gives the strip 896px;
            // inside this site's 1200px column it gets about 584. Squeezing
            // four frames into that turns a 150px one into 95px and the crop
            // stops being a photograph of anything. They keep their drawn
            // sizes and the strip scrolls instead — which is what the two
            // arrows in the design are there to drive.
            className={`relative h-[300px] shrink-0 overflow-hidden rounded-xl lg:h-[380px] ${
              photo.wide ? "w-[220px] lg:w-[274px]" : "w-[120px] lg:w-[150px]"
            }`}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 274px, 220px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
