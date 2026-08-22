"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const textColor = dark ? "text-ink" : "text-white";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium ${textColor} hover:opacity-80`}
      >
        <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth={1.4} />
          <path
            d="M2.5 10h15M10 2.5c2.2 2.1 3.4 4.8 3.4 7.5s-1.2 5.4-3.4 7.5c-2.2-2.1-3.4-4.8-3.4-7.5S7.8 4.6 10 2.5Z"
            stroke="currentColor"
            strokeWidth={1.4}
          />
        </svg>
        <span className="hidden sm:inline">{localeLabels[locale as Locale]}</span>
      </button>

      {open && (
        // The site ships ~50 locales, so this list is far taller than the
        // viewport as a single column: it needs both the height cap (or the
        // tail is unreachable below the fold) and the second column (or the
        // scroll is long enough that nobody reaches the bottom of it).
        <ul className="font-script-list absolute end-0 top-full z-50 mt-2 grid max-h-[70vh] w-44 grid-cols-1 gap-x-1 overflow-y-auto overscroll-contain rounded-xl border border-black/5 bg-white p-1.5 text-ink shadow-xl sm:w-88 sm:grid-cols-2">
          {locales.map((code) => (
            <li key={code}>
              <button
                type="button"
                // Each label is written in its own language, so tag it as such
                // — it drives font fallback above and stops a screen reader
                // reading "Français" with the surrounding locale's voice.
                lang={code}
                onMouseDown={(event) => {
                  event.preventDefault();
                  router.replace(pathname, { locale: code });
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-start text-sm hover:bg-mist ${
                  code === locale ? "font-semibold text-brand-navy" : "text-ink"
                }`}
              >
                {localeLabels[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
