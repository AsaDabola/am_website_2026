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
 * True for `retreat-2.webp` and `retreat copy 3.webp`, false for
 * `retreat.webp`. Used only to break ties: when two files describe the same
 * article equally well, the one without a counter is the original, and the
 * numbered ones are the extra frames — so the plain name takes the cover.
 */
export function hasCounterSuffix(filename) {
  return /\b(?:copy|final|edit(?:ed)?|v)?\s*\d{1,3}\s*$/i.test(filename.replace(/\.[a-z0-9]+$/i, "").replace(/[_\-–—]+/g, " "));
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
    .replace(/\\ /g, " ")
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
  const unmatched = rows.filter(
    (r) => r.status === "unmatched" || r.status === "no-posts-that-month" || r.status === "no-date-folder",
  ).length;

  console.log("\nHere is what I found:\n");
  console.log(`  ${covers} photos will become the main picture of an article.`);
  if (extras) console.log(`  ${extras} extra photos of those same articles will be uploaded, ready to use.`);
  if (ambiguous) console.log(`  ${ambiguous} could be one of two articles, so I left them alone.`);
  if (unmatched) console.log(`  ${unmatched} did not match any article, so I left them alone.`);

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

  const toUpload = rows.filter((row) => row.status === "matched" && !state.uploaded[row.relative]);
  const alreadyDone = rows.filter((row) => row.status === "matched" && state.uploaded[row.relative]).length;
  if (alreadyDone) console.log(`\n  ${alreadyDone} were uploaded on an earlier run and will be skipped.`);

  if (!toUpload.length) {
    console.log("\nNothing left to upload.");
    return;
  }

  console.log("");
  if (!(await askYesNo(`Upload ${toUpload.length} photos to ${baseUrl} now?`))) {
    console.log("Stopped. Nothing was uploaded.");
    return;
  }

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
