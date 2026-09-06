import { ReactNode } from "react";

/**
 * The site's content column.
 *
 * 1200px by default — the width the designs lay their grids out on — and any
 * caller can narrow or widen it by passing its own `max-w-*`.
 *
 * That last part did not work until it was measured. Both classes landed on
 * the element, `max-w-[1200px]` and `max-w-[720px]` together, and which one
 * applies is then decided by the order Tailwind happens to emit them in, not
 * by the order they are written here. It emitted 1200 last. So every narrower
 * measure on the site was being ignored: the statement of faith and the
 * mission statement ran at 1200 instead of the 720 they ask for, the Bible
 * study form at 1200 instead of 847, and the centred bands at 1200 instead of
 * 860 or 900. Nothing errored, and the pages looked plausible — just wider
 * than they were drawn, with lines a third too long to read comfortably.
 *
 * So the default is only applied when the caller has not set one. A utility
 * class is not a cascade and cannot be overridden by writing it later; the
 * only fix is to not emit the thing being overridden.
 */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  // `max-w-none` counts: "edge to edge" is a caller setting the width too.
  const setsOwnWidth = /(^|\s)max-w-/.test(className);

  return (
    <div
      className={`mx-auto w-full ${setsOwnWidth ? "" : "max-w-[1200px]"} px-6 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
