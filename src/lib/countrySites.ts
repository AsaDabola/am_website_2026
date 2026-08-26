import type { Continent } from "./continents";
import { locales, type Locale } from "@/i18n/routing";

/**
 * AM's G20 + M40 mission country list — the canonical source for the
 * path-based country sites at amintl.org/{continent}/{slug}.
 *
 * Transcribed from the org's "G20 + M40 Mission Country List" sheet. This
 * file is the input to /api/seed-tenants, which writes it into the Tenants
 * collection; editing a country afterwards is done in the admin, not here.
 *
 * Three entries need explaining, because the sheet is not one row per country:
 *
 *  - Colombia covers Colombia, Venezuela, Ecuador and Panama.
 *  - East Africa Federation covers Kenya, Tanzania, Uganda, Rwanda, Burundi
 *    and South Sudan. Rwanda also has its own row further down the sheet.
 *  - Where a grouped entry and a standalone entry both claim a country, the
 *    standalone entry keeps the ISO code (geo detection has to resolve to
 *    exactly one site) — so Rwanda is absent from the federation's codes
 *    below, and Venezuela is absent from Colombia's where a Venezuela site
 *    already exists.
 */
export type CountrySite = {
  /** Display name, as it appears on the Our Network page. */
  country: string;
  /** Main chapter city. Only filled in where AM's network table names one. */
  city?: string;
  continent: Continent;
  /** URL segment: /{continent}/{slug} */
  slug: string;
  /**
   * Default site language. Constrained to a locale the site actually ships;
   * every country now has one, so `untranslatedLanguages()` comes back empty.
   *
   * Normally this is `nativeLanguages[0]`. Two countries deviate on purpose:
   * Haiti and the East Africa Federation open in the language most people
   * there actually speak (Creole, Swahili) rather than the colonial-era first
   * entry the sheet lists. South Africa, Singapore and Fiji do list English
   * first and keep it, since none of their other languages is shared across
   * the whole student body.
   */
  locale: Locale;
  /** ISO 3166-1 alpha-2 codes this site answers for, for IP geo detection. */
  countryCodes: string[];
  /** Languages the sheet lists for this country, as BCP 47 tags. */
  nativeLanguages: string[];
  /** Which half of the list this country came from. */
  tier: "g20" | "m40";
};

export const COUNTRY_SITES: CountrySite[] = [
  // ---------------------------------------------------------------- G20 (20)
  { country: "Brazil", city: "São Paulo", continent: "southamerica", slug: "brazil", locale: "pt", countryCodes: ["BR"], nativeLanguages: ["pt"], tier: "g20" },
  { country: "Canada", city: "Toronto", continent: "northamerica", slug: "canada", locale: "en", countryCodes: ["CA"], nativeLanguages: ["en", "fr"], tier: "g20" },
  { country: "Colombia", city: "Bogotá", continent: "southamerica", slug: "colombia", locale: "es", countryCodes: ["CO", "EC", "PA"], nativeLanguages: ["es"], tier: "g20" },
  { country: "France", city: "Paris", continent: "europe", slug: "france", locale: "fr", countryCodes: ["FR"], nativeLanguages: ["fr"], tier: "g20" },
  { country: "Germany", city: "Frankfurt", continent: "europe", slug: "germany", locale: "de", countryCodes: ["DE"], nativeLanguages: ["de"], tier: "g20" },
  { country: "India", city: "Chennai", continent: "asia", slug: "india", locale: "hi", countryCodes: ["IN"], nativeLanguages: ["hi", "en"], tier: "g20" },
  { country: "Indonesia", city: "Jakarta", continent: "asia", slug: "indonesia", locale: "id", countryCodes: ["ID"], nativeLanguages: ["id"], tier: "g20" },
  { country: "Italy", continent: "europe", slug: "italy", locale: "it", countryCodes: ["IT"], nativeLanguages: ["it"], tier: "g20" },
  { country: "Japan", city: "Tokyo", continent: "asia", slug: "japan", locale: "ja", countryCodes: ["JP"], nativeLanguages: ["ja"], tier: "g20" },
  { country: "East Africa Federation", city: "Nairobi", continent: "africa", slug: "east-africa-federation", locale: "sw", countryCodes: ["BI", "SS"], nativeLanguages: ["en", "sw", "fr", "rn"], tier: "g20" },
  { country: "South Korea", city: "Seoul", continent: "asia", slug: "south-korea", locale: "ko", countryCodes: ["KR"], nativeLanguages: ["ko"], tier: "g20" },
  { country: "Mexico", city: "Mexico City", continent: "southamerica", slug: "mexico", locale: "es", countryCodes: ["MX"], nativeLanguages: ["es"], tier: "g20" },
  { country: "Nigeria", city: "Lagos", continent: "africa", slug: "nigeria", locale: "en", countryCodes: ["NG"], nativeLanguages: ["en"], tier: "g20" },
  { country: "Australia", city: "Sydney", continent: "oceania", slug: "australia", locale: "en", countryCodes: ["AU"], nativeLanguages: ["en"], tier: "g20" },
  { country: "Russia", continent: "europe", slug: "russia", locale: "ru", countryCodes: ["RU"], nativeLanguages: ["ru"], tier: "g20" },
  { country: "South Africa", continent: "africa", slug: "south-africa", locale: "en", countryCodes: ["ZA"], nativeLanguages: ["en", "af", "zu", "xh"], tier: "g20" },
  { country: "Spain", city: "Madrid", continent: "europe", slug: "spain", locale: "es", countryCodes: ["ES"], nativeLanguages: ["es"], tier: "g20" },
  { country: "Turkey", continent: "asia", slug: "turkey", locale: "tr", countryCodes: ["TR"], nativeLanguages: ["tr"], tier: "g20" },
  { country: "United Kingdom", city: "London", continent: "europe", slug: "united-kingdom", locale: "en", countryCodes: ["GB"], nativeLanguages: ["en"], tier: "g20" },
  { country: "United States", city: "Trenton", continent: "northamerica", slug: "united-states", locale: "en", countryCodes: ["US"], nativeLanguages: ["en"], tier: "g20" },

  // ---------------------------------------------------------------- M40 (48)
  { country: "Angola", continent: "africa", slug: "angola", locale: "pt", countryCodes: ["AO"], nativeLanguages: ["pt"], tier: "m40" },
  { country: "Cameroon", continent: "africa", slug: "cameroon", locale: "fr", countryCodes: ["CM"], nativeLanguages: ["fr", "en"], tier: "m40" },
  { country: "Democratic Republic of the Congo", city: "Kinshasa", continent: "africa", slug: "democratic-republic-of-the-congo", locale: "fr", countryCodes: ["CD"], nativeLanguages: ["fr"], tier: "m40" },
  { country: "Ethiopia", city: "Addis Ababa", continent: "africa", slug: "ethiopia", locale: "am", countryCodes: ["ET"], nativeLanguages: ["am", "en"], tier: "m40" },
  { country: "Ghana", continent: "africa", slug: "ghana", locale: "en", countryCodes: ["GH"], nativeLanguages: ["en"], tier: "m40" },
  { country: "Côte d’Ivoire", continent: "africa", slug: "cote-divoire", locale: "fr", countryCodes: ["CI"], nativeLanguages: ["fr"], tier: "m40" },
  { country: "Madagascar", continent: "africa", slug: "madagascar", locale: "mg", countryCodes: ["MG"], nativeLanguages: ["mg", "fr"], tier: "m40" },
  { country: "Mozambique", continent: "africa", slug: "mozambique", locale: "pt", countryCodes: ["MZ"], nativeLanguages: ["pt"], tier: "m40" },
  { country: "Zambia", city: "Lusaka", continent: "africa", slug: "zambia", locale: "en", countryCodes: ["ZM"], nativeLanguages: ["en"], tier: "m40" },
  { country: "Rwanda", continent: "africa", slug: "rwanda", locale: "rw", countryCodes: ["RW"], nativeLanguages: ["rw", "en", "fr", "sw"], tier: "m40" },
  { country: "Egypt", city: "Cairo", continent: "africa", slug: "egypt", locale: "ar", countryCodes: ["EG"], nativeLanguages: ["ar"], tier: "m40" },

  { country: "Austria", continent: "europe", slug: "austria", locale: "de", countryCodes: ["AT"], nativeLanguages: ["de"], tier: "m40" },
  { country: "Belgium", continent: "europe", slug: "belgium", locale: "nl", countryCodes: ["BE"], nativeLanguages: ["nl", "fr", "de"], tier: "m40" },
  { country: "Czechia", continent: "europe", slug: "czechia", locale: "cs", countryCodes: ["CZ"], nativeLanguages: ["cs"], tier: "m40" },
  { country: "Slovakia", continent: "europe", slug: "slovakia", locale: "sk", countryCodes: ["SK"], nativeLanguages: ["sk"], tier: "m40" },
  { country: "Greece", continent: "europe", slug: "greece", locale: "el", countryCodes: ["GR"], nativeLanguages: ["el"], tier: "m40" },
  { country: "Hungary", continent: "europe", slug: "hungary", locale: "hu", countryCodes: ["HU"], nativeLanguages: ["hu"], tier: "m40" },
  { country: "Netherlands", city: "Amsterdam", continent: "europe", slug: "netherlands", locale: "nl", countryCodes: ["NL"], nativeLanguages: ["nl"], tier: "m40" },
  { country: "Poland", city: "Warsaw", continent: "europe", slug: "poland", locale: "pl", countryCodes: ["PL"], nativeLanguages: ["pl"], tier: "m40" },
  { country: "Portugal", continent: "europe", slug: "portugal", locale: "pt", countryCodes: ["PT"], nativeLanguages: ["pt"], tier: "m40" },
  { country: "Romania", continent: "europe", slug: "romania", locale: "ro", countryCodes: ["RO"], nativeLanguages: ["ro"], tier: "m40" },
  { country: "Sweden", continent: "europe", slug: "sweden", locale: "sv", countryCodes: ["SE"], nativeLanguages: ["sv"], tier: "m40" },
  { country: "Switzerland", continent: "europe", slug: "switzerland", locale: "de", countryCodes: ["CH"], nativeLanguages: ["de", "fr", "it", "rm"], tier: "m40" },
  { country: "Ukraine", continent: "europe", slug: "ukraine", locale: "uk", countryCodes: ["UA"], nativeLanguages: ["uk"], tier: "m40" },

  { country: "Dominican Republic", continent: "southamerica", slug: "dominican-republic", locale: "es", countryCodes: ["DO"], nativeLanguages: ["es"], tier: "m40" },
  { country: "Haiti", continent: "southamerica", slug: "haiti", locale: "ht", countryCodes: ["HT"], nativeLanguages: ["fr", "ht"], tier: "m40" },
  { country: "Guatemala", continent: "southamerica", slug: "guatemala", locale: "es", countryCodes: ["GT"], nativeLanguages: ["es"], tier: "m40" },
  { country: "Honduras", continent: "southamerica", slug: "honduras", locale: "es", countryCodes: ["HN"], nativeLanguages: ["es"], tier: "m40" },
  { country: "Argentina", city: "Buenos Aires", continent: "southamerica", slug: "argentina", locale: "es", countryCodes: ["AR"], nativeLanguages: ["es"], tier: "m40" },
  { country: "Chile", continent: "southamerica", slug: "chile", locale: "es", countryCodes: ["CL"], nativeLanguages: ["es"], tier: "m40" },
  { country: "Peru", city: "Lima", continent: "southamerica", slug: "peru", locale: "es", countryCodes: ["PE"], nativeLanguages: ["es"], tier: "m40" },

  { country: "Kazakhstan", continent: "asia", slug: "kazakhstan", locale: "kk", countryCodes: ["KZ"], nativeLanguages: ["kk", "ru"], tier: "m40" },
  { country: "Israel", continent: "asia", slug: "israel", locale: "he", countryCodes: ["IL"], nativeLanguages: ["he", "ar"], tier: "m40" },
  { country: "United Arab Emirates", continent: "asia", slug: "united-arab-emirates", locale: "ar", countryCodes: ["AE"], nativeLanguages: ["ar"], tier: "m40" },
  { country: "Bangladesh", continent: "asia", slug: "bangladesh", locale: "bn", countryCodes: ["BD"], nativeLanguages: ["bn"], tier: "m40" },
  { country: "Nepal", continent: "asia", slug: "nepal", locale: "ne", countryCodes: ["NP"], nativeLanguages: ["ne"], tier: "m40" },
  { country: "Pakistan", continent: "asia", slug: "pakistan", locale: "ur", countryCodes: ["PK"], nativeLanguages: ["ur", "en"], tier: "m40" },
  // The sheet lists Malaysia as "ms" and Myanmar as "my" — those are the
  // language codes, not the country codes, and they are swapped relative to
  // ISO 3166. Corrected here: Malaysia is MY, Myanmar is MM.
  { country: "Malaysia", city: "Kuala Lumpur", continent: "asia", slug: "malaysia", locale: "ms", countryCodes: ["MY"], nativeLanguages: ["ms"], tier: "m40" },
  { country: "Myanmar", continent: "asia", slug: "myanmar", locale: "my", countryCodes: ["MM"], nativeLanguages: ["my"], tier: "m40" },
  { country: "Philippines", city: "Manila", continent: "asia", slug: "philippines", locale: "fil", countryCodes: ["PH"], nativeLanguages: ["fil", "en"], tier: "m40" },
  { country: "Singapore", continent: "asia", slug: "singapore", locale: "en", countryCodes: ["SG"], nativeLanguages: ["en", "ms", "zh", "ta"], tier: "m40" },
  { country: "Thailand", city: "Bangkok", continent: "asia", slug: "thailand", locale: "th", countryCodes: ["TH"], nativeLanguages: ["th"], tier: "m40" },
  { country: "Vietnam", city: "Hanoi", continent: "asia", slug: "vietnam", locale: "vi", countryCodes: ["VN"], nativeLanguages: ["vi"], tier: "m40" },
  { country: "Mongolia", city: "Ulaanbaatar", continent: "asia", slug: "mongolia", locale: "mn", countryCodes: ["MN"], nativeLanguages: ["mn"], tier: "m40" },
  { country: "Taiwan", continent: "asia", slug: "taiwan", locale: "zh", countryCodes: ["TW"], nativeLanguages: ["zh"], tier: "m40" },
  { country: "Sri Lanka", continent: "asia", slug: "sri-lanka", locale: "si", countryCodes: ["LK"], nativeLanguages: ["si", "ta"], tier: "m40" },

  { country: "New Zealand", continent: "oceania", slug: "new-zealand", locale: "en", countryCodes: ["NZ"], nativeLanguages: ["en"], tier: "m40" },
  { country: "Fiji", continent: "oceania", slug: "fiji", locale: "en", countryCodes: ["FJ"], nativeLanguages: ["en", "fj", "hif"], tier: "m40" },
];

/** English names for the language tags above, for admin-facing copy. */
export const LANGUAGE_NAMES: Record<string, string> = {
  af: "Afrikaans", am: "Amharic", ar: "Arabic", bn: "Bengali", cs: "Czech",
  de: "German", el: "Greek", en: "English", es: "Spanish", fil: "Filipino",
  fj: "Fijian", fr: "French", he: "Hebrew", hi: "Hindi", hif: "Fiji Hindi",
  ht: "Haitian Creole", hu: "Hungarian", id: "Indonesian", it: "Italian",
  ja: "Japanese", kk: "Kazakh", ko: "Korean", mg: "Malagasy", mn: "Mongolian",
  ms: "Malay", my: "Burmese", ne: "Nepali", nl: "Dutch", pl: "Polish",
  pt: "Portuguese", rm: "Romansh", rn: "Kirundi", ro: "Romanian", ru: "Russian",
  rw: "Kinyarwanda", si: "Sinhala", sk: "Slovak", sv: "Swedish", sw: "Swahili",
  ta: "Tamil", th: "Thai", tr: "Turkish", uk: "Ukrainian", ur: "Urdu",
  vi: "Vietnamese", xh: "Xhosa", zh: "Chinese", zu: "Zulu",
};

const SHIPPED = new Set<string>(locales);

/**
 * The languages a country speaks that the site cannot yet serve. Drives the
 * translation backlog — a country with an empty list is fully covered, one
 * with entries is running on a fallback locale until those are added.
 */
export function untranslatedLanguages(site: CountrySite): string[] {
  return site.nativeLanguages.filter((tag) => !SHIPPED.has(tag));
}

export function countrySiteHref(site: CountrySite): string {
  return `/${site.continent}/${site.slug}`;
}

/**
 * What a country's footer calls itself before anyone has edited it —
 * "Apostolos Missions France" rather than head office's name.
 *
 * Every country gets this the moment its site exists, because a footer that
 * says "Apostolos Missions International, Trenton, New Jersey" on the French
 * site is not a neutral placeholder, it is wrong. The seed writes it into the
 * Tenant so it shows up in the admin as ordinary editable text, and the
 * country directory derives the same string, so a country reads correctly
 * whether or not the seed has run since it was added. Both call this, so the
 * two can't drift.
 *
 * Only the name is defaulted. Address and contact stay empty and fall back to
 * head office's, because a made-up street address or an invented
 * france@amintl.org that bounces is worse than an honest fallback.
 */
export function defaultOrgName(country: string): string {
  return `Apostolos Missions ${country}`;
}
