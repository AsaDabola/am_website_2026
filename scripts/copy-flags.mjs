/**
 * Copies the flag SVGs the country sites need out of country-flag-icons and
 * into public/flags/, so the site serves them as ordinary static assets with
 * no runtime dependency on the package.
 *
 * The package is a devDependency and is only needed to run this. The SVGs it
 * produces are committed; re-run this after adding a country to
 * src/lib/countrySites.ts.
 *
 *   node scripts/copy-flags.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SOURCE = "node_modules/country-flag-icons/3x2";
const OUT = "public/flags";

// countrySites.ts is one object per line, which is what makes this safe to
// read with a regex rather than a TypeScript parser. If that ever stops being
// true the match count drops and the check at the bottom fails loudly.
const src = readFileSync("src/lib/countrySites.ts", "utf8");
const entries = [...src.matchAll(/slug: "([^"]+)"[\s\S]*?countryCodes: \[([^\]]*)\]/g)].map(
  (m) => ({
    slug: m[1],
    codes: [...m[2].matchAll(/"([A-Z]{2})"/g)].map((c) => c[1]),
  }),
);

// Mirrors flagCodeFor() in src/lib/countryFlags.ts — see the note there on why
// the East Africa Federation flies no flag.
const NO_FLAG = new Set(["east-africa-federation"]);
const codes = new Set(
  entries.filter((e) => !NO_FLAG.has(e.slug)).map((e) => e.codes[0]).filter(Boolean),
);

mkdirSync(OUT, { recursive: true });
for (const file of readdirSync(OUT)) rmSync(join(OUT, file));

const missing = [];
for (const code of [...codes].sort()) {
  try {
    writeFileSync(join(OUT, `${code}.svg`), readFileSync(join(SOURCE, `${code}.svg`)));
  } catch {
    missing.push(code);
  }
}

console.log(`country sites: ${entries.length}`);
console.log(`flags written: ${codes.size - missing.length}`);
if (missing.length) {
  console.error(`MISSING from ${SOURCE}: ${missing.join(", ")}`);
  process.exit(1);
}
if (entries.length < 60) {
  console.error(`Only ${entries.length} sites parsed — countrySites.ts format may have changed.`);
  process.exit(1);
}
