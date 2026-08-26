"use client";

import { usePathname } from "@/i18n/navigation";
import { isContinent } from "@/lib/continents";
import { flagSrc } from "@/lib/countryFlags";

export type FooterCountry = {
  /** "{continent}/{slug}" — the site's path, and how the pathname is matched. */
  key: string;
  country: string;
  flag: string | null;
  orgName?: string;
  address?: string;
  contactEmail?: string;
};

/**
 * The organisation block in the footer, which names the country you are on.
 *
 * A client component reading the pathname, rather than the server reading the
 * per-request tenant: the footer renders in the layout, above the point where
 * the tenant route records which country it is, so at layout level that store
 * may not be set yet. The path is unambiguous and available immediately, and
 * the country list is small enough to hand over — the header's country picker
 * already does the same thing for the same reason.
 *
 * Every field falls back to the main site's, so a country shows head office's
 * details until it fills its own in, and filling one in does not oblige it to
 * fill in the rest.
 */
export default function FooterOrg({
  countries,
  defaultOrgName,
  defaultAddress,
  defaultEmail,
}: {
  countries: FooterCountry[];
  defaultOrgName: string;
  defaultAddress: string;
  defaultEmail: string;
}) {
  const segments = usePathname().split("/").filter(Boolean);
  const key =
    segments.length >= 2 && isContinent(segments[0])
      ? `${segments[0]}/${segments[1]}`
      : "";
  const current = key ? countries.find((c) => c.key === key) : undefined;

  const orgName = current?.orgName || defaultOrgName;
  const address = current?.address || defaultAddress;
  const email = current?.contactEmail || defaultEmail;

  return (
    <p className="mt-6 text-sm leading-relaxed text-on-dark/70">
      <span className="flex items-center gap-2">
        {current?.flag ? (
          // Static SVG at a fixed 18px; the image optimiser has nothing to do.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flagSrc(current.flag)}
            alt=""
            width={18}
            height={13}
            className="h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover"
          />
        ) : null}
        {orgName}
      </span>
      {/* The address is free text and may run to several lines. */}
      <span className="mt-1 block whitespace-pre-line">{address}</span>
      <a href={`mailto:${email}`} className="underline underline-offset-2">
        {email}
      </a>
    </p>
  );
}
