/**
 * ISO 3166-1 alpha-2 handling for tenant geo detection.
 *
 * Tenant.countryCodes is a comma-separated text field ("DE,AT"), which means
 * the codes are only as trustworthy as whatever an editor typed. Everything
 * that reads or writes that field goes through here so the parsing rules are
 * in one place and a stray space or lowercase entry can't quietly stop a
 * country from resolving.
 */

/** Splits a stored countryCodes value into normalized, de-duplicated codes. */
export function parseCountryCodes(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const code = part.trim().toUpperCase();
    if (code) seen.add(code);
  }
  return [...seen];
}

/** Canonical stored form: uppercase, trimmed, de-duplicated, comma-separated. */
export function formatCountryCodes(codes: string[]): string {
  return codes.join(",");
}

export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

/**
 * Exact, token-wise membership test.
 *
 * The geo lookup used to ask the database for `countryCodes contains "XX"`,
 * which is a substring match: it happens to be right for today's data, but it
 * is right by luck rather than by rule, and a future three-letter or
 * lowercase entry would make one country silently answer for another. Codes
 * are compared as whole tokens instead.
 */
export function matchesCountryCode(raw: unknown, code: string): boolean {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return false;
  return parseCountryCodes(raw).includes(wanted);
}
