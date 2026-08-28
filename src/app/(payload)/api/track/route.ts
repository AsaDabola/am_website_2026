import { NextResponse, type NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

import {
  looksLikeABot,
  recordView,
  referrerHost,
  siteOf,
  tidyPath,
} from "@/lib/traffic";

/**
 * Where a page reports that it was read.
 *
 * Called by the script in the site's layout, once per page, after the page is
 * on screen. It answers 204 whatever happens: nothing here is worth showing
 * anybody an error over, and a reader must never wait on a counter.
 *
 * What it is told is the address, whether this is a new visit, and the page
 * the reader came from. What it works out for itself is the country — from the
 * header Vercel sets at the edge, never from anything the caller claims. No
 * address of the reader is stored and no cookie is set.
 *
 * What it is told is not trusted beyond what it is used for. The address is
 * trimmed, length-capped and refused if it names the admin; the referring page
 * is reduced to a bare host and capped too. Nothing here reaches a query as
 * anything but a bound parameter, and the worst a liar can do is add one to a
 * counter — which is also the worst anyone with a browser can do.
 */

// Built per call rather than shared: a Response carries a body stream, and one
// instance handed to two requests is one instance consumed twice.
const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  try {
    if (looksLikeABot(request.headers.get("user-agent"))) return noContent();

    const body = (await request.json().catch(() => null)) as {
      path?: unknown;
      newVisit?: unknown;
      from?: unknown;
    } | null;

    const path = typeof body?.path === "string" ? tidyPath(body.path) : null;
    if (!path) return noContent();

    const payload = await getPayload({ config });
    await recordView(payload, {
      path,
      site: siteOf(path),
      // Sent by the page rather than read off this request. This request's
      // own Referer is the page that sent it, which is always this site — so
      // reading that would record no referrals at all, ever. What the page
      // sends is `document.referrer`: the page before it, and empty once
      // somebody is moving around inside the site.
      referrer: referrerHost(typeof body?.from === "string" ? body.from : null, request.nextUrl.hostname),
      // Absent off Vercel — locally, everything is simply read nowhere.
      country: (request.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase(),
      newVisit: body?.newVisit === true,
    });
  } catch {
    // A counter is never worth a broken page, and this is called from one.
  }

  return noContent();
}
