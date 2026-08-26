"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Fades and lifts each section into view as it is scrolled to.
 *
 * Mounted once in the layout rather than wrapping every section by hand: the
 * site has about thirty pages built from top-level <section> and <article>
 * blocks, and a per-page wrapper would need adding to each of them and
 * remembering on every page written afterwards. This finds them instead.
 *
 * Three things it deliberately does not do:
 *
 *  - It never hides anything already on screen when the page loads. The class
 *    can only be added after hydration, so hiding a visible section would show
 *    it, blank it, and fade it back in — a flicker on every page load. Only
 *    what is below the fold is ever hidden, and nobody can see that happen.
 *  - It does nothing at all under `prefers-reduced-motion`, and nothing
 *    without IntersectionObserver. In both cases every section simply stays
 *    visible, which is the correct outcome rather than a degraded one.
 *  - It touches only the class and the data attribute, on section elements
 *    that are server-rendered and never re-rendered on the client. The motion
 *    itself lives in globals.css, keyed off `data-revealed`.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const main = document.querySelector("main");
    if (!main) return;

    // Section-level only. Going deeper would animate paragraphs inside a
    // section independently of it, which reads as the page assembling itself.
    const blocks = main.querySelectorAll<HTMLElement>(
      ":scope > section, :scope > article, :scope > div > section",
    );

    const hidden: HTMLElement[] = [];
    for (const block of blocks) {
      // The homepage already wraps each of its blocks in <Reveal>, so those
      // sections sit inside an .am-reveal of their own. Taking them again
      // would fade the same content twice, once nested inside the other.
      if (block.parentElement?.closest(".am-reveal")) continue;
      // A tenth of a viewport of slack, so a section straddling the fold is
      // treated as already seen rather than blinking as it is scrolled past.
      if (block.getBoundingClientRect().top <= window.innerHeight * 0.9) continue;
      block.classList.add("am-reveal");
      block.dataset.revealed = "false";
      hidden.push(block);
    }
    if (hidden.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    for (const block of hidden) observer.observe(block);

    return () => {
      observer.disconnect();
      // Leave nothing hidden behind on the way out: a section that never came
      // into view would otherwise be handed to the next route still at zero.
      for (const block of hidden) {
        block.classList.remove("am-reveal");
        delete block.dataset.revealed;
      }
    };
    // Re-run per route: the layout stays mounted across navigations, so
    // without this only the first page a visitor lands on would animate.
  }, [pathname]);

  return null;
}
