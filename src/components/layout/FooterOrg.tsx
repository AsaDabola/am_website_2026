"use client";

import { useSitePathname } from "@/lib/useSitePathname";
import { countryFromPath, HEAD_OFFICE_KEYS } from "@/lib/currentCountry";
import { flagSrc } from "@/lib/countryFlags";

export type FooterCountry = {
  /** The country slug — the site's path, and how the pathname is matched. */
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
  const here = countryFromPath(useSitePathname());
  const current = here ? countries.find((c) => c.key === here.key) : undefined;

  const orgName = current?.orgName || defaultOrgName;
  const email = current?.contactEmail || defaultEmail;

  // Head office's address is head office's. A country site shows it only if it
  // speaks for head office; otherwise it shows the address it has entered, or
  // no address line at all rather than pointing visitors at New Jersey.
  const inheritsHeadOffice = !here || HEAD_OFFICE_KEYS.has(here.key);
  const address = current?.address || (inheritsHeadOffice ? defaultAddress : "");

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
      {address ? <span className="mt-1 block whitespace-pre-line">{address}</span> : null}
      <a href={`mailto:${email}`} className="underline underline-offset-2">
        {email}
      </a>
    </p>
  );
}
