import { defineRouting } from "next-intl/routing";

// Starter set of locales covering major European + Asian languages, chosen
// to prove out the i18n architecture end-to-end with real (not machine)
// translations. Adding another locale later is just: add it here, add
// its label below, and add messages/<locale>.json.
export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
  "ko",
  "ja",
  "zh",
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
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English lives at the root ("/"), every other locale gets a prefix
  // ("/ko", "/ja", ...). This is the standard pattern; flag to revisit
  // if a literal "/intl" segment was actually intended for English.
  localePrefix: "as-needed",
});
