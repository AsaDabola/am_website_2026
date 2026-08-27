/**
 * Attaches an archive of article photographs to the posts already in the CMS.
 *
 * The archive is laid out by date and named by article:
 *
 *   <root>/2019/07/summer-retreat-in-busan.webp
 *   <root>/2019/07/summer-retreat-in-busan-2.webp
 *   <root>/2019/08/a-new-chapter-opens.webp
 *
 * Every file is uploaded to the `media` collection, which puts it in Vercel
 * Blob and generates the thumbnail/card/hero sizes the site actually serves.
 * The best-matching file for each post becomes its `coverImage`; any further
 * files for the same post are uploaded too and listed in the manifest, because
 * `coverImage` holds one image and the rest belong in the article body, which
 * is a judgement call this script does not make for you.
 *
 * It talks to the REST API rather than booting Payload, for the reason
 * scripts/README.md gives: a custom script that imports the TypeScript config
 * under tsx dies in `loadEnv` before it reaches the database. Going over HTTP
 * also means the same command works against a local server or the deployed
 * one — whichever you point PAYLOAD_URL at is where the images land.
 *
 * To use it:
 *
 *   npm run import-images
 *
 * It asks where the photographs are and how to sign in, shows you what it
 * found, and waits for a yes before uploading anything.
 *
 * Safe to re-run. Uploads are recorded in import-state.json and skipped on the
 * next pass, and a post that already has a cover image is never overwritten
 * unless you pass --replace-covers.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const REPLACE_COVERS = flag("replace-covers");
const LIMIT = Number(value("limit", 0)) || Infinity;
const CONCURRENCY = Number(value("concurrency", 4));
const MANIFEST = value("manifest", "import-manifest.csv");
const STATE_FILE = value("state", "import-state.json");
/** Last run's answers, offered as defaults so a re-run is four Enters. */
const ANSWERS_FILE = value("answers", "import-answers.json");
/**
 * Written by scripts/map-images-from-site.mjs: slug to archive path, taken
 * from the old site's own pages. Where a file is named there it is used as
 * fact, and no filename is compared with any headline.
 */
const MAP_FILE = value("map", "image-map.json");
/** Articles left without a picture, written so the remainder is a list, not a number. */
const BARE_FILE = value("bare", "posts-without-picture.csv");

/**
 * Below this the filename and the title are not the same article. Set against
 * the blend in matchScore: 0.75 needs roughly four fifths of the filename's
 * words to appear in the headline.
 */
const ACCEPT_SCORE = 0.75;
/** And the runner-up has to be this far behind, or the choice is a guess. */
const ACCEPT_MARGIN = 0.1;
/**
 * Nudge for a post published in the year the file is filed under. Small on
 * purpose: it should separate two articles that read alike, never drag a file
 * onto an article it does not otherwise resemble.
 */
const YEAR_BONUS = 0.05;

const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"]);
const MIME = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// ---------------------------------------------------------------------------
// Pure helpers. These carry the matching decisions, so they are kept free of
// filesystem and network access and are unit-testable on their own.
// ---------------------------------------------------------------------------

/**
 * Pulls the year and month out of an archive-relative path. Accepts `2019/07`
 * and `2019/7`, and tolerates extra nesting above the year, so an archive that
 * sits under an `articles/` or `news/` folder still reads correctly.
 *
 * Returns null for a file that is not under a year/month pair — those are
 * reported rather than guessed at.
 */
export function parseArchivePath(relativePath) {
  const parts = relativePath.split(path.sep).filter(Boolean);
  const file = parts.pop();
  if (!file) return null;

  for (let i = parts.length - 2; i >= 0; i--) {
    const year = Number(parts[i]);
    const month = Number(parts[i + 1]);
    const yearLooksRight = Number.isInteger(year) && year >= 1990 && year <= 2100;
    const monthLooksRight = Number.isInteger(month) && month >= 1 && month <= 12;
    if (yearLooksRight && monthLooksRight) return { year, month, file };
  }
  return null;
}

/**
 * Reduces a filename or a headline to the words that identify the article.
 *
 * Trailing counters are dropped so `retreat-2.webp` and `retreat.webp` both
 * describe the same piece, and one- and two-letter tokens go with them: they
 * are the articles and prepositions that differ between a filename and the
 * headline it was cut from, and keeping them rewards length over substance.
 */
export function tokenise(input) {
  return input
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_\-–—]+/g, " ")
    .replace(/\b(?:copy|final|edit(?:ed)?|v)?\s*\d{1,3}\b\s*$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !UPLOAD_ARTEFACTS.has(token));
}

/**
 * Words a photo library adds to a filename that say nothing about the article.
 * `-scaled` is WordPress's, added to anything above its threshold, and it is
 * all over this archive: it costs a sixth of the coverage of a six-word name
 * and pushed real matches under the line.
 */
const UPLOAD_ARTEFACTS = new Set([
  "scaled", "resized", "cropped", "rotated", "thumb", "thumbnail",
  "copy", "final", "edited", "orig", "original", "duplicate",
]);

/**
 * True for `retreat-2.webp` and `retreat copy 3.webp`, false for
 * `retreat.webp`. Used only to break ties: when two files describe the same
 * article equally well, the one without a counter is the original, and the
 * numbered ones are the extra frames — so the plain name takes the cover.
 */
export function hasCounterSuffix(filename) {
  return /\b(?:copy|final|edit(?:ed)?|v)?\s*\d{1,3}\s*$/i.test(filename.replace(/\.[a-z0-9]+$/i, "").replace(/[_\-–—]+/g, " "));
}

/**
 * The common shape of a headline and of the slugs made from one, so the two
 * can be compared without caring which made which.
 *
 * The Notion export's first heading carries the publication date in front of
 * the title — "2019-10-16 Zambia Community Service…" — and that prefix is
 * dropped, along with the accents and dashes that differ between a title typed
 * by hand and a slug generated from it.
 */
export function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^\s*\d{4}-\d{2}-\d{2}\s+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sørensen–Dice over token sets: twice the shared tokens over the combined size. */
export function similarity(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  return (2 * shared) / (a.size + b.size);
}

/** How much of the filename the headline accounts for. */
export function coverage(fileTokens, titleTokens) {
  if (!fileTokens.length) return 0;
  const title = new Set(titleTokens);
  const file = new Set(fileTokens);
  let shared = 0;
  for (const token of file) if (title.has(token)) shared++;
  return shared / file.size;
}

/**
 * How well a filename describes a headline.
 *
 * Mostly coverage, because these filenames are abbreviations of headlines and
 * Dice alone punishes exactly that: `san-diego.webp` accounts for every word
 * of its own name, but against "UC San Diego '4 Spiritual Laws' Workshop" it
 * scores 0.57 purely because the headline is longer, and a first real run left
 * 609 files unmatched for that reason.
 *
 * Dice still contributes a tenth, which is what separates two headlines that
 * both contain the whole filename: `prayer.webp` covers "Atlanta Prayer
 * Retreat" and "Prayer Week" equally, and the shorter one is the better
 * reading. Where it cannot separate them the runner-up margin declares the
 * file ambiguous and leaves it alone, which is the behaviour wanted for a
 * filename as thin as one common word.
 */
export function matchScore(fileTokens, titleTokens) {
  return 0.9 * coverage(fileTokens, titleTokens) + 0.1 * similarity(fileTokens, titleTokens);
}

/**
 * Picks the post a file belongs to, from the posts published in that month.
 *
 * A match is only returned when it is both good enough on its own and clearly
 * ahead of the next candidate. Two articles in the same month with near-identical
 * headlines are exactly the case where an automatic choice is worth less than
 * a line in the manifest saying a human should look.
 */
export function chooseMatch(fileTokens, candidates, bonus = () => 0) {
  const scored = candidates
    .map((post) => ({ post, score: Math.min(1, matchScore(fileTokens, post.tokens) + bonus(post)) }))
    .sort((x, y) => y.score - x.score);

  const best = scored[0];
  if (!best || best.score < ACCEPT_SCORE) {
    return { status: "unmatched", best: best ?? null };
  }
  const runnerUp = scored[1];
  if (runnerUp && best.score - runnerUp.score < ACCEPT_MARGIN) {
    return { status: "ambiguous", best, runnerUp };
  }
  return { status: "matched", best };
}

/**
 * Marks the files that are the same picture in another format. The archive
 * holds Pentecost.webp beside Pentecost.jpg; uploading both would put two
 * copies of one photograph in the media library and make them compete for the
 * same article. WebP wins — it is what the site serves.
 */
export function withoutExtension(relativePath) {
  const normalised = relativePath.split(path.sep).join("/");
  return normalised.slice(0, normalised.length - path.extname(normalised).length);
}

export function pickBestFormats(relativePaths) {
  const PREFERENCE = [".webp", ".avif", ".png", ".jpg", ".jpeg", ".gif"];
  const rank = (p) => {
    const i = PREFERENCE.indexOf(path.extname(p).toLowerCase());
    return i === -1 ? PREFERENCE.length : i;
  };
  const best = new Map();
  for (const relative of relativePaths) {
    const key = relative.slice(0, relative.length - path.extname(relative).length);
    const held = best.get(key);
    if (!held || rank(relative) < rank(held)) best.set(key, relative);
  }
  const keep = new Set(best.values());
  return { keep, duplicates: relativePaths.filter((p) => !keep.has(p)) };
}

/** Everything under root that looks like an image, relative to root. */
export function walkImages(root, fsImpl = fs) {
  const found = [];
  const visit = (dir) => {
    for (const entry of fsImpl.readdirSync(dir, { withFileTypes: true })) {
      // Normalised because archives written on macOS store decomposed
      // filenames, and any non-ASCII title then fails to match a title typed
      // anywhere else.
      const full = path.join(dir, entry.name.normalize("NFC"));
      if (entry.isDirectory()) visit(full);
      else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) found.push(full);
    }
  };
  visit(root);
  return found.map((full) => path.relative(root, full)).sort();
}

// ---------------------------------------------------------------------------
// Asking, rather than being told. Every setting this needs is a question with
// a sensible default, so running it is one command and four answers.
// ---------------------------------------------------------------------------

/**
 * One readline interface for the whole run, not one per question. A fresh
 * interface buffers everything currently readable on stdin and throws it away
 * when it closes, so a second one has nothing left to read and the script
 * hangs on its own prompt.
 */
let rl = null;
let lines = null;
const prompts = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));
const closePrompts = () => {
  rl?.close();
  rl = null;
  lines = null;
};

/**
 * Lines are pulled one at a time through readline's async iterator rather than
 * through `question()`. `question()` drops input between calls — readline goes
 * on reading after a callback fires, so the next answer is emitted before the
 * next `question()` has registered a handler for it, and the script then waits
 * for a line that has already gone past.
 */
async function readLine() {
  lines ??= prompts()[Symbol.asyncIterator]();
  const { value, done } = await lines.next();
  return done ? "" : value;
}

/**
 * One question. `hidden` stops a password appearing on screen: the keystrokes
 * still reach readline, they are simply not echoed back.
 */
async function ask(question, { fallback = "", hidden = false } = {}) {
  const iface = prompts();
  process.stdout.write(fallback ? `${question} [${fallback}] ` : `${question} `);
  const echo = iface._writeToOutput;
  if (hidden) iface._writeToOutput = () => {};
  const answer = await readLine();
  if (hidden) {
    iface._writeToOutput = echo;
    process.stdout.write("\n");
  }
  return answer.trim() || fallback;
}

async function askYesNo(question) {
  const answer = (await ask(`${question} (yes/no)`)).toLowerCase();
  return answer === "y" || answer === "yes";
}

/**
 * Strips quotes and a trailing slash, so a path dragged into the terminal
 * works. A dragged path also arrives with spaces backslash-escaped.
 */
function cleanPath(input) {
  return input
    .trim()
    .replace(/^['"]|['"]$/g, "")
    // A path dragged from Finder escapes every awkward character, not just
    // spaces — `Private\ \&\ Shared` — so the backslashes come off generally.
    .replace(/\\(.)/g, "$1")
    .replace(/\/+$/, "");
}

/**
 * Dragging the zip rather than the folder is the obvious slip, and on a Mac
 * the folder it was expanded into is sitting right beside it under the same
 * name. When that is true, take it and say so, rather than sending someone
 * back to Finder for a path they have already given in all but four letters.
 */
export function resolveArchivePath(input, exists = (p) => fs.existsSync(p)) {
  if (!input.toLowerCase().endsWith(".zip")) return { path: input };
  const unzipped = input.slice(0, -4);
  return exists(unzipped) ? { path: unzipped, wasZip: true } : { path: input };
}

function csvCell(input) {
  const text = String(input ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// ---------------------------------------------------------------------------
// The API side.
// ---------------------------------------------------------------------------

async function login(baseUrl, email, password) {
  let res;
  try {
    res = await fetch(`${baseUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // The message Node gives here is "fetch failed", which tells nobody
    // anything. The two things that are actually wrong are worth naming.
    throw new Error(`I couldn't reach ${baseUrl}.\nCheck the address is right, and that the site is running.`);
  }
  if (res.status === 401) throw new Error("That email and password were not accepted.");
  if (res.status === 400) {
    throw new Error("The password came through empty. Type it at the prompt — it stays hidden — then press Enter.");
  }
  if (res.status >= 500) {
    // Signing in is the first thing that reads the users table, so it is also
    // the first thing a missing column breaks. scripts/add-admin-roles.sql
    // adds the ones the access rules introduced.
    throw new Error(
      [
        `The site returned an error signing in (${res.status}).`,
        "",
        "Check whether you can sign in at the site's /admin page in a browser.",
        "If that fails too, the deployed database is missing the newer Users columns —",
        "run scripts/add-admin-roles.sql against it. See scripts/README.md.",
      ].join("\n"),
    );
  }
  if (!res.ok) throw new Error(`Signing in failed (${res.status}): ${await res.text()}`);
  const { token } = await res.json();
  if (!token) throw new Error("Signing in returned no token.");
  return token;
}

async function fetchAllPosts(baseUrl, token) {
  const posts = [];
  for (let page = 1; ; page++) {
    const url = `${baseUrl}/api/posts?limit=200&page=${page}&depth=0`;
    const res = await fetch(url, { headers: { Authorization: `JWT ${token}` } });
    if (!res.ok) throw new Error(`Fetching posts failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    posts.push(...body.docs);
    if (!body.hasNextPage) break;
  }
  return posts;
}

async function uploadMedia(baseUrl, token, absolutePath, alt) {
  const buffer = fs.readFileSync(absolutePath);
  const extension = path.extname(absolutePath).toLowerCase();
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: MIME[extension] ?? "image/webp" }), path.basename(absolutePath));
  form.append("_payload", JSON.stringify({ alt }));

  const res = await fetch(`${baseUrl}/api/media`, {
    method: "POST",
    headers: { Authorization: `JWT ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed for ${absolutePath} (${res.status}): ${await res.text()}`);
  const { doc } = await res.json();
  return doc;
}

async function setCoverImage(baseUrl, token, postId, mediaId) {
  const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
    method: "PATCH",
    headers: { Authorization: `JWT ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ coverImage: mediaId }),
  });
  if (!res.ok) throw new Error(`Setting cover failed for post ${postId} (${res.status}): ${await res.text()}`);
}

/** Runs `worker` over `items`, at most `limit` at a time. */
async function inBatches(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(runners);
}

// ---------------------------------------------------------------------------

async function main() {
  console.log("\nThis attaches your article photographs to the articles already on the site.");
  console.log("Nothing is uploaded until you say yes.\n");

  // Last time's answers become this time's defaults, so a second run — and
  // after a stumble there is usually a second run — is just Enter, Enter,
  // Enter. The password is never among them.
  const saved = fs.existsSync(ANSWERS_FILE)
    ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8"))
    : {};

  let ROOT = cleanPath(value("root", "") || (await ask("Folder with the photographs:", { fallback: saved.root })));
  for (;;) {
    const resolved = resolveArchivePath(ROOT);
    if (resolved.wasZip) {
      console.log(`  (That's the zip — using the folder beside it: ${resolved.path})`);
      ROOT = resolved.path;
    }
    if (!ROOT) console.log("  Please give a folder.");
    else if (!fs.existsSync(ROOT)) console.log(`  Can't find that: ${ROOT}`);
    else if (!fs.statSync(ROOT).isDirectory()) {
      console.log(
        ROOT.toLowerCase().endsWith(".zip")
          ? "  That's the zip file, and I can't find an unzipped folder next to it. Unzip it, then give me the folder."
          : "  That's a file, not a folder.",
      );
    } else break;
    ROOT = cleanPath(await ask("Folder with the photographs:", { fallback: saved.root }));
  }

  // No localhost default on a first run. Pressing Enter through this question
  // used to quietly aim the whole import at a server that was not running,
  // and the failure then read as a problem with the site rather than with the
  // answer. After a successful run the last address is the default.
  let baseUrl = "";
  while (!baseUrl) {
    baseUrl = (await ask("Website address:", { fallback: saved.baseUrl })).replace(/\/$/, "");
    if (!baseUrl) console.log("  Please give the address of your site, e.g. https://your-site.vercel.app");
    else if (!/^https?:\/\//.test(baseUrl)) {
      console.log("  Please start it with http:// or https://");
      baseUrl = "";
    }
  }

  let email = "";
  while (!email) {
    email = await ask("Your admin email:", { fallback: saved.email });
    if (!email) console.log("  Please give the email you sign in to /admin with.");
  }

  let password = "";
  while (!password) {
    password = await ask("Your admin password:", { hidden: true });
    if (!password) console.log("  Nothing came through. Type it — it stays hidden — then press Enter.");
  }

  fs.writeFileSync(ANSWERS_FILE, JSON.stringify({ root: ROOT, baseUrl, email }, null, 2));

  const state = fs.existsSync(STATE_FILE)
    ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8"))
    : { uploaded: {} };
  const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log(`Signing in to ${baseUrl} …`);
  const token = await login(baseUrl, email, password);

  const posts = (await fetchAllPosts(baseUrl, token)).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    publishedDate: post.publishedDate,
    hasCover: Boolean(post.coverImage),
    tokens: tokenise(`${post.title} ${post.slug ?? ""}`),
  }));
  console.log(`${posts.length} posts in the CMS.`);

  const files = walkImages(ROOT).slice(0, LIMIT);
  console.log(`${files.length} image files under ${ROOT}.`);

  for (const post of posts) {
    post.year = post.publishedDate ? new Date(post.publishedDate).getUTCFullYear() : undefined;
  }

  // Decide everything before touching anything, so the dry run and the real
  // run make identical choices and the manifest is a true preview.
  const rows = [];
  const claimed = new Map(); // post id -> best row so far, which becomes the cover

  const { keep, duplicates } = pickBestFormats(files);
  for (const relative of duplicates) rows.push({ relative, status: "duplicate", score: 0 });

  /**
   * The old site's own answer, where we have it: archive path to post. It is
   * built from slugs, so it is exact — no filename is weighed against any
   * headline for a file that appears here. A generic name like am-1.webp can
   * only ever be placed this way.
   */
  const stated = new Map();
  if (fs.existsSync(MAP_FILE)) {
    const bySlug = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));

    // Three ways in, because a WordPress slug and the slug a post ended up
    // with in the CMS are not reliably the same string: an editor shortens
    // one, a migration derives the other from the headline. Requiring them to
    // be equal matched 1 article out of 466.
    const index = new Map();
    const add = (key, post) => {
      if (key && !index.has(key)) index.set(key, post);
    };
    for (const post of posts) {
      add(post.slug, post);
      add(slugify(post.slug ?? ""), post);
      add(slugify(post.title ?? ""), post);
    }

    let byExactSlug = 0;
    let byLooseSlug = 0;
    let byTitle = 0;
    const unresolved = [];

    for (const [slug, entry] of Object.entries(bySlug)) {
      if (!entry.file) continue;
      const exact = index.get(slug);
      const loose = exact ? null : index.get(slugify(slug));
      const titled = exact || loose ? null : index.get(slugify(entry.title ?? ""));
      const post = exact ?? loose ?? titled;
      if (post) {
        if (exact) byExactSlug++;
        else if (loose) byLooseSlug++;
        else byTitle++;
        // Keyed without its extension. The old site names the .jpg it served;
        // the archive's copy of the same picture is the .webp beside it, and
        // that is the one kept. Keying on the full name matched neither.
        stated.set(withoutExtension(entry.file), post);
      } else if (unresolved.length < 3) {
        unresolved.push({ slug, title: entry.title });
      }
    }

    console.log(
      `${stated.size} photographs named by the old site itself` +
        ` (${byExactSlug} by address, ${byLooseSlug + byTitle} by headline).`,
    );

    // When almost nothing lines up the two sides are shaped differently, and
    // the shapes are the only thing that says how.
    if (stated.size < Object.keys(bySlug).length / 4 && unresolved.length) {
      console.log("\n  Most articles on the old site did not match one here. For example:");
      for (const item of unresolved) {
        console.log(`    old site: ${item.slug}`);
        console.log(`       title: ${item.title ?? "(none)"}`);
      }
      console.log("  The first few here, for comparison:");
      for (const post of posts.slice(0, 3)) {
        console.log(`    this site: ${post.slug}`);
        console.log(`       title: ${post.title}`);
      }
      console.log("  Send those lines over and the matching can be adjusted to fit.\n");
    }
  }

  for (const relative of files) {
    if (!keep.has(relative)) continue;

    const namedFor = stated.get(withoutExtension(relative));
    if (namedFor) {
      const row = {
        relative,
        status: "matched",
        score: 1,
        postId: namedFor.id,
        postTitle: namedFor.title,
        stated: true,
        counter: false,
      };
      rows.push(row);
      const held = claimed.get(row.postId);
      // A stated file always outranks a guessed one for the cover.
      if (!held || !held.stated) {
        if (held) held.role = "extra";
        row.role = "cover";
        claimed.set(row.postId, row);
      } else {
        row.role = "extra";
      }
      continue;
    }

    // Every file is weighed against every post, with its folder date as a
    // nudge rather than a gate.
    //
    // Restricting candidates to the folder's own month is what made a first
    // real run match 9 files out of 1053: an article's publishedDate in the
    // CMS is not reliably the month its photographs were filed under, and a
    // date that is even a day out lands in the wrong bucket and takes every
    // candidate with it. The score threshold and the runner-up margin are
    // what keep a wrong match out, and they do that job on their own — real
    // filenames here score 1.00 against their headline.
    const parsed = parseArchivePath(relative);
    const { year, month, file } = parsed ?? { file: path.basename(relative) };
    const result = chooseMatch(tokenise(file), posts, (post) =>
      year && post.year === year ? YEAR_BONUS : 0,
    );
    const row = {
      relative,
      year,
      month,
      status: result.status,
      score: Number((result.best?.score ?? 0).toFixed(3)),
      postId: result.best?.post.id,
      postTitle: result.best?.post.title,
      runnerUp: result.runnerUp?.post.title,
    };
    rows.push(row);

    if (result.status !== "matched") continue;
    row.counter = hasCounterSuffix(file);

    // Best score wins the cover; on a tie the un-numbered file does, since a
    // trailing counter marks the second and third frames of the same article.
    const existing = claimed.get(row.postId);
    const beatsExisting =
      !existing ||
      row.score > existing.score ||
      (row.score === existing.score && existing.counter && !row.counter);

    if (beatsExisting) {
      if (existing) existing.role = "extra";
      row.role = "cover";
      claimed.set(row.postId, row);
    } else {
      row.role = "extra";
    }
  }

  // A post that already has a cover keeps it; its files still upload.
  for (const row of rows) {
    if (row.role !== "cover") continue;
    const post = posts.find((p) => p.id === row.postId);
    if (post?.hasCover && !REPLACE_COVERS) row.role = "extra (post already has a cover)";
  }

  // Said in plain words on screen. The CSV below is for anyone who wants to
  // check a specific file; nobody should have to open it to use this.
  const covers = rows.filter((r) => r.role === "cover").length;
  const extras = rows.filter((r) => r.role && r.role !== "cover").length;
  const ambiguous = rows.filter((r) => r.status === "ambiguous").length;
  const unmatched = rows.filter((r) => r.status === "unmatched").length;
  const duplicateCount = rows.filter((r) => r.status === "duplicate").length;

  console.log("\nHere is what I found:\n");
  console.log(`  ${covers} photos will become the main picture of an article.`);
  if (extras) console.log(`  ${extras} extra photos of those same articles will be uploaded, ready to use.`);
  if (duplicateCount) console.log(`  ${duplicateCount} are the same picture in another format, so I skipped them.`);
  if (ambiguous) console.log(`  ${ambiguous} could be one of two articles, so I left them alone.`);
  if (unmatched) console.log(`  ${unmatched} did not match any article, so I left them alone.`);

  // The closest near-misses, so a threshold that is set slightly too high is
  // visible as a list of obviously-right pairs rather than as a low number.
  const nearMisses = rows
    .filter((r) => r.status === "unmatched" && r.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  if (nearMisses.length) {
    console.log("\n  Closest ones I wasn't sure enough about:");
    for (const r of nearMisses) {
      console.log(`    ${r.relative}\n      → ${r.postTitle} (${Math.round(r.score * 100)}%)`);
    }
  }

  const header = "file,year,month,status,role,score,postId,postTitle,runnerUp\n";
  fs.writeFileSync(
    MANIFEST,
    header +
      rows
        .map((r) =>
          [r.relative, r.year, r.month, r.status, r.role ?? "", r.score, r.postId, r.postTitle, r.runnerUp]
            .map(csvCell)
            .join(","),
        )
        .join("\n") +
      "\n",
  );
  console.log(`\n  (A file-by-file list is in ${MANIFEST} if you want to check any of them.)`);

  // The other half of the question. The counts above are about photographs;
  // this is about articles, and an article with no picture is the thing
  // actually visible as a gap on the site.
  const gettingCover = new Set(rows.filter((r) => r.role === "cover").map((r) => r.postId));
  const stillBare = posts.filter((post) => !post.hasCover && !gettingCover.has(post.id));
  if (stillBare.length) {
    console.log(`\n  ${stillBare.length} articles will still have no picture. They are listed in ${BARE_FILE}.`);
    fs.writeFileSync(
      BARE_FILE,
      "title,slug,publishedDate\n" +
        stillBare
          .map((post) => [post.title, post.slug, post.publishedDate].map(csvCell).join(","))
          .join("\n") +
        "\n",
    );
    const recent = stillBare.filter((post) => (post.year ?? 0) >= 2026).length;
    if (recent) {
      console.log(`  ${recent} of them were published in 2026, after the old site's export — there is`);
      console.log("  no old page to ask about those, so they need a picture choosing by hand.");
    }
  }

  const toUpload = rows.filter((row) => row.status === "matched" && !state.uploaded[row.relative]);
  const alreadyDone = rows.filter((row) => row.status === "matched" && state.uploaded[row.relative]).length;
  if (alreadyDone) console.log(`\n  ${alreadyDone} were uploaded on an earlier run and will be skipped.`);

  /**
   * Covers whose photograph is already in the library.
   *
   * Setting the cover used to happen only as part of uploading, so a file
   * carried over from an earlier run was skipped along with its post's cover —
   * and every run that improved the matching promoted more files to cover
   * whose photograph had already gone up. Those articles stayed blank however
   * many times this was run.
   */
  const coversToSet = rows.filter((row) => {
    if (row.role !== "cover") return false;
    const uploaded = state.uploaded[row.relative];
    if (!uploaded?.mediaId) return false;
    const post = posts.find((entry) => entry.id === row.postId);
    return post && (!post.hasCover || REPLACE_COVERS);
  });
  if (coversToSet.length) {
    console.log(`  ${coversToSet.length} of those are the main picture of an article that has none yet.`);
  }

  if (!toUpload.length && !coversToSet.length) {
    console.log("\nNothing left to do.");
    return;
  }

  console.log("");
  const what = [
    toUpload.length ? `upload ${toUpload.length} photos` : "",
    coversToSet.length ? `set ${coversToSet.length} main pictures` : "",
  ]
    .filter(Boolean)
    .join(" and ");
  if (!(await askYesNo(`Go ahead and ${what} on ${baseUrl}?`))) {
    console.log("Stopped. Nothing was changed.");
    return;
  }

  let setFailed = 0;
  if (coversToSet.length) {
    console.log(`\nSetting ${coversToSet.length} main pictures …`);
    await inBatches(coversToSet, CONCURRENCY, async (row) => {
      try {
        await setCoverImage(baseUrl, token, row.postId, state.uploaded[row.relative].mediaId);
      } catch (error) {
        setFailed++;
        console.error(`  ! ${row.postTitle}: ${error.message}`);
      }
    });
    console.log(`Done. ${coversToSet.length - setFailed} articles given their picture.`);
  }

  if (!toUpload.length) return;

  console.log(`\nUploading — this will take a while. You can stop it at any time and run it again.`);

  let done = 0;
  let failed = 0;
  await inBatches(toUpload, CONCURRENCY, async (row) => {
    try {
      const doc = await uploadMedia(baseUrl, token, path.join(ROOT, row.relative), row.postTitle);
      state.uploaded[row.relative] = { mediaId: doc.id, url: doc.url };
      if (row.role === "cover") await setCoverImage(baseUrl, token, row.postId, doc.id);
      done++;
      if (done % 25 === 0) {
        saveState();
        console.log(`  ${done}/${toUpload.length}`);
      }
    } catch (error) {
      failed++;
      console.error(`  ! ${row.relative}: ${error.message}`);
    }
  });

  saveState();
  console.log(`\nDone. ${done} photos uploaded.`);
  if (failed) {
    console.log(`${failed} did not upload — run this again and it will retry just those.`);
  }
}

// Only run when invoked directly, so the pure helpers above can be imported
// by a test without the script trying to talk to a server.
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(closePrompts);
}
