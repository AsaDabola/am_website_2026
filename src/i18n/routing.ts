import { defineRouting } from "next-intl/routing";

// Locales the site actually ships. Adding another is: add it here, add its
// label below, and add messages/<locale>.json.
//
// The set is driven by lib/countrySites.ts — a mission country should be
// readable in its own language. The four after `zh` cover the G20 half (Italy,
// Russia, Turkey, Indonesia); the nine after those cover the European M40
// countries. Gaps remain further down that list, and
// `untranslatedLanguages()` in countrySites.ts reports which countries are
// still running on a fallback locale.
export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
  "ko",
  "ja",
  "zh",
  "it",
  "ru",
  "tr",
  "id",
  "nl",
  "pl",
  "uk",
  "cs",
  "sk",
  "el",
  "hu",
  "ro",
  "sv",
  "ar",
  "he",
  "ur",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
  it: "Italiano",
  ru: "Русский",
  tr: "Türkçe",
  id: "Bahasa Indonesia",
  nl: "Nederlands",
  pl: "Polski",
  uk: "Українська",
  cs: "Čeština",
  sk: "Slovenčina",
  el: "Ελληνικά",
  hu: "Magyar",
  ro: "Română",
  sv: "Svenska",
  ar: "العربية",
  he: "עברית",
  ur: "اردو",
};

/**
 * Locales written right to left. Everything else is left to right, so this is
 * a list rather than a full map — adding an RTL locale means adding it here
 * *and* to `locales` above, or the page will lay out backwards.
 */
const RTL_LOCALES = new Set<string>(["ar", "he", "ur"]);

export function directionOf(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English lives at the root ("/"), every other locale gets a prefix
  // ("/ko", "/ja", ...). This is the standard pattern; flag to revisit
  // if a literal "/intl" segment was actually intended for English.
  localePrefix: "as-needed",
});
