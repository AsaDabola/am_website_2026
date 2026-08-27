/**
 * Builds an exact article-to-photograph mapping by asking the old site.
 *
 * Matching a filename against a headline can only ever be a guess, and half
 * this archive cannot be guessed at all: a folder holding am-1.webp, am-2.webp
 * and am.webp says nothing about which article any of them belongs to.
 *
 * The old WordPress site knows, though. Every article in the Notion export
 * carries the URL it lived at, and that page names its own featured image —
 * so the answer is a fetch away rather than an inference. The image URL is a
 * WordPress upload path,
 *
 *   https://amintl.org/wp-content/uploads/2019/10/zambia-service.jpg
 *
 * and the archive is that same folder tree, so the tail of the URL is already
 * the path within it.
 *
 *   npm run map-images
 *
 * Writes image-map.json — slug to archive path — which import-article-images
 * then prefers over any name matching. Run once; re-runs skip what they have.
 *
 * This has to run somewhere that can reach amintl.org, which is why it is a
 * script for you to run rather than something already done in the repository.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const OUT = value("out", "image-map.json");
const CONCURRENCY = Number(value("concurrency", 5));
const LIMIT = Number(value("limit", 0)) || Infinity;
/** Re-read pages already in the map, rather than skipping them. */
const REFRESH = args.includes("--refresh");

/**
 * The article's own photograph.
 *
 * Deliberately not og:image first. This site sets one social-share graphic —
 * Web-innerpage_800px — as og:image on every page, so reading that named the
 * same file for all 466 articles and the whole map collapsed to one entry.
 *
 * WordPress marks the featured image with the wp-post-image class, so that is
 * asked for by name, then Elementor's featured-image widget, then the first
 * upload in the page that is not obviously site furniture. og:image is left as
 * a last resort and flagged, because on this site it usually means nothing was
 * found.
 */
export function extractImageUrl(html) {
  const attempts = [
    ["wp-post-image", /<img[^>]+class=["'][^"']*wp-post-image[^"']*["'][^>]*>/i],
    ["elementor-featured", /elementor-widget-theme-post-featured-image[\s\S]{0,400}?<img[^>]*>/i],
  ];
  for (const [source, pattern] of attempts) {
    const tag = pattern.exec(html)?.[0];
    const src = tag && pickSrc(tag);
    if (src) return { url: src, source };
  }

  for (const match of html.matchAll(/<img[^>]+>/gi)) {
    const src = pickSrc(match[0]);
    if (src && /\/wp-content\/uploads\//.test(src) && !isSiteFurniture(src)) {
      return { url: src, source: "body-image" };
    }
  }

  const og =
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html) ??
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i.exec(html);
  return og ? { url: og[1], source: "og:image" } : null;
}

/** The real source of an img tag, preferring data-src, which lazy loaders use. */
function pickSrc(tag) {
  const attr = (name) => new RegExp(`${name}=["']([^"']+)["']`, "i").exec(tag)?.[1];
  const src = attr("data-src") || attr("src");
  if (src && /^data:/.test(src)) return attr("data-large_file") || attr("data-lazy-src") || null;
  return src ?? null;
}

/** Logos, share graphics and spacers, which belong to the site and not to any article. */
function isSiteFurniture(url) {
  return /logo|placeholder|spacer|avatar|favicon|innerpage|default|share|thumb-default/i.test(url);
}

/**
 * Turns an upload URL into a path inside the archive.
 *
 * WordPress also serves resized copies as `name-1024x683.jpg`; the archive
 * holds the original, so the dimensions are stripped. Anything not under
 * wp-content/uploads is not from this library and is refused rather than
 * guessed at.
 */
export function archivePathFromUrl(url) {
  const match = /\/wp-content\/uploads\/(\d{4}\/\d{2}\/[^?#]+)/.exec(url);
  if (!match) return null;
  return decodeURIComponent(match[1]).replace(/-\d{2,5}x\d{2,5}(?=\.[a-z0-9]+$)/i, "");
}

/** Pulls the slug, title and date out of one exported Notion page. */
export function readExportedArticle(markdown) {
  const url = /^\*\*URL:\*\*\s*\[([^\]]+)\]/m.exec(markdown)?.[1];
  const published = /^\*\*Published:\*\*\s*(\S+)/m.exec(markdown)?.[1];
  const title = /^#\s+(.+)$/m.exec(markdown)?.[1]?.trim();
  if (!url) return null;
  const slug = /amintl\.org\/([^/?#]+)/.exec(url)?.[1];
  return slug ? { slug, url, title, published } : null;
}

async function inBatches(items, limit, worker) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) await worker(queue.shift());
    }),
  );
}

let rl = null;
let lines = null;
const prompts = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));
async function ask(question, fallback = "") {
  prompts();
  process.stdout.write(fallback ? `${question} [${fallback}] ` : `${question} `);
  lines ??= prompts()[Symbol.asyncIterator]();
  const { value: answer, done } = await lines.next();
  return cleanPath(done ? "" : answer) || fallback;
}

/**
 * A path dragged from Finder arrives with every awkward character escaped —
 * `Private\ \&\ Shared` — so the backslashes come off generally rather than
 * for spaces alone. This folder really is called "Private & Shared".
 */
export function cleanPath(input) {
  return input
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\(.)/g, "$1")
    .replace(/\/+$/, "");
}

async function main() {
  console.log("\nThis reads each article on the old site to find which photograph belongs to it.");
  console.log("It only reads — nothing is changed, on either site.\n");

  let exportDir = value("export", "") || (await ask("Folder of the unzipped Notion export:"));
  for (;;) {
    if (!exportDir) console.log("  Please give a folder.");
    else if (!fs.existsSync(exportDir)) console.log(`  Can't find that: ${exportDir}`);
    else if (!fs.statSync(exportDir).isDirectory()) {
      // Handing back the zip is the easy slip here, and a bare ENOTDIR names
      // nothing that helps.
      console.log(
        exportDir.toLowerCase().endsWith(".zip")
          ? "  That's the zip. Unzip it (twice — Notion nests one inside) and give me the\n  folder it makes, the one holding the .md files."
          : "  That's a file, not a folder.",
      );
    } else break;
    exportDir = await ask("Folder of the unzipped Notion export:");
  }

  // The export nests the pages a couple of folders down, so the whole tree is
  // walked rather than asking anyone to find the exact one.
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) files.push(full);
    }
  };
  walk(exportDir);

  // Notion wraps its export in two zips — the outer one holds an
  // ExportBlock-….zip, and the pages are inside that. Unzipping once leaves a
  // folder with a zip in it and no pages, which otherwise reads as an empty
  // export rather than as a job half done.
  if (!files.length) {
    const nested = [];
    const findZips = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) findZips(full);
        else if (entry.name.toLowerCase().endsWith(".zip")) nested.push(full);
      }
    };
    findZips(exportDir);
    if (nested.length) {
      throw new Error(
        [
          "That folder has no articles in it, but it does have a zip inside:",
          `  ${nested[0]}`,
          "",
          "Notion puts a second zip inside the first. Unzip that one too, then",
          "give me the folder it makes.",
        ].join("\n"),
      );
    }
    throw new Error(`No .md articles found under ${exportDir}.`);
  }

  console.log(`${files.length} exported articles found.`);

  const articles = files
    .map((file) => readExportedArticle(fs.readFileSync(file, "utf8")))
    .filter(Boolean)
    .slice(0, LIMIT);
  console.log(`${articles.length} of them carry their original address.\n`);

  const map = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const todo = REFRESH ? articles : articles.filter((a) => !map[a.slug]);
  if (todo.length < articles.length) {
    console.log(`${articles.length - todo.length} were read on an earlier run and will be skipped.`);
  }
  if (!todo.length) {
    console.log("Nothing left to read.");
    return;
  }

  console.log(`Reading ${todo.length} pages …`);
  let done = 0;
  let failed = 0;

  await inBatches(todo, CONCURRENCY, async (article) => {
    try {
      const res = await fetch(article.url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const found = extractImageUrl(await res.text());
      const archivePath = found ? archivePathFromUrl(found.url) : null;
      map[article.slug] = {
        title: article.title,
        published: article.published,
        imageUrl: found?.url ?? null,
        source: found?.source ?? null,
        file: archivePath,
      };
    } catch (error) {
      failed++;
      if (failed <= 5) console.error(`  ! ${article.slug}: ${error.message}`);
    }
    done++;
    if (done % 25 === 0) {
      fs.writeFileSync(OUT, JSON.stringify(map, null, 2));
      console.log(`  ${done}/${todo.length}`);
    }
  });

  fs.writeFileSync(OUT, JSON.stringify(map, null, 2));
  const named = Object.values(map).filter((entry) => entry.file);
  console.log(`\nDone. ${named.length} articles have a photograph named.`);

  const bySource = {};
  for (const entry of named) bySource[entry.source ?? "?"] = (bySource[entry.source ?? "?"] ?? 0) + 1;
  for (const [source, n] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n} from ${source}`);
  }

  // One file answering for hundreds of articles means a site-wide graphic was
  // read rather than each article's own photograph — which is what happened
  // when og:image was trusted first.
  const counts = {};
  for (const entry of named) counts[entry.file] = (counts[entry.file] ?? 0) + 1;
  const [worstFile, worstCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];
  if (worstCount > 5 && worstCount > named.length / 4) {
    console.log(`\n  Careful: ${worstCount} articles all name the same file, ${worstFile}.`);
    console.log("  That is a site-wide graphic, not their own photographs. Send this over.");
  }
  console.log(`  ${new Set(named.map((e) => e.file)).size} different photographs in all.`);
  if (failed) console.log(`${failed} pages could not be read — run this again to retry them.`);
  console.log(`Written to ${OUT}. Now run:  npm run import-images`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
