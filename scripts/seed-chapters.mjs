/**
 * Puts AM's chapters into the admin.
 *
 * The chapters are already in the code — the network map is drawn from them —
 * but the Campuses collection was empty, so the chapter list on the site fell
 * back to a dozen placeholder names that were never real. This writes the
 * actual chapters in, so they are listed correctly and can be edited.
 *
 *   npm run seed-chapters
 *
 * Each is filed under its country site where one exists, so it appears there
 * as well as in the international network. Burundi and China have chapters but
 * no country site yet; theirs are listed internationally until they do.
 *
 * Nothing is written until you say yes, and a chapter already in the admin is
 * left exactly as it is.
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
const CHAPTERS_FILE = value("chapters", path.join(import.meta.dirname, "..", "src", "lib", "chapters.ts"));

/** The chapters, read out of the TypeScript file this script cannot import. */
export function readChapters(source) {
  const rows = [];
  for (const line of source.split("\n")) {
    const m = /\{\s*city:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*region:\s*"([^"]+)"(.*)\}/.exec(line);
    if (!m) continue;
    // The international headquarters is head office, not a campus chapter.
    if (/role:\s*"global"/.test(m[4])) continue;
    rows.push({ city: m[1], country: m[2], region: m[3] });
  }
  return rows;
}

export function readCountrySlugs(source) {
  const block = /CHAPTER_COUNTRY_SLUGS[^{]*\{([\s\S]*?)\n\};/.exec(source);
  const slugs = {};
  if (!block) return slugs;
  for (const line of block[1].split("\n")) {
    const m = /"?([A-Za-z .'-]+?)"?:\s*(null|"([^"]+)")/.exec(line.trim());
    if (m) slugs[m[1]] = m[3] ?? null;
  }
  return slugs;
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

async function fetchAll(baseUrl, token, collection) {
  const docs = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${baseUrl}/api/${collection}?limit=200&page=${page}&depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    });
    if (!res.ok) throw new Error(`Fetching ${collection} failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    docs.push(...body.docs);
    if (!body.hasNextPage) break;
  }
  return docs;
}

async function createCampus(baseUrl, token, body) {
  const res = await fetch(`${baseUrl}/api/campuses`, {
    method: "POST",
    headers: { Authorization: `JWT ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Creating "${body.name}" failed (${res.status}): ${await res.text()}`);
}

async function main() {
  console.log("\nThis puts AM's chapters into the admin, so the site lists the real ones.");
  console.log("Nothing is written until you say yes.\n");

  if (!fs.existsSync(CHAPTERS_FILE)) throw new Error(`I couldn't find ${CHAPTERS_FILE}.`);
  const source = fs.readFileSync(CHAPTERS_FILE, "utf8");
  const chapters = readChapters(source);
  const countrySlugs = readCountrySlugs(source);
  if (!chapters.length) throw new Error(`No chapters found in ${CHAPTERS_FILE}.`);

  const saved = fs.existsSync(ANSWERS_FILE) ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8")) : {};
  const baseUrl = (
    await ask("Website address:", { fallback: saved.baseUrl || "https://amintl.org" })
  ).replace(/\/$/, "");
  const email = await ask("Your admin email:", { fallback: saved.email || "" });
  const password = await ask("Your admin password:", { hidden: true });

  console.log(`\nSigning in to ${baseUrl} …`);
  const token = await signIn(baseUrl, email, password);
  const [existing, tenants] = await Promise.all([
    fetchAll(baseUrl, token, "campuses"),
    fetchAll(baseUrl, token, "tenants"),
  ]);
  const tenantIdBySlug = new Map(tenants.map((t) => [t.slug, t.id]));
  const alreadyNamed = new Set(existing.map((c) => String(c.name).toLowerCase()));

  const planned = chapters.map((chapter) => {
    const slug = countrySlugs[chapter.country] ?? null;
    return {
      name: `AM ${chapter.city}`,
      location: `${chapter.city}, ${chapter.country}`,
      tenantSlug: slug,
      tenantId: slug ? tenantIdBySlug.get(slug) ?? null : null,
    };
  });

  const toCreate = planned.filter((row) => !alreadyNamed.has(row.name.toLowerCase()));

  console.log(`${chapters.length} chapters in the list.`);
  console.log(`${existing.length} chapters already in the admin.\n`);

  if (!toCreate.length) {
    console.log("Nothing to add — they are all there.");
    return;
  }

  console.log(`${toCreate.length} would be added:\n`);
  for (const row of toCreate) {
    const where = row.tenantId
      ? `→ ${row.tenantSlug}`
      : row.tenantSlug
        ? `→ ${row.tenantSlug} (no country site yet — international only)`
        : "→ international only";
    console.log(`  ${row.name.padEnd(20)} ${row.location.padEnd(28)} ${where}`);
  }

  console.log("");
  if (!(await askYesNo(`Add these to ${baseUrl}?`))) {
    console.log("Nothing was added.");
    return;
  }

  console.log("");
  let done = 0;
  let failed = 0;
  for (const row of toCreate) {
    try {
      await createCampus(baseUrl, token, {
        name: row.name,
        location: row.location,
        active: true,
        ...(row.tenantId ? { tenant: row.tenantId } : {}),
      });
      done++;
    } catch (error) {
      failed++;
      console.error(`  ! ${row.name}: ${error.message}`);
    }
  }

  console.log(`\nDone. ${done} chapters added${failed ? `, ${failed} failed` : ""}.`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
