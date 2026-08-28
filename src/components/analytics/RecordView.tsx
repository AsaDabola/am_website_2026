"use client";

import { useEffect, useRef } from "react";

import { useSitePathname } from "@/lib/useSitePathname";

/**
 * Tells the site it was read.
 *
 * Mounted once in the layout, so it survives navigation and reports every page
 * the reader moves to, not only the one they arrived on.
 *
 * Three things it deliberately does not do. It does not block or delay
 * anything: `sendBeacon` hands the browser a message to deliver whenever it
 * likes, and a failure is not retried or reported. It does not set a cookie or
 * store anything that outlives the tab. And it reports the address the browser
 * has, not one built from state, so what is counted is what was actually
 * opened.
 *
 * A "visit" is the first page seen in a tab. `sessionStorage` is what decides
 * that: it is emptied when the tab closes, is not shared between tabs, and
 * never reaches this server. Closing the tab and coming back is a second
 * visit, which is the honest reading of the word.
 */
const VISIT_FLAG = "am-visit";

export default function RecordView() {
  const pathname = useSitePathname();
  // Under React's development double-render the same page would otherwise be
  // reported twice; in production this simply skips a repeat of the address
  // already sent, which is what a re-render of the same route is.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    let newVisit = false;
    try {
      newVisit = window.sessionStorage.getItem(VISIT_FLAG) === null;
      if (newVisit) window.sessionStorage.setItem(VISIT_FLAG, "1");
    } catch {
      // Private browsing, or storage turned off. The view still counts; it
      // simply is not counted as the start of anything.
    }

    // Where the reader came from has to be sent, not read from the request:
    // this message's own Referer header is the page it is sent from, which is
    // always this site.
    //
    // Sent on the first page of a visit and no other. Moving around the site
    // does not reload the document, so `document.referrer` still names the
    // search that brought them in on page five as much as on page one —
    // reporting it every time would count one arrival from Google as five.
    // What is counted instead is arrivals, which is the useful number anyway.
    const body = JSON.stringify({
      path: pathname,
      newVisit,
      from: newVisit ? document.referrer || "" : "",
    });
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch {
      // Nothing here is worth interrupting a reader for.
    }
  }, [pathname]);

  return null;
}
