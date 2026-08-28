/**
 * Asks the site what its article photographs are, then tries to fetch them.
 *
 * A card showing a broken image means the post has a picture — it passed the
 * "has a picture" filter to be listed at all — and the address in it does not
 * serve. Two very different things do that, and they are told apart by which
 * of two requests fails:
 *
 *   the file itself fails    → the bytes are not in storage. Uploads landed on
 *                              the server's own disk, which is thrown away
 *                              between requests, because the blob storage
 *                              token was not set when they were made.
 *   only /_next/image fails  → the file is there, and Next refuses to resize
 *                              it: its host is not in `images.remotePatterns`
 *                              in next.config.ts.
 *
 *   npm run check-images
 *
 * Reads only. Nothing is uploaded, changed or deleted.
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
const CATEGORY = value("category", null);
const HOW_MANY = Number(value("how-many", 8));

/** The address Next serves a resized copy from, which is what a card asks for. */
export function nextImageUrl(baseUrl, imageUrl, width = 828) {
  return `${baseUrl}/_next/image?url=${encodeURIComponent(imageUrl)}&w=${width}&q=75`;
}

/** Absolute already, or relative to the site. */
export function absolute(baseUrl, url) {
  return /^https?:\/\//i.test(url) ? url : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * What the two results mean together, in the order they should be tried.
 * Kept separate from the fetching so the reasoning can be read on its own.
 */
export function diagnose({ fileStatus, resizedStatus }) {
  if (fileStatus === 200) return resizedStatus === 200 ? "fine" : "not-resizable";
  // A status is a reply, however unwelcome: the host is there and says no.
  // A message instead of a number means nothing answered at all, which is a
  // different problem from a file that is genuinely gone, and saying "not in
  // storage" to a name that does not resolve would send anyone the wrong way.
  return typeof fileStatus === "number" ? "missing-file" : "unreachable";
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

async function status(url) {
  try {
    // HEAD is enough and cheap, but blob hosts and image endpoints do not all
    // answer it; a failed HEAD is retried as a GET before believing it.
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return head.status;
    const get = await fetch(url);
    return get.status;
  } catch (error) {
    return error.message;
  }
}

async function main() {
  console.log("\nThis checks whether the article photographs actually serve.");
  console.log("It only reads — nothing is uploaded, changed or deleted.\n");

  const saved = fs.existsSync(ANSWERS_FILE) ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8")) : {};
  const baseUrl = (
    await ask("Website address:", { fallback: saved.baseUrl || "https://amintl.org" })
  ).replace(/\/$/, "");
  const email = await ask("Your admin email:", { fallback: saved.email || "" });
  const password = await ask("Your admin password:", { hidden: true });

  const login = await fetch(`${baseUrl}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error(`Signing in failed (${login.status}).`);
  const { token } = await login.json();

  const query = [
    `limit=${HOW_MANY}`,
    "depth=1",
    "where[coverImage][exists]=true",
    CATEGORY ? `where[category][equals]=${encodeURIComponent(CATEGORY)}` : "",
  ]
    .filter(Boolean)
    .join("&");

  const res = await fetch(`${baseUrl}/api/posts?${query}`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!res.ok) throw new Error(`Fetching posts failed (${res.status}).`);
  const { docs } = await res.json();

  if (!docs.length) {
    console.log("No posts with a picture came back, so there is nothing to check.");
    return;
  }

  console.log(`\nChecking ${docs.length} articles …\n`);
  const verdicts = [];

  for (const post of docs) {
    const cover = post.coverImage;
    const url = typeof cover === "object" ? cover?.url : null;
    if (!url) {
      console.log(`  ${post.title}\n      the post names a picture the site cannot resolve`);
      verdicts.push("no-url");
      continue;
    }

    const fileStatus = await status(absolute(baseUrl, url));
    const resizedStatus = await status(nextImageUrl(baseUrl, url));
    const verdict = diagnose({ fileStatus, resizedStatus });
    verdicts.push(verdict);

    console.log(`  ${post.title}`);
    console.log(`      ${url}`);
    console.log(`      file ${fileStatus}, resized ${resizedStatus}`);
  }

  const count = (name) => verdicts.filter((verdict) => verdict === name).length;
  console.log("\nWhat that means:\n");

  if (count("fine") === verdicts.length) {
    console.log("  Every photograph serves. The broken cards are something else —");
    console.log("  send me one card's image address from the browser and I'll look again.");
  }
  if (count("missing-file")) {
    console.log(`  ${count("missing-file")} ${count("missing-file") === 1 ? "photograph is" : "photographs are"} not in storage.`);
    console.log("  The upload wrote them to the server's own disk, which is thrown away");
    console.log("  between requests. That happens when BLOB_READ_WRITE_TOKEN is not set");
    console.log("  on the deployment. Set it in Vercel, then the images need uploading");
    console.log("  again — npm run import-images will do it, the posts keep their text.");
  }
  if (count("not-resizable")) {
    console.log(`  ${count("not-resizable")} ${count("not-resizable") === 1 ? "photograph is" : "photographs are"} in storage, but Next refuses to resize them.`);
    console.log("  Their host is not in images.remotePatterns in next.config.ts. Send me");
    console.log("  one of the addresses above and I'll add it.");
  }
  if (count("unreachable")) {
    console.log(`  ${count("unreachable")} ${count("unreachable") === 1 ? "photograph is" : "photographs are"} at an address that did not answer at all.`);
    console.log("  Not a missing file — nothing replied. Either the host in the address is");
    console.log("  wrong, or this machine cannot reach it. Send me one of the addresses.");
  }
  if (count("no-url")) {
    console.log(`  ${count("no-url")} ${count("no-url") === 1 ? "post points" : "posts point"} at a picture that is no longer in Media.`);
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
