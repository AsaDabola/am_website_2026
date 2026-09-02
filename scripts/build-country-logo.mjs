/**
 * Draws a country site's logo: the AM mark with the country's two-letter code
 * set small at its top right.
 *
 *   node scripts/build-country-logo.mjs                # redraw all 68
 *   node scripts/build-country-logo.mjs --code NZ --slug new-zealand
 *
 * Exists so a country added later gets a logo without anyone opening
 * Illustrator. The letterforms are AM's own — lifted out of the country
 * wordmarks these logos used to carry, which spelled every capital between
 * them — so the codes are set in the brand's typeface rather than a lookalike.
 * They live in scripts/lib/am-letterforms.json.
 *
 * Everything is placed from measurements of the amlogo_kr.svg the design team
 * supplied:
 *
 *   the code's cap top is level with the top of the AM mark
 *   its cap height is 0.2231 of the mark's height
 *   the space either side of it is set so KR reproduces that file exactly
 *
 * all expressed in the 71.11 x 44 box the site already draws these in, so the
 * mark itself is untouched and stays exactly the size it is.
 *
 * After adding a country, put its width into COUNTRY_LOGO_WIDTHS in
 * src/lib/countryLogos.ts — this prints it.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const LOGOS = path.join(ROOT, "public", "logos");
const FONT = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "lib", "am-letterforms.json"), "utf8"));

/**
 * The AM mark, in the coordinates the site's logo box uses. These are the two
 * paths from components/ui/LogoMark, which is also what the international
 * lockup draws — so the mark is the same artwork on every site.
 */
const MARK = [
  "M3.2813 24.7734L14.3133 0H20.3101L34.6234 32.1193H15.7087L12.484 24.7734H23.1011L17.3494 11.8433L8.29754 32.1193H0",
  "M71.1139 32.1193H63.7215V17.5775L56.1029 32.1193H51.4827L43.864 17.5775V32.1193H36.4717V0H43.864L53.7834 19.7325L63.7215 0H71.1139V32.1193Z",
];
const MARK_RIGHT = 71.1139;
const MARK_TOP = 0;
const MARK_HEIGHT = 32.1193;
const BOX_HEIGHT = 44;

// Measured off amlogo_kr.svg: mark 171.40 tall, code cap 38.232, box 457.6
// wide with the mark ending at 382.80.
const CAP = (38.232 / 171.4) * MARK_HEIGHT;
const SCALE = CAP / FONT.flatCapHeight;
const INNER_GAP = FONT.medianLetterGap * SCALE;
const CODE_SHARE = (457.6 - 382.8) / 171.4;

function inkWidth(code) {
  return [...code].reduce((w, ch, i) => {
    const g = FONT.letters[ch];
    return w + (g.x1 - g.x0) * SCALE + (i ? INNER_GAP : 0);
  }, 0);
}

/**
 * The space either side of the code. The reference's box is drawn to the
 * font's advance width, which includes sidebearings these outlines carry no
 * record of; calibrating on KR is how they come back.
 */
const SIDE_GAP = (CODE_SHARE * MARK_HEIGHT - inkWidth("KR")) / 2;

export function buildLogo(code) {
  const letters = [...code.toUpperCase()];
  const unknown = letters.filter((ch) => !FONT.letters[ch]);
  if (unknown.length) throw new Error(`No letterform for ${unknown.join(", ")} in ${code}.`);

  const baseline = MARK_TOP + CAP;
  let x = MARK_RIGHT + SIDE_GAP;
  const drawn = letters.map((ch) => {
    const g = FONT.letters[ch];
    const dx = x - g.x0 * SCALE;
    // Sat on a shared baseline rather than aligned by ink, so C, G, O and S
    // keep the overshoot the typeface gave them.
    const dy = baseline - g.baseline * SCALE;
    x += (g.x1 - g.x0) * SCALE + INNER_GAP;
    return `<path transform="translate(${dx.toFixed(4)} ${dy.toFixed(4)}) scale(${SCALE.toFixed(6)})" d="${g.d}"/>`;
  });

  const width = x - INNER_GAP + SIDE_GAP;
  const body = MARK.map((d) => `<path d="${d}"/>`).join("") + drawn.join("");
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(2)} ${BOX_HEIGHT}" fill="#fff">${body}</svg>\n`,
    width: Number(width.toFixed(3)),
  };
}

/** slug -> code, read from the country table so the two cannot drift. */
function countries() {
  const source = fs.readFileSync(path.join(ROOT, "src", "lib", "countrySites.ts"), "utf8");
  const rows = [...source.matchAll(/slug:\s*"([a-z0-9-]+)"[^\n]*?countryCodes:\s*\[\s*"([A-Z]{2})"/g)];
  return rows.map(([, slug, code]) => ({ slug, code }));
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const args = process.argv.slice(2);
  const at = (name) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 ? args[i + 1] : null;
  };

  const one = at("code");
  const list = one ? [{ slug: at("slug") ?? one.toLowerCase(), code: one }] : countries();

  const widths = [];
  for (const { slug, code } of list) {
    const { svg, width } = buildLogo(code);
    fs.writeFileSync(path.join(LOGOS, `am-${slug}.svg`), svg);
    widths.push(`  "${slug}": ${width},`.padEnd(42) + `// ${code}`);
  }

  console.log(`${list.length} logo${list.length === 1 ? "" : "s"} written to public/logos.`);
  console.log("\nFor COUNTRY_LOGO_WIDTHS in src/lib/countryLogos.ts:\n");
  console.log(widths.join("\n"));
}
