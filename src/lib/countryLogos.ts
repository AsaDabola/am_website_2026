/**
 * Width of each country site's logo, in the 44-unit-tall box they are all
 * drawn in — so a logo's aspect ratio is this over 44.
 *
 * The files are public/logos/am-{slug}.svg: the AM mark from LogoMark with
 * that country's wordmark under it, taken from the 68-file pack AM supplied
 * and mapped onto the mark at one scale for all of them — the mark is exactly
 * 380 units wide in every file of that pack and 71.11 in ours, so the word
 * lands at the size it was drawn against that mark.
 *
 * Only the word is taken from the pack. The AM mark in those files is an
 * autotrace — hundreds of curve segments for shapes the real mark draws in
 * straight lines — and it stair-steps along every diagonal when scaled past
 * its artboard size.
 *
 * The widths vary because the names do: Fiji is narrower than the mark and
 * Democratic Republic of the Congo is three times wider. A word narrower than
 * the mark still measures the mark's own 71.11.
 */
export const COUNTRY_LOGO_WIDTHS: Record<string, number> = {
  "angola": 71.11,
  "argentina": 71.11,
  "australia": 71.11,
  "austria": 71.11,
  "bangladesh": 71.11,
  "belgium": 71.11,
  "brazil": 71.11,
  "cameroon": 71.11,
  "canada": 71.11,
  "chile": 71.11,
  "colombia": 71.11,
  "cote-divoire": 71.11,
  "czechia": 71.11,
  "democratic-republic-of-the-congo": 173.325,
  "dominican-republic": 96.277,
  "east-africa-federation": 95.645,
  "egypt": 71.11,
  "ethiopia": 71.11,
  "fiji": 71.11,
  "france": 71.11,
  "germany": 71.11,
  "ghana": 71.11,
  "greece": 71.11,
  "guatemala": 71.11,
  "haiti": 71.11,
  "honduras": 71.11,
  "hungary": 71.11,
  "india": 71.11,
  "indonesia": 71.11,
  "israel": 71.11,
  "italy": 71.11,
  "japan": 71.11,
  "kazakhstan": 71.11,
  "madagascar": 71.11,
  "malaysia": 71.11,
  "mexico": 71.11,
  "mongolia": 71.11,
  "mozambique": 71.11,
  "myanmar": 71.11,
  "nepal": 71.11,
  "netherlands": 71.11,
  "new-zealand": 71.11,
  "nigeria": 71.11,
  "pakistan": 71.11,
  "peru": 71.11,
  "philippines": 71.11,
  "poland": 71.11,
  "portugal": 71.11,
  "romania": 71.11,
  "russia": 71.11,
  "rwanda": 71.11,
  "singapore": 71.11,
  "slovakia": 71.11,
  "south-africa": 71.11,
  "south-korea": 71.11,
  "spain": 71.11,
  "sri-lanka": 71.11,
  "sweden": 71.11,
  "switzerland": 71.11,
  "taiwan": 71.11,
  "thailand": 71.11,
  "turkey": 71.11,
  "ukraine": 71.11,
  "united-arab-emirates": 102.64,
  "united-kingdom": 78.41,
  "united-states": 71.11,
  "vietnam": 71.11,
  "zambia": 71.11,
};

/** Every country logo is drawn in a box this tall. */
export const COUNTRY_LOGO_HEIGHT = 44;

/** Null for a country with no logo of its own, which keeps the AM International mark. */
export function countryLogo(slug: string): { src: string; width: number } | null {
  const width = COUNTRY_LOGO_WIDTHS[slug];
  if (width === undefined) return null;
  return { src: `/logos/am-${slug}.svg`, width };
}
