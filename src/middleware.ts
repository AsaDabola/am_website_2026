import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isContinent } from "./lib/continents";
import {
  CODE_FOR_SLUG,
  COUNTRY_BY_CODE,
  COUNTRY_SLUGS,
  localeForCode,
} from "./lib/countrySites";

const intlMiddleware = createMiddleware(routing);

// Set once a visitor's first hit to the site has been geo-checked (whether
// or not it matched a country site), so we redirect at most once per
// visitor and never fight a visitor who deliberately navigates back to the
// main site afterward.
const GEO_COOKIE = "am-geo-checked";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Matches the bare homepage under any locale — "/", "/de", "/ko", "/fil" —
// with or without a trailing slash. Deep links (e.g. a search result
// landing on /about) are left alone; CountrySuggestionBanner handles
// those with a dismissible suggestion instead of a hard redirect.
//
// Built from the locale list rather than a `[a-z]{2}` pattern, which
// silently stopped matching when the first three-letter locales (fil, hif)
// shipped: visitors landing on /fil skipped the geo redirect entirely.
const LOCALE_SEGMENTS = new Set<string>(routing.locales);

function isRootPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return true;
  return segments.length === 1 && LOCALE_SEGMENTS.has(segments[0]);
}

type GeoTenant = { country: string; continent: string; slug: string; locale?: string };

/**
 * The address a country site used to live at, moved to the one it lives at
 * now. Three shapes have existed, and all of them land on the two letters:
 *
 *   /europe/germany            → /de
 *   /es/southamerica/argentina → /ar
 *   /germany, /de/germany      → /de
 *
 * Permanent, because each of these was the real address at some point — they
 * are in Google, in the sitemap already submitted, and in links people sent
 * each other. A 301 hands that standing to the new address instead of losing
 * it.
 */
export function movedToCountryCode(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return null;
  let changed = false;

  // A leading language, from when the address carried one.
  //
  // Some of those languages spell a country code — "es" is Spanish and also
  // Spain — so the segment after it decides which this is. Followed by a
  // continent or a country's old long name, it is a stale language prefix and
  // goes; otherwise it is the country and stays.
  const next = segments[1];
  const looksStale = next !== undefined && (isContinent(next) || COUNTRY_SLUGS.has(next));
  if (LOCALE_SEGMENTS.has(segments[0]) && (looksStale || !COUNTRY_BY_CODE.has(segments[0]))) {
    segments.shift();
    changed = true;
  }

  // The continent, from when it was in the path.
  if (segments.length >= 2 && isContinent(segments[0]) && COUNTRY_SLUGS.has(segments[1])) {
    segments.shift();
    changed = true;
  }

  // The country's long name, which the two letters replace.
  const code = segments.length ? CODE_FOR_SLUG.get(segments[0]) : undefined;
  if (code) {
    segments[0] = code;
    changed = true;
  }

  if (!changed) return null;
  return `/${segments.join("/")}`;
}

/**
 * The language a country's pages are rendered in, put back into the path for
 * Next to route on — /co/about is served by [locale]/[...slug] as
 * /es/co/about. A rewrite, not a redirect: the address bar keeps the two
 * letters, which is the whole point.
 */
export function localeRewrite(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments.length ? localeForCode(segments[0]) : null;
  return locale ? `/${locale}${pathname}` : null;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const moved = movedToCountryCode(pathname);
  if (moved && moved !== pathname) {
    const target = new URL(moved, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 301);
  }

  // A country site: fill the language in behind the scenes and serve it.
  const rewritten = localeRewrite(pathname);
  if (rewritten) {
    const target = new URL(rewritten, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.rewrite(target);
  }

  if (isRootPath(pathname) && !request.cookies.has(GEO_COOKIE)) {
    const countryCode = request.headers.get("x-vercel-ip-country");

    if (countryCode) {
      try {
        const geoUrl = new URL("/api/geo", request.url);
        const geoRes = await fetch(geoUrl, {
          headers: { "x-vercel-ip-country": countryCode },
        });
        const { tenant } = (await geoRes.json()) as { tenant: GeoTenant | null };

        if (tenant) {
          const code = CODE_FOR_SLUG.get(tenant.slug);
          const target = new URL(code ? `/${code}` : "/", request.url);
          const response = NextResponse.redirect(target);
          response.cookies.set(GEO_COOKIE, "1", { maxAge: ONE_YEAR, path: "/" });
          return response;
        }
      } catch {
        // Geo lookup failed (e.g. the DB is unreachable) — fall through to
        // normal locale routing rather than blocking the request.
      }
    }

    const response = intlMiddleware(request);
    response.cookies.set(GEO_COOKIE, "1", { maxAge: ONE_YEAR, path: "/" });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // Run on everything except Payload's admin/API routes, Next internals,
  // and static files.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
