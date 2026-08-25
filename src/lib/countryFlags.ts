/**
 * Which flag stands for a country site.
 *
 * Almost always the first of its `countryCodes` — that is the country the
 * site is named for, and any codes after it are neighbours the site also
 * answers for in geo detection (Colombia carries Ecuador and Panama).
 *
 * The East Africa Federation is the exception, and the reason this is a
 * function rather than `countryCodes[0]` inline. It is a federation of six
 * countries, and the four with sites of their own — Kenya, Tanzania, Uganda,
 * Rwanda — keep their codes, so what is left on the federation is Burundi and
 * South Sudan. Flying Burundi's flag over "East Africa Federation" would name
 * the wrong country, so it flies none.
 */
const NO_FLAG = new Set(["east-africa-federation"]);

export function flagCodeFor(site: {
  slug: string;
  countryCodes: readonly string[];
}): string | null {
  if (NO_FLAG.has(site.slug)) return null;
  return site.countryCodes[0] ?? null;
}

/** Public path of a flag SVG, as copied by scripts/copy-flags.mjs. */
export function flagSrc(code: string): string {
  return `/flags/${code.toUpperCase()}.svg`;
}
