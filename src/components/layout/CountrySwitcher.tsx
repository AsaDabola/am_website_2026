"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";
import { countryFromPath, mainSiteHref } from "@/lib/currentCountry";
import { isTenantAwareHref } from "@/lib/tenantRoutes";
import { flagSrc } from "@/lib/countryFlags";
import { ChevronDownIcon } from "@/components/ui/icons";

export type SwitcherCountry = {
  country: string;
  /** The country slug — also the path the site lives at. */
  key: string;
  flag: string | null;
  /** The country's own language, which opening it also opens it in. */
  locale: string;
};

/**
 * Country picker, in the header of every site in the network.
 *
 * It used to go dead on a country site — the name of the country and nothing
 * to open — on the reasoning that each country site is its own organisation.
 * That left no way back to amintl.org from Germany, and once the language
 * picker went (the language follows the country now) it left no control in
 * the header at all. So it opens everywhere, and International is a real link
 * wherever you are not already.
 *
 * Every country opens in a new tab: leaving amintl.org for AM Germany should
 * feel like arriving somewhere, not like the page you were on changing
 * underneath you. International opens in place, because going back to where
 * you came from is not arriving somewhere new.
 */
/** The globe beside "International", drawn once for both states. */
function GlobeMark() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth={1.4} />
      <path
        d="M2.5 10h15M10 2.5c2.2 2.1 3.4 4.8 3.4 7.5s-1.2 5.4-3.4 7.5c-2.2-2.1-3.4-4.8-3.4-7.5S7.8 4.6 10 2.5Z"
        stroke="currentColor"
        strokeWidth={1.4}
      />
    </svg>
  );
}

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

  /** The label on the button: the country you are on, or International. */
  const trigger = here ? (
    <>
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
    </>
  ) : (
    <span className="max-w-[9rem] truncate">{t("international")}</span>
  );

  /**
   * The page within the site. A country site only serves the routes in
   * TENANT_ROUTES, so the current page carries over only when it is one of
   * them; anything else — the shared news feed, the network directory — opens
   * that country's home rather than a 404.
   *
   * The locale is the country's own: arriving on the German site in German is
   * what picking "Germany" means. `localePrefix` is "as-needed", so the
   * default locale takes no prefix.
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
        {trigger}
        <ChevronDownIcon />
      </button>

      {open && (
        // Sixty-odd countries is taller than the viewport in one column, so
        // this takes the same height cap and two-column split the language
        // list uses.
        <ul className="absolute end-0 top-full z-50 mt-2 grid max-h-[70vh] w-64 grid-cols-1 gap-x-1 overflow-y-auto overscroll-contain rounded-xl border border-black/5 bg-white p-1.5 text-ink shadow-xl sm:w-[30rem] sm:grid-cols-2">
          <li className="sm:col-span-2">
            {/* A link from a country site — the way back to amintl.org — and
                just a marker on the main site, where it is where you are. */}
            {here ? (
              // A plain anchor, like the country rows: a localised Link would
              // prefix the country's language and land on the international
              // site in German, and closing the menu on click unmounts a
              // client-routed link before it navigates.
              <a
                href={mainSiteHref(pathname)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-mist"
              >
                <GlobeMark />
                {t("international")}
              </a>
            ) : (
              <span className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy">
                <GlobeMark />
                {t("international")}
              </span>
            )}
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
