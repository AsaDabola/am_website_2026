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
 * Dry run first. It writes the manifest and changes nothing:
 *
 *   PAYLOAD_URL=http://localhost:3000 \
 *   PAYLOAD_EMAIL=you@example.org PAYLOAD_PASSWORD='…' \
 *   node scripts/import-article-images.mjs --root /path/to/archive
 *
 * Read import-manifest.csv, then run it for real by adding --apply.
 *
 * Safe to re-run. Uploads are recorded in import-state.json and skipped on the
 * next pass, and a post that already has a cover image is never overwritten
 * unless you pass --replace-covers.
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const ROOT = value("root");
const APPLY = flag("apply");
const REPLACE_COVERS = flag("replace-covers");
const LIMIT = Number(value("limit", 0)) || Infinity;
const CONCURRENCY = Number(value("concurrency", 4));
const MANIFEST = value("manifest", "import-manifest.csv");
const STATE_FILE = value("state", "import-state.json");

/** Below this the filename and the title are not the same article. */
const ACCEPT_SCORE = 0.6;
/** And the runner-up has to be this far behind, or the choice is a guess. */
const ACCEPT_MARGIN = 0.1;

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
    .filter((token) => token.length > 2);
}

/**
 * Sørensen–Dice over token sets: twice the shared tokens over the combined
 * size. Chosen over a raw overlap count because a filename that is a short
 * fragment of a long headline should not score the same as one that is the
 * whole headline.
 */
export function similarity(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  return (2 * shared) / (a.size + b.size);
}

/**
 * Picks the post a file belongs to, from the posts published in that month.
 *
 * A match is only returned when it is both good enough on its own and clearly
 * ahead of the next candidate. Two articles in the same month with near-identical
 * headlines are exactly the case where an automatic choice is worth less than
 * a line in the manifest saying a human should look.
 */
export function chooseMatch(fileTokens, candidates) {
  const scored = candidates
    .map((post) => ({ post, score: similarity(fileTokens, post.tokens) }))
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

function csvCell(input) {
  const text = String(input ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// ---------------------------------------------------------------------------
// The API side.
// ---------------------------------------------------------------------------

async function login(baseUrl, email, password) {
  const res = await fetch(`${baseUrl}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status}): ${await res.text()}`);
  const { token } = await res.json();
  if (!token) throw new Error("Login returned no token.");
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
  if (!ROOT) throw new Error("Pass --root <folder> pointing at the archive.");
  if (!fs.existsSync(ROOT)) throw new Error(`No such folder: ${ROOT}`);

  const baseUrl = (process.env.PAYLOAD_URL || "http://localhost:3000").replace(/\/$/, "");
  const email = process.env.PAYLOAD_EMAIL;
  const password = process.env.PAYLOAD_PASSWORD;
  if (!email || !password) throw new Error("Set PAYLOAD_EMAIL and PAYLOAD_PASSWORD.");

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

  // Index posts by the month they were published, so a filename is only ever
  // compared against the handful of articles it could plausibly be.
  const byMonth = new Map();
  for (const post of posts) {
    if (!post.publishedDate) continue;
    const date = new Date(post.publishedDate);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(post);
  }

  // Decide everything before touching anything, so the dry run and the real
  // run make identical choices and the manifest is a true preview.
  const rows = [];
  const claimed = new Map(); // post id -> best row so far, which becomes the cover

  for (const relative of files) {
    const parsed = parseArchivePath(relative);
    if (!parsed) {
      rows.push({ relative, status: "no-date-folder", score: 0 });
      continue;
    }
    const { year, month, file } = parsed;
    const candidates = byMonth.get(`${year}-${month}`) ?? [];
    if (!candidates.length) {
      rows.push({ relative, year, month, status: "no-posts-that-month", score: 0 });
      continue;
    }

    const result = chooseMatch(tokenise(file), candidates);
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
    const existing = claimed.get(row.postId);
    if (!existing || row.score > existing.score) {
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

  const counts = rows.reduce((acc, row) => {
    const key = row.role === "cover" ? "cover" : row.status;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nDecisions:");
  for (const [key, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(6)}  ${key}`);
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
  console.log(`\nManifest written to ${MANIFEST}`);

  if (!APPLY) {
    console.log("Dry run — nothing uploaded. Re-run with --apply once the manifest looks right.");
    return;
  }

  const toUpload = rows.filter((row) => row.status === "matched" && !state.uploaded[row.relative]);
  console.log(`\nUploading ${toUpload.length} files (${CONCURRENCY} at a time) …`);

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
  console.log(`\nUploaded ${done}, failed ${failed}. State in ${STATE_FILE} — re-run to retry failures.`);
}

// Only run when invoked directly, so the pure helpers above can be imported
// by a test without the script trying to talk to a server.
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
