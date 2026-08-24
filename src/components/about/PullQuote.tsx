import { ReactNode } from "react";

export default function PullQuote({ children }: { children: ReactNode }) {
  return (
    // #1449c6 rather than the brand navy token: the About, Mission statement
    // and Statement of Faith designs all draw this rule in the deeper blue.
    // 22px is likewise flat across the three, not a responsive step.
    <blockquote className="border-s-[3px] border-[#1449c6] py-2 ps-6 font-display text-xl font-semibold leading-[1.35] text-ink sm:text-[22px]">
      {children}
    </blockquote>
  );
}
