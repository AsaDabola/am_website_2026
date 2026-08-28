/**
 * Puts every page the site builds in code into the admin's Pages list.
 *
 * Opening Pages and finding it empty is a fair reading of "the site has no
 * pages", when in fact it has thirty — they are just built in React rather
 * than stored as records. This writes one entry per page so the list is the
 * site: Who We Are, Statement of Faith, Volunteer, Contact, all of them, each
 * at its real address and each openable in the preview.
 *
 *   npm run seed-pages
 *
 * An entry is marked built in, which hides the body and section fields on it,
 * because filling those in would do nothing — the layout is code. What such a
 * page says is edited under Page wording.
 *
 * Run it again after adding a page in code and the new one is added; nothing
 * else is touched, and a page you have edited keeps its nav label.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const ANSWERS_FILE = value("answers", "import-answers.json");
const PAGES_FILE = value("pages", path.join(import.meta.dirname, "..", "src", "lib", "builtInPages.ts"));

/**
 * The page list, read out of the TypeScript file rather than imported: this is
 * a plain Node script and that file is TypeScript. The shape is one object per
 * line and generated, so reading it back is a regular expression rather than a
 * parser.
 */
export function readBuiltInPages(source) {
  const rows = [];
  for (const line of source.split("\n")) {
    const match = /route:\s*"([^"]*)",\s*title:\s*"([^"]*)",\s*onCountrySites:\s*(true|false)/.exec(line);
    if (match) rows.push({ route: match[1], title: match[2], onCountrySites: match[3] === "true" });
  }
  return rows;
}

/** The slug a Page record carries for a route: "/about/mission" → "about/mission". */
export function slugFor(route) {
  return route === "/" ? "" : route.replace(/^\//, "");
}

let rl = null;
let lines = null;
const prompts = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));
async function ask(question, { fallback = "", hidden = false } = {}) {
  const iface = prompts();
  process.stdout.write(fallback ? `${question} [${fallback}] ` : `${question} `);
  const echo = iface._writeToOutput;
  if (hidden) iface._writeToOutput = () => {};
  lines ??= prompts()[Symbol.asyncIterator]();
  const { value: answer, done } = await lines.next();
  if (hidden) {
    iface._writeToOutput = echo;
    process.stdout.write("\n");
  }
  return (done ? "" : answer).trim() || fallback;
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

async function fetchAllPages(baseUrl, token) {
  const pages = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${baseUrl}/api/pages?limit=200&page=${page}&depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    });
    if (!res.ok) throw new Error(`Fetching pages failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    pages.push(...body.docs);
    if (!body.hasNextPage) break;
  }
  return pages;
}

async function createPage(baseUrl, token, entry) {
  const res = await fetch(`${baseUrl}/api/pages`, {
    method: "POST",
    headers: { Authorization: `JWT ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: entry.title,
      slug: slugFor(entry.route),
      isHome: entry.route === "/",
      published: true,
      builtIn: true,
    }),
  });
  if (!res.ok) throw new Error(`Creating "${entry.title}" failed (${res.status}): ${await res.text()}`);
}

async function main() {
  console.log("\nThis lists the site's built-in pages in the admin, so Pages shows the");
  console.log("whole site rather than only what has been added by hand.");
  console.log("Nothing is created until you say yes.\n");

  if (!fs.existsSync(PAGES_FILE)) throw new Error(`I couldn't find ${PAGES_FILE}.`);
  const entries = readBuiltInPages(fs.readFileSync(PAGES_FILE, "utf8"));
  if (!entries.length) throw new Error(`No pages listed in ${PAGES_FILE}.`);

  const saved = fs.existsSync(ANSWERS_FILE) ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8")) : {};
  const baseUrl = (
    await ask("Website address:", { fallback: saved.baseUrl || "https://amintl.org" })
  ).replace(/\/$/, "");
  const email = await ask("Your admin email:", { fallback: saved.email || "" });
  const password = await ask("Your admin password:", { hidden: true });

  console.log(`\nSigning in to ${baseUrl} …`);
  const token = await signIn(baseUrl, email, password);
  const existing = await fetchAllPages(baseUrl, token);

  // A page belongs to the main site when it has no country on it; those are
  // the ones this list is about.
  const mainSite = new Set(
    existing.filter((page) => !page.tenant).map((page) => String(page.slug ?? "")),
  );

  const toCreate = entries.filter((entry) => !mainSite.has(slugFor(entry.route)));
  const already = entries.length - toCreate.length;

  console.log(`${entries.length} pages are built into the site.`);
  if (already) console.log(`${already} are already listed in the admin.`);

  if (!toCreate.length) {
    console.log("\nNothing to add — every page is already there.");
    return;
  }

  console.log(`\n${toCreate.length} would be added:\n`);
  for (const entry of toCreate) {
    const where = entry.onCountrySites ? "" : "   (main site only)";
    console.log(`  ${entry.route.padEnd(38)} ${entry.title}${where}`);
  }

  console.log("");
  if (!(await askYesNo(`Add these to ${baseUrl}?`))) {
    console.log("Nothing was added.");
    return;
  }

  console.log("");
  let done = 0;
  let failed = 0;
  for (const entry of toCreate) {
    try {
      await createPage(baseUrl, token, entry);
      done++;
    } catch (error) {
      failed++;
      console.error(`  ! ${entry.route}: ${error.message}`);
    }
  }

  console.log(`\nDone. ${done} pages listed${failed ? `, ${failed} failed` : ""}.`);
  console.log("They open in Pages with a preview. Their wording is edited under Page wording.");
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
