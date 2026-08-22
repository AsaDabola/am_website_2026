import { defineRouting } from "next-intl/routing";

// Locales the site actually ships. Adding another is: add it here, add its
// label below, and add messages/<locale>.json.
//
// The set is driven by lib/countrySites.ts — a mission country should be
// readable in its own language, so the list grew country by country rather
// than by speaker count. Roughly grouped: the G20 half, then Europe, then the
// three RTL locales, then Asia, Africa and the remaining island and creole
// languages. `untranslatedLanguages()` in countrySites.ts reports any country
// still running on a fallback locale — it should now come back empty.
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
  "hi",
  "bn",
  "ta",
  "ne",
  "si",
  "my",
  "th",
  "vi",
  "fil",
  "ms",
  "mn",
  "kk",
  "sw",
  "am",
  "af",
  "zu",
  "xh",
  "rw",
  "rn",
  "mg",
  "ht",
  "fj",
  "hif",
  "rm",
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
  hi: "हिन्दी",
  bn: "বাংলা",
  ta: "தமிழ்",
  ne: "नेपाली",
  si: "සිංහල",
  my: "မြန်မာ",
  th: "ไทย",
  vi: "Tiếng Việt",
  fil: "Filipino",
  ms: "Bahasa Melayu",
  mn: "Монгол",
  kk: "Қазақша",
  sw: "Kiswahili",
  am: "አማርኛ",
  af: "Afrikaans",
  zu: "isiZulu",
  xh: "isiXhosa",
  rw: "Ikinyarwanda",
  rn: "Ikirundi",
  mg: "Malagasy",
  ht: "Kreyòl Ayisyen",
  fj: "Na Vosa Vakaviti",
  hif: "Fiji Hindi",
  rm: "Rumantsch",
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
