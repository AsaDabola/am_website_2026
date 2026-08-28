/**
 * Works out which section each article belongs to, by reading the old site's
 * own section listings.
 *
 * The article pages do not say. Reading all 466 of them for a category link,
 * a body class or an Open Graph section found nothing on any of them — the
 * theme keeps none of the three. But the site still has a page per section,
 * and a section page is a list of exactly the articles in it, so the question
 * is answered from the other end and in a few dozen requests rather than 466.
 *
 *   npm run map-sections
 *
 * Writes the section onto each entry of image-map.json, which is where
 * import-articles reads it. Nothing is changed on either site — this reads.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const MAP_FILE = value("map", "image-map.json");
const SITE = (value("site", "https://amintl.org")).replace(/\/$/, "");
const MAX_PAGES = Number(value("max-pages", 40));

/**
 * The sections, and the URLs a WordPress site might serve each at. Tried in
 * order until one answers with article links; which one worked is reported, so
 * a site that names them differently shows up as a miss rather than as an
 * empty result.
 */
export const SECTIONS = [
  { category: "news", paths: ["/category/news", "/news"] },
  { category: "editorial", paths: ["/category/editorial", "/editorial"] },
  { category: "photo-news", paths: ["/category/photo-news", "/photo-news", "/category/photonews"] },
  { category: "testimony", paths: ["/category/testimony", "/testimony", "/category/testimonies"] },
];

/** Paths that are the site's own furniture rather than an article. */
const NOT_AN_ARTICLE =
  /^(category|tag|author|page|wp-|feed|about|contact|donate|news|editorial|photo-news|testimony|events|privacy|terms|search|home)$/i;

/** A host stripped to what identifies the site: no scheme, no www, no port. */
const bareHost = (value) =>
  value
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./, "")
    .toLowerCase();

/**
 * The article slugs a listing page links to.
 *
 * A section page links to each article once in the card and often again in a
 * "read more", so these are de-duplicated; and it links to the site's own
 * pages too, which are filtered by name rather than by guessing at markup.
 */
export function extractArticleSlugs(html, host = "amintl.org") {
  const site = bareHost(host);
  const found = new Set();
  // Every link on the page is read and then judged, rather than matched by a
  // shape: a theme writes the card's address in full on one page and from the
  // site root on the next, with or without www, and both are the same article.
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    let url;
    try {
      url = new URL(match[1].trim(), `https://${site}/`);
    } catch {
      continue;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    if (bareHost(url.host) !== site) continue;

    // An article sits at the site root, one segment deep. Anything longer is
    // a listing, a feed or an attachment.
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) continue;

    const slug = decodeURIComponent(parts[0]).toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{3,}$/.test(slug)) continue;
    if (NOT_AN_ARTICLE.test(slug)) continue;
    found.add(slug);
  }
  return [...found];
}

/** WordPress paginates a listing at /page/2/, /page/3/ and so on. */
export function pageUrl(base, page) {
  return page === 1 ? `${base}/` : `${base}/page/${page}/`;
}

async function fetchPolitely(url, attempt = 1) {
  const res = await fetch(url, { redirect: "follow" });
  if (res.status === 429 || res.status === 503) {
    if (attempt > 4) throw new Error(`HTTP ${res.status} after ${attempt} tries`);
    const stated = Number(res.headers.get("retry-after"));
    const wait = Number.isFinite(stated) && stated > 0 ? stated * 1000 : 2000 * 2 ** (attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return fetchPolitely(url, attempt + 1);
  }
  return res;
}

/** Walks one section's pages until a page adds nothing new or 404s. */
async function readSection(base, host) {
  const slugs = new Set();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchPolitely(pageUrl(base, page));
    if (!res.ok) break;
    const found = extractArticleSlugs(await res.text(), host);
    const before = slugs.size;
    for (const slug of found) slugs.add(slug);
    // A page that adds nothing is either the end or the same page served
    // again, which is what WordPress does past the last one.
    if (slugs.size === before) break;
  }
  return slugs;
}

let rl = null;
let lines = null;
const prompts = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));
async function ask(question, fallback = "") {
  prompts();
  process.stdout.write(fallback ? `${question} [${fallback}] ` : `${question} `);
  lines ??= prompts()[Symbol.asyncIterator]();
  const { value: answer, done } = await lines.next();
  return (done ? "" : answer).trim() || fallback;
}

async function main() {
  console.log("\nThis reads the old site's section pages to see which articles are in each.");
  console.log("It only reads — nothing is changed, on either site.\n");

  if (!fs.existsSync(MAP_FILE)) {
    throw new Error(`No ${MAP_FILE} here. Run npm run map-images first.`);
  }
  const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  console.log(`${Object.keys(map).length} articles in ${MAP_FILE}.`);

  const site = (await ask("Old site address:", SITE)).replace(/\/$/, "");
  const host = site.replace(/^https?:\/\//, "");
  console.log("");

  const assigned = {};
  const missed = [];
  for (const { category, paths } of SECTIONS) {
    let slugs = new Set();
    let usedPath = null;
    for (const candidate of paths) {
      slugs = await readSection(`${site}${candidate}`, host);
      if (slugs.size) {
        usedPath = candidate;
        break;
      }
    }

    if (!usedPath) {
      console.log(`  ${category.padEnd(12)} nothing found at ${paths.join(" or ")}`);
      missed.push(category);
      continue;
    }

    let matched = 0;
    for (const slug of slugs) {
      if (map[slug]) {
        map[slug].category = category;
        matched++;
      }
    }
    assigned[category] = matched;
    const noun = slugs.size === 1 ? "article" : "articles";
    console.log(`  ${category.padEnd(12)} ${String(slugs.size).padStart(4)} ${noun} at ${usedPath}, ${matched} of them known here`);
  }

  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));

  const unplaced = Object.values(map).filter((entry) => !entry.category).length;
  console.log(`\nWritten to ${MAP_FILE}.`);
  for (const [category, n] of Object.entries(assigned)) console.log(`  ${String(n).padStart(4)}  ${category}`);
  if (unplaced) console.log(`  ${String(unplaced).padStart(4)}  still in no section`);

  if (missed.length) {
    const which = missed.join(", ");
    console.log(`\nNo page answered for: ${which}.`);
    console.log("Open one of those on the old site and send me the address from the bar —");
    console.log("the pattern is all this needs.");
  }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
