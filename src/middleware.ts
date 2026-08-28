import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isContinent } from "./lib/continents";
import { COUNTRY_SITES, COUNTRY_SLUGS } from "./lib/countrySites";

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
 * now: /europe/germany → /germany, /es/southamerica/argentina → /es/argentina.
 *
 * Permanent, because these were the real addresses — they are in Google, in
 * links people sent each other, and in the sitemap that was already
 * submitted. A 301 hands all of that to the new path instead of losing it.
 */
function movedFromContinentPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const localePrefix =
    segments.length && (routing.locales as readonly string[]).includes(segments[0])
      ? segments.shift()
      : null;

  if (segments.length < 2 || !isContinent(segments[0])) return null;
  if (!COUNTRY_SLUGS.has(segments[1])) return null;

  segments.splice(0, 1); // drop the continent; the country and the rest stay

  // Carry the country's own language into the redirect when the old address
  // had none. Without it the visitor lands on /germany, which redirects again
  // to /de/germany — one hop is enough, and a chain of them is a thing search
  // engines follow grudgingly.
  const country = COUNTRY_SITES.find((site) => site.slug === segments[0]);
  const language =
    localePrefix ??
    (country && country.locale !== routing.defaultLocale ? country.locale : null);

  return `/${[language, ...segments].filter(Boolean).join("/")}`;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const moved = movedFromContinentPath(pathname);
  if (moved) {
    const target = new URL(moved, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 301);
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
          const target = new URL(
            tenant.locale && tenant.locale !== routing.defaultLocale
              ? `/${tenant.locale}/${tenant.slug}`
              : `/${tenant.slug}`,
            request.url,
          );
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
