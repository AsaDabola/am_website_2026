import { defineRouting } from "next-intl/routing";

// Locales the site actually ships. Adding another is: add it here, add its
// label below, and add messages/<locale>.json.
//
// The set is driven by lib/countrySites.ts — every G20 mission country should
// be readable in its own language. The four after `zh` were added for Italy,
// Russia, Turkey and Indonesia, which were otherwise falling back to English.
// The M40 half still has gaps; `untranslatedLanguages()` in that file reports
// which countries are running on a fallback locale.
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
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English lives at the root ("/"), every other locale gets a prefix
  // ("/ko", "/ja", ...). This is the standard pattern; flag to revisit
  // if a literal "/intl" segment was actually intended for English.
  localePrefix: "as-needed",
});
