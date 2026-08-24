import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
              ? `/${tenant.locale}/${tenant.continent}/${tenant.slug}`
              : `/${tenant.continent}/${tenant.slug}`,
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
