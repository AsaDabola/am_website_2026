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
  "angola": 90.811,                       // AO
  "argentina": 88.433,                    // AR
  "australia": 88.888,                    // AU
  "austria": 88.927,                      // AT
  "bangladesh": 87.478,                   // BD
  "belgium": 86.022,                      // BE
  "brazil": 86.306,                       // BR
  "cameroon": 90.102,                     // CM
  "canada": 89.739,                       // CA
  "chile": 86.894,                        // CL
  "colombia": 90.102,                     // CO
  "cote-divoire": 83.605,                 // CI
  "czechia": 87.987,                      // CZ
  "democratic-republic-of-the-congo": 88.896,// CD
  "dominican-republic": 89.968,           // DO
  "east-africa-federation": 82.187,       // BI
  "egypt": 87.59,                         // EG
  "ethiopia": 86.629,                     // ET
  "fiji": 84.779,                         // FJ
  "france": 85.831,                       // FR
  "germany": 87.306,                      // DE
  "ghana": 88.441,                        // GH
  "greece": 87.874,                       // GR
  "guatemala": 88.369,                    // GT
  "haiti": 87.479,                        // HT
  "honduras": 88.108,                     // HN
  "hungary": 87.441,                      // HU
  "india": 83.422,                        // IN
  "indonesia": 83.471,                    // ID
  "israel": 81.469,                       // IL
  "italy": 82.794,                        // IT
  "japan": 85.092,                        // JP
  "kazakhstan": 87.4,                     // KZ
  "madagascar": 90.252,                   // MG
  "malaysia": 90.1,                       // MY
  "mexico": 90.303,                       // MX
  "mongolia": 89.919,                     // MN
  "mozambique": 89.059,                   // MZ
  "myanmar": 91.175,                      // MM
  "nepal": 87.267,                        // NP
  "netherlands": 86.711,                  // NL
  "new-zealand": 87.804,                  // NZ
  "nigeria": 88.997,                      // NG
  "pakistan": 86.863,                     // PK
  "peru": 85.861,                         // PE
  "philippines": 86.711,                  // PH
  "poland": 85.314,                       // PL
  "portugal": 86.639,                     // PT
  "romania": 88.797,                      // RO
  "russia": 86.874,                       // RU
  "rwanda": 91.042,                       // RW
  "singapore": 87.559,                    // SG
  "slovakia": 86.822,                     // SK
  "south-africa": 88.696,                 // ZA
  "south-korea": 87.137,                  // KR
  "spain": 85.82,                         // ES
  "sri-lanka": 86.306,                    // LK
  "sweden": 85.82,                        // SE
  "switzerland": 88.291,                  // CH
  "taiwan": 91.536,                       // TW
  "thailand": 87.479,                     // TH
  "turkey": 86.913,                       // TR
  "ukraine": 88.888,                      // UA
  "united-arab-emirates": 88.149,         // AE
  "united-kingdom": 87.762,               // GB
  "united-states": 86.559,                // US
  "vietnam": 88.947,                      // VN
  "zambia": 89.059,                       // ZM
};

/** Every country logo is drawn in a box this tall. */
export const COUNTRY_LOGO_HEIGHT = 44;

/** Null for a country with no logo of its own, which keeps the AM International mark. */
export function countryLogo(slug: string): { src: string; width: number } | null {
  const width = COUNTRY_LOGO_WIDTHS[slug];
  if (width === undefined) return null;
  return { src: `/logos/am-${slug}.svg`, width };
}
