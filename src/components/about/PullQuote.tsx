import { ReactNode } from "react";

export default function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-s-[3px] border-brand-navy py-2 ps-6 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
      {children}
    </blockquote>
  );
}
