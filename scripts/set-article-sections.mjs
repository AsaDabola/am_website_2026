/**
 * Files each article on the site under the section it was in on the old one.
 *
 * News, Editorial, Photo News and Testimony are tabs over one collection: a
 * post carries a `category`, and each tab lists the posts holding its own.
 * The articles were migrated without it, so every tab but News reads empty
 * even though its articles are all there.
 *
 * map-sections works out which section each article belongs to by reading the
 * old site's own listings. This takes that answer and writes it onto the
 * matching post.
 *
 *   npm run set-sections
 *
 * Nothing is written until you say yes: it counts what it would do first, in
 * full, including anything that would change rather than be filled in.
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
const ANSWERS_FILE = value("answers", "import-answers.json");
/** Limits the run to one section, for filling a single empty tab. */
const ONLY = value("only", null);

const SECTIONS = new Set(["news", "editorial", "photo-news", "testimony"]);

/**
 * Two titles are the same article when they read the same — the old site and
 * the CMS disagree about curly quotes, ampersands and trailing whitespace, and
 * none of that is a different article.
 */
export function normalizeTitle(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Pairs each placed article with the post that is the same article.
 *
 * The slug is the reliable half — it came across with the migration — so it is
 * tried first, and the title only for what is left, and only on an exact read.
 * A near-match here would file a real article under the wrong tab, which is
 * worse than leaving it where it is.
 */
export function pairUp(entries, posts) {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const byTitle = new Map();
  for (const post of posts) {
    const key = normalizeTitle(post.title);
    // A title shared by two posts identifies neither.
    byTitle.set(key, byTitle.has(key) ? null : post);
  }

  const paired = [];
  const missing = [];
  for (const entry of entries) {
    const post = bySlug.get(entry.slug) ?? byTitle.get(normalizeTitle(entry.title)) ?? null;
    if (post) paired.push({ entry, post });
    else missing.push(entry);
  }
  return { paired, missing };
}

/** Splits the pairs into what this run would do to each. */
export function planChanges(paired) {
  const toFile = [];
  const toMove = [];
  const alreadyRight = [];

  for (const pair of paired) {
    const wanted = pair.entry.category;
    const current = pair.post.category || null;
    if (current === wanted) alreadyRight.push(pair);
    else if (!current) toFile.push(pair);
    else toMove.push(pair);
  }
  return { toFile, toMove, alreadyRight };
}

function tally(pairs) {
  const counts = new Map();
  for (const pair of pairs) {
    counts.set(pair.entry.category, (counts.get(pair.entry.category) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

let rl = null;
let lines = null;
const prompts = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));
async function readLine() {
  lines ??= prompts()[Symbol.asyncIterator]();
  const { value: answer, done } = await lines.next();
  return done ? "" : answer;
}

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

async function signIn(baseUrl, email, password) {
  let res;
  try {
    res = await fetch(`${baseUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(`I couldn't reach ${baseUrl}.\nCheck the address is right, and that the site is running.`);
  }
  if (res.status === 401) throw new Error("That email and password were not accepted.");
  if (!res.ok) throw new Error(`Signing in failed (${res.status}): ${await res.text()}`);
  const { token } = await res.json();
  if (!token) throw new Error("Signing in returned no token.");
  return token;
}

async function fetchAllPosts(baseUrl, token) {
  const posts = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${baseUrl}/api/posts?limit=200&page=${page}&depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    });
    if (!res.ok) throw new Error(`Fetching posts failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    posts.push(...body.docs);
    if (!body.hasNextPage) break;
  }
  return posts;
}

async function setCategory(baseUrl, token, postId, category) {
  const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
    method: "PATCH",
    headers: { Authorization: `JWT ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) throw new Error(`Filing post ${postId} failed (${res.status}): ${await res.text()}`);
}

async function main() {
  console.log("\nThis files the articles already on the site under News, Editorial,");
  console.log("Photo News or Testimony. Nothing is written until you say yes.\n");

  if (!fs.existsSync(MAP_FILE)) {
    throw new Error(`No ${MAP_FILE} here. Run npm run map-images, then npm run map-sections.`);
  }
  const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));

  const entries = Object.entries(map)
    .map(([slug, entry]) => ({ slug, title: entry.title, category: entry.category }))
    .filter((entry) => SECTIONS.has(entry.category))
    .filter((entry) => !ONLY || entry.category === ONLY);

  if (entries.length === 0) {
    throw new Error(
      ONLY
        ? `No articles in ${MAP_FILE} are in the ${ONLY} section. Run npm run map-sections first.`
        : `No articles in ${MAP_FILE} have a section yet. Run npm run map-sections first.`,
    );
  }

  const saved = fs.existsSync(ANSWERS_FILE) ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8")) : {};
  const baseUrl = (
    await ask("Website address:", { fallback: saved.baseUrl || "https://amintl.org" })
  ).replace(/\/$/, "");
  const email = await ask("Your admin email:", { fallback: saved.email || "" });
  const password = await ask("Your admin password:", { hidden: true });
  if (!email || !password) throw new Error("I need the admin email and password to write anything.");

  console.log(`\nSigning in to ${baseUrl} …`);
  const token = await signIn(baseUrl, email, password);
  const posts = await fetchAllPosts(baseUrl, token);
  console.log(`${posts.length} posts on the site.`);
  console.log(`${entries.length} articles have a section from the old site.\n`);

  const { paired, missing } = pairUp(entries, posts);
  const { toFile, toMove, alreadyRight } = planChanges(paired);

  console.log("Here is what I found:\n");
  const were = (n) => (n === 1 ? "is" : "are");
  if (toFile.length) {
    const noun = toFile.length === 1 ? "post" : "posts";
    console.log(`  ${toFile.length} ${noun} would be filed for the first time:`);
    for (const [section, n] of tally(toFile)) {
      console.log(`      ${String(n).padStart(4)}  ${section}`);
    }
  }
  if (alreadyRight.length) {
    console.log(`  ${alreadyRight.length} ${were(alreadyRight.length)} already filed that way, so nothing to do.`);
  }
  if (toMove.length) {
    console.log(`  ${toMove.length} ${were(toMove.length)} filed somewhere else today and would move:`);
    for (const { entry, post } of toMove.slice(0, 10)) {
      console.log(`      ${post.category} → ${entry.category}: ${entry.title ?? entry.slug}`);
    }
    if (toMove.length > 10) console.log(`      … and ${toMove.length - 10} more.`);
  }
  if (missing.length) {
    console.log(`  ${missing.length} ${were(missing.length)} on the old site but not on this one, so they are left alone.`);
  }

  const changes = [...toFile, ...toMove];
  if (changes.length === 0) {
    console.log("\nNothing to change.");
    return;
  }

  console.log("");
  if (!(await askYesNo(`Go ahead and file ${changes.length} posts on ${baseUrl}?`))) {
    console.log("Nothing was changed.");
    return;
  }

  console.log(`\nFiling ${changes.length} posts …`);
  let done = 0;
  let failed = 0;
  for (const { entry, post } of changes) {
    try {
      await setCategory(baseUrl, token, post.id, entry.category);
      done++;
    } catch (error) {
      failed++;
      if (failed <= 5) console.error(`  ! ${entry.slug}: ${error.message}`);
    }
    if (done % 50 === 0 && done) console.log(`  ${done}/${changes.length}`);
  }

  console.log(`\nDone. ${done} posts filed${failed ? `, ${failed} failed` : ""}.`);
  console.log("The News tabs read from this, so the sections fill in as the pages refresh.");
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
