/**
 * Width of each country site's logo, in the 44-unit-tall box they are all
 * drawn in — so a logo's aspect ratio is this over 44.
 *
 * The files are public/logos/am-{slug}.svg: the AM mark with that country's
 * two-letter code set small at its top right, cap-aligned with the top of the
 * M, following the amlogo_kr.svg the design team supplied. The code is the
 * same one the country's address uses, so /kr is the site whose logo reads KR.
 *
 * The letterforms are AM's own. They were lifted out of the country wordmarks
 * these logos used to carry — the full country name in the brand's Avenir —
 * one clean sighting of each of the 26 capitals, so the codes are set in the
 * typeface the brand actually uses rather than a lookalike. Every letter the
 * 68 codes need was already drawn somewhere in those 68 names.
 *
 * The widths still vary a little because the letters do: II is narrower than
 * two round letters. They no longer vary much, because a two-letter code is a
 * two-letter code — where the names ranged from 71 to 173 units, the codes
 * run from 79 to 90.
 *
 * The international lockup is deliberately untouched and still comes from
 * components/ui/LogoMark: it carries the word INTERNATIONAL under the mark,
 * not a country code, and it is not one of these files.
 */
export const COUNTRY_LOGO_WIDTHS: Record<string, number> = {
  "angola": 88.805,                       // AO
  "argentina": 86.427,                    // AR
  "australia": 86.882,                    // AU
  "austria": 86.921,                      // AT
  "bangladesh": 85.471,                   // BD
  "belgium": 84.016,                      // BE
  "brazil": 84.3,                         // BR
  "cameroon": 88.096,                     // CM
  "canada": 87.732,                       // CA
  "chile": 84.888,                        // CL
  "colombia": 88.096,                     // CO
  "cote-divoire": 81.599,                 // CI
  "czechia": 85.981,                      // CZ
  "democratic-republic-of-the-congo": 86.89,// CD
  "dominican-republic": 87.962,           // DO
  "east-africa-federation": 80.181,       // BI
  "egypt": 85.584,                        // EG
  "ethiopia": 84.623,                     // ET
  "fiji": 82.773,                         // FJ
  "france": 83.825,                       // FR
  "germany": 85.3,                        // DE
  "ghana": 86.435,                        // GH
  "greece": 85.868,                       // GR
  "guatemala": 86.363,                    // GT
  "haiti": 85.473,                        // HT
  "honduras": 86.102,                     // HN
  "hungary": 85.435,                      // HU
  "india": 81.416,                        // IN
  "indonesia": 81.465,                    // ID
  "israel": 79.463,                       // IL
  "italy": 80.788,                        // IT
  "japan": 83.086,                        // JP
  "kazakhstan": 85.394,                   // KZ
  "madagascar": 88.246,                   // MG
  "malaysia": 88.094,                     // MY
  "mexico": 88.297,                       // MX
  "mongolia": 87.913,                     // MN
  "mozambique": 87.053,                   // MZ
  "myanmar": 89.168,                      // MM
  "nepal": 85.261,                        // NP
  "netherlands": 84.705,                  // NL
  "new-zealand": 85.798,                  // NZ
  "nigeria": 86.991,                      // NG
  "pakistan": 84.857,                     // PK
  "peru": 83.855,                         // PE
  "philippines": 84.705,                  // PH
  "poland": 83.308,                       // PL
  "portugal": 84.633,                     // PT
  "romania": 86.791,                      // RO
  "russia": 84.868,                       // RU
  "rwanda": 89.036,                       // RW
  "singapore": 85.553,                    // SG
  "slovakia": 84.816,                     // SK
  "south-africa": 86.69,                  // ZA
  "south-korea": 85.131,                  // KR
  "spain": 83.814,                        // ES
  "sri-lanka": 84.3,                      // LK
  "sweden": 83.814,                       // SE
  "switzerland": 86.285,                  // CH
  "taiwan": 89.53,                        // TW
  "thailand": 85.473,                     // TH
  "turkey": 84.907,                       // TR
  "ukraine": 86.882,                      // UA
  "united-arab-emirates": 86.143,         // AE
  "united-kingdom": 85.756,               // GB
  "united-states": 84.553,                // US
  "vietnam": 86.941,                      // VN
  "zambia": 87.053,                       // ZM
};

/** Every country logo is drawn in a box this tall. */
export const COUNTRY_LOGO_HEIGHT = 44;

/** Null for a country with no logo of its own, which keeps the AM International mark. */
export function countryLogo(slug: string): { src: string; width: number } | null {
  const width = COUNTRY_LOGO_WIDTHS[slug];
  if (width === undefined) return null;
  return { src: `/logos/am-${slug}.svg`, width };
}
