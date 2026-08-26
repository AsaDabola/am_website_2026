"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";
import { countryFromPath } from "@/lib/currentCountry";
import { isTenantAwareHref } from "@/lib/tenantRoutes";
import { flagSrc } from "@/lib/countryFlags";
import { ChevronDownIcon } from "@/components/ui/icons";

export type SwitcherCountry = {
  country: string;
  /** "{continent}/{slug}" — also the path the site lives at. */
  key: string;
  flag: string | null;
  /** The country's own language, which opening it also opens it in. */
  locale: string;
};

/**
 * Country picker, sitting beside the language picker in the header.
 *
 * It only opens on the main site. Each country site is presented as its own
 * organisation, so once you are on one there is no picker to take you to a
 * different country — just the name of the one you are on. The language picker
 * beside it keeps working there, because reading a country's site in another
 * language is a different question from being on a different country's site.
 *
 * Every country opens in a new tab, for the same reason: leaving amintl.org
 * for AM Germany should feel like arriving somewhere, not like the page you
 * were on changing underneath you.
 */
export default function CountrySwitcher({
  countries,
  dark = false,
}: {
  countries: SwitcherCountry[];
  dark?: boolean;
}) {
  const t = useTranslations("CountrySwitcher");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const here = countryFromPath(pathname);
  const current = here ? countries.find((c) => c.key === here.key) : undefined;
  const textColor = dark ? "text-ink" : "text-white";

  // On a country site: the name of the country, and nothing to open.
  if (here) {
    return (
      <span
        className={`flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium ${textColor}`}
      >
        {current?.flag ? (
          // Flags are static SVGs at a fixed 20px, so the image optimiser has
          // nothing to do with them.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flagSrc(current.flag)}
            alt=""
            width={20}
            height={14}
            className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
          />
        ) : null}
        <span className="max-w-[9rem] truncate">{current?.country ?? here.slug}</span>
      </span>
    );
  }

  /**
   * The page within the site. A country site only serves the routes in
   * TENANT_ROUTES, so the current page carries over only when it is one of
   * them; anything else — the shared news feed, the network directory — opens
   * that country's home rather than a 404.
   *
   * The locale is the country's own: arriving on the German site in German is
   * what picking "Germany" means, and its language switcher is right there.
   * `localePrefix` is "as-needed", so the default locale takes no prefix.
   */
  function hrefFor(country: SwitcherCountry): string {
    const carried = isTenantAwareHref(pathname) ? pathname : "/";
    const path = carried === "/" ? `/${country.key}` : `/${country.key}${carried}`;
    return country.locale === defaultLocale ? path : `/${country.locale}${path}`;
  }

  return (
    // Closing on the container's blur rather than the button's: the rows are
    // real links now, and a timer racing the click would sometimes swallow it.
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={t("label")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium ${textColor} hover:opacity-80`}
      >
        <span className="max-w-[9rem] truncate">{t("international")}</span>
        {/* No globe on this one: the language switcher beside it already
            carries one, and two identical globes side by side say nothing
            about which is which. */}
        <ChevronDownIcon />
      </button>

      {open && (
        // Sixty-odd countries is taller than the viewport in one column, so
        // this takes the same height cap and two-column split the language
        // list uses.
        <ul className="absolute end-0 top-full z-50 mt-2 grid max-h-[70vh] w-64 grid-cols-1 gap-x-1 overflow-y-auto overscroll-contain rounded-xl border border-black/5 bg-white p-1.5 text-ink shadow-xl sm:w-[30rem] sm:grid-cols-2">
          <li className="sm:col-span-2">
            {/* Where you already are, so it marks the spot rather than links. */}
            <span className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy">
              <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth={1.4} />
                <path
                  d="M2.5 10h15M10 2.5c2.2 2.1 3.4 4.8 3.4 7.5s-1.2 5.4-3.4 7.5c-2.2-2.1-3.4-4.8-3.4-7.5S7.8 4.6 10 2.5Z"
                  stroke="currentColor"
                  strokeWidth={1.4}
                />
              </svg>
              {t("international")}
            </span>
          </li>

          {countries.map((c) => (
            <li key={c.key}>
              {/* A real link, not a scripted push: a new tab is the point, and
                  middle-click and "open in new window" should work too. */}
              <a
                href={hrefFor(c)}
                target="_blank"
                rel="noopener"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm text-ink hover:bg-mist"
              >
                {c.flag ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={flagSrc(c.flag)}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
                  />
                ) : (
                  <span className="h-3.5 w-5 shrink-0 rounded-[2px] bg-mist" />
                )}
                <span className="truncate">{c.country}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
