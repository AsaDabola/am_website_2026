"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isContinent } from "@/lib/continents";
import { isTenantAwareHref } from "@/lib/tenantRoutes";
import { flagSrc } from "@/lib/countryFlags";
import { ChevronDownIcon } from "@/components/ui/icons";

export type SwitcherCountry = {
  country: string;
  /** "{continent}/{slug}" — also the path the site lives at. */
  key: string;
  flag: string | null;
  /** The country's own language, which switching to it also switches to. */
  locale: string;
};

/**
 * Country picker, sitting beside the language picker in the header.
 *
 * The two stay separate controls because the axes are separate: picking a
 * country sets a sensible language, but every country site can be read in any
 * of the site's locales, so the language picker still has to stand on its own.
 *
 * Switching keeps the page you are on. The country prefix is a path segment
 * (/europe/germany/about), so moving between countries is a matter of
 * swapping that prefix — but only the routes in TENANT_ROUTES exist on a
 * country site, so a page that does not exist there drops to that country's
 * home rather than 404ing.
 *
 * It also switches language, to the country's own: arriving on the German
 * site in German is what someone picking "Germany" means, and the language
 * switcher is right there to read it in something else.
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
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // usePathname() from next-intl is already locale-stripped, so the first two
  // segments are the country prefix when there is one.
  const segments = pathname.split("/").filter(Boolean);
  const onCountrySite = segments.length >= 2 && isContinent(segments[0]);
  const currentKey = onCountrySite ? `${segments[0]}/${segments[1]}` : "";
  const rest = onCountrySite ? `/${segments.slice(2).join("/")}` : pathname;

  const current = countries.find((c) => c.key === currentKey);
  const label = current ? current.country : t("international");

  function go(key: string, locale?: string) {
    // `rest` is the page within the site — "/about" on /europe/germany/about,
    // and the whole path when on the main site. A country site only serves
    // the routes in TENANT_ROUTES, so it carries over only when it is one of
    // them; anything else (the shared news feed, the network directory) lands
    // on that country's home instead of a 404. The main site serves
    // everything, so leaving a country always keeps the page.
    const carried = isTenantAwareHref(rest) ? rest : "/";
    const target = key ? (carried === "/" ? `/${key}` : `/${key}${carried}`) : rest || "/";

    // Picking a country switches language with it; picking International
    // leaves the language alone, since it has no language of its own.
    router.push(target, locale ? { locale } : undefined);
    setOpen(false);
  }

  const textColor = dark ? "text-ink" : "text-white";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("label")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium ${textColor} hover:opacity-80`}
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
        <span className="max-w-[9rem] truncate">{label}</span>
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
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                go("");
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm hover:bg-mist ${
                current ? "text-ink" : "font-semibold text-brand-navy"
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth={1.4} />
                <path
                  d="M2.5 10h15M10 2.5c2.2 2.1 3.4 4.8 3.4 7.5s-1.2 5.4-3.4 7.5c-2.2-2.1-3.4-4.8-3.4-7.5S7.8 4.6 10 2.5Z"
                  stroke="currentColor"
                  strokeWidth={1.4}
                />
              </svg>
              {t("international")}
            </button>
          </li>

          {countries.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(c.key, c.locale);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm hover:bg-mist ${
                  c.key === currentKey ? "font-semibold text-brand-navy" : "text-ink"
                }`}
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
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
