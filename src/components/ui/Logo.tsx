"use client";

import TenantLink from "@/components/layout/TenantLink";
import { usePathname } from "@/i18n/navigation";
import { COUNTRY_SLUGS } from "@/lib/countrySites";
import { COUNTRY_LOGO_HEIGHT, countryLogo } from "@/lib/countryLogos";
import LogoMark from "./LogoMark";

const LOGO_PX = 38;

/**
 * Reads the country off the path rather than the tenant store: the store holds
 * a database id, and the layout that renders the header and footer sits above
 * the tenant route, so it never sees the country the way a page below it does.
 * The path carries it either way, and this is what TenantLink already does to
 * keep links on the country site.
 */
function countrySlug(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length || !COUNTRY_SLUGS.has(segments[0])) return null;
  return segments[1];
}

export default function Logo({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();
  const slug = countrySlug(pathname);
  const country = slug ? countryLogo(slug) : null;
  const textColor = dark ? "text-ink" : "text-white";

  return (
    <TenantLink
      href="/"
      className={`inline-flex ${textColor}`}
      aria-label={country ? "AM home" : "AM International home"}
    >
      {country ? (
        /*
         * Masked rather than <img>, so the artwork still takes its colour from
         * the text colour above it the way the inline mark does — the header
         * draws it white and a light surface would need it in ink, and a plain
         * <img> of a white SVG would simply disappear on the second one.
         *
         * One request per country site, cached, instead of carrying all 68
         * wordmarks in the bundle of every page: together they are a quarter of
         * a megabyte of path data, and a visitor ever sees one of them.
         */
        <span
          className="block bg-current"
          style={{
            height: LOGO_PX,
            width: (LOGO_PX * country.width) / COUNTRY_LOGO_HEIGHT,
            maskImage: `url(${country.src})`,
            WebkitMaskImage: `url(${country.src})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      ) : (
        <LogoMark className="h-[38px] w-auto" />
      )}
    </TenantLink>
  );
}
