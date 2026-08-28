/**
 * Fills the homepage's slides into the admin, as they are on the site now.
 *
 * The slides could be edited, but the editor opened empty: the four the site
 * ships live in the code, so there was nothing there to change without
 * building all four again from scratch. This puts them in — photographs
 * uploaded, wording filled — so the first edit is an edit rather than a
 * rebuild.
 *
 *   npm run seed-slides
 *
 * The wording written in is the English the site ships. That matters only for
 * amintl.org: a country site keeps the translated wording until someone
 * authors its own home page, and a slide whose line is left empty in the admin
 * keeps the translated wording too.
 *
 * Nothing is written until you say yes. If the homepage already has slides in
 * the admin, it stops rather than overwriting what someone wrote.
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
const ROOT = value("root", path.join(import.meta.dirname, ".."));

/**
 * The slides the site ships, in order, read from the Hero component so this
 * cannot drift from what is actually on the page.
 */
export function readSlides(source) {
  const block = /const DEFAULT_SLIDES = \[([\s\S]*?)\] as const;/.exec(source);
  if (!block) return [];
  return [...block[1].matchAll(/\{\s*image:\s*"([^"]+)",\s*key:\s*"([^"]+)"\s*\}/g)].map((m) => ({
    image: m[1],
    key: m[2],
  }));
}

/** The two lines a slide says, from the English catalogue. */
export function linesFor(messages, key) {
  const hero = messages?.Home?.Hero ?? {};
  return { line1: hero[`${key}Line1`] ?? "", line2: hero[`${key}Line2`] ?? "" };
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

async function findHomePage(baseUrl, token) {
  const res = await fetch(`${baseUrl}/api/pages?limit=200&depth=0`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!res.ok) throw new Error(`Fetching pages failed (${res.status}): ${await res.text()}`);
  const { docs } = await res.json();
  return docs.find((page) => !page.tenant && (page.isHome || !page.slug)) ?? null;
}

async function findMedia(baseUrl, token, filename) {
  const res = await fetch(
    `${baseUrl}/api/media?limit=1&depth=0&where[filename][equals]=${encodeURIComponent(filename)}`,
    { headers: { Authorization: `JWT ${token}` } },
  );
  if (!res.ok) return null;
  const { docs } = await res.json();
  return docs[0] ?? null;
}

async function uploadMedia(baseUrl, token, absolutePath, alt) {
  const form = new FormData();
  form.append("_payload", JSON.stringify({ alt }));
  form.append(
    "file",
    new Blob([fs.readFileSync(absolutePath)], { type: "image/webp" }),
    path.basename(absolutePath),
  );
  const res = await fetch(`${baseUrl}/api/media`, {
    method: "POST",
    headers: { Authorization: `JWT ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Uploading ${path.basename(absolutePath)} failed (${res.status}): ${await res.text()}`);
  const { doc } = await res.json();
  return doc;
}

async function main() {
  console.log("\nThis fills the homepage's slides into the admin, exactly as they are on");
  console.log("the site now, so they can be edited. Nothing is written until you say yes.\n");

  const heroFile = path.join(ROOT, "src", "components", "sections", "Hero.tsx");
  const messagesFile = path.join(ROOT, "messages", "en.json");
  if (!fs.existsSync(heroFile)) throw new Error(`I couldn't find ${heroFile}.`);

  const slides = readSlides(fs.readFileSync(heroFile, "utf8"));
  if (!slides.length) throw new Error("I couldn't read the slides out of Hero.tsx.");
  const messages = JSON.parse(fs.readFileSync(messagesFile, "utf8"));

  const saved = fs.existsSync(ANSWERS_FILE) ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8")) : {};
  const baseUrl = (
    await ask("Website address:", { fallback: saved.baseUrl || "https://amintl.org" })
  ).replace(/\/$/, "");
  const email = await ask("Your admin email:", { fallback: saved.email || "" });
  const password = await ask("Your admin password:", { hidden: true });

  console.log(`\nSigning in to ${baseUrl} …`);
  const token = await signIn(baseUrl, email, password);

  const home = await findHomePage(baseUrl, token);
  if (!home) {
    throw new Error(
      "There is no home page in Pages for the main site.\nCreate one with Is Home ticked, then run this again.",
    );
  }

  const hero = (home.sections ?? []).find((section) => section.blockType === "hero");
  if (hero?.slides?.length) {
    console.log(`The homepage already has ${hero.slides.length} slides in the admin.`);
    console.log("Leaving them alone — edit them there rather than here.");
    return;
  }

  console.log(`${slides.length} slides on the site now:\n`);
  const planned = [];
  for (const slide of slides) {
    const { line1, line2 } = linesFor(messages, slide.key);
    const file = path.join(ROOT, "public", slide.image.replace(/^\//, ""));
    planned.push({ ...slide, line1, line2, file, exists: fs.existsSync(file) });
    console.log(`  ${line1} ${line2}`);
    console.log(`      ${slide.image}${fs.existsSync(file) ? "" : "   — I can't find this file"}`);
  }

  const missing = planned.filter((slide) => !slide.exists);
  if (missing.length) throw new Error(`${missing.length} of the photographs are missing from public/.`);

  console.log("");
  if (!(await askYesNo(`Put these into the homepage on ${baseUrl}?`))) {
    console.log("Nothing was written.");
    return;
  }

  console.log("\nUploading the photographs …");
  const withMedia = [];
  for (const slide of planned) {
    const filename = path.basename(slide.file);
    const already = await findMedia(baseUrl, token, filename);
    const media = already ?? (await uploadMedia(baseUrl, token, slide.file, `${slide.line1} ${slide.line2}`));
    withMedia.push({ image: media.id, line1: slide.line1, line2: slide.line2 });
    console.log(`  ${already ? "already there" : "uploaded"}: ${filename}`);
  }

  // The Hero block's older heading fields are required, and are what shows if
  // every slide is ever removed, so they are filled from the same catalogue.
  const heroText = messages?.Home?.Hero ?? {};
  const sections = [
    {
      blockType: "hero",
      eyebrow: heroText.eyebrow,
      headingLine1: heroText.slide1Line1 ?? heroText.headingLine1 ?? "Overflowing",
      headingHighlight1: heroText.slide1Line2 ?? heroText.headingWhere ?? "in Grace",
      headingHighlight2: heroText.headingWeAre ?? "and Love",
      joinBibleStudyLabel: heroText.joinBibleStudy ?? "Join our Bible Study",
      whoWeAreLabel: heroText.whoWeAre ?? "Who we are",
      slides: withMedia,
      stat1: { value: heroText.stat1Value, label: heroText.stat1Label },
      stat2: { value: heroText.stat2Value, label: heroText.stat2Label },
      stat3: { value: heroText.stat3Value, label: heroText.stat3Label },
    },
    ...(home.sections ?? []).filter((section) => section.blockType !== "hero"),
  ];

  const res = await fetch(`${baseUrl}/api/pages/${home.id}`, {
    method: "PATCH",
    headers: { Authorization: `JWT ${token}`, "Content-Type": "application/json" },
    // A home page that renders from records is not a built-in page; leaving
    // that flag on would hide the sections it is being given.
    body: JSON.stringify({ builtIn: false, sections }),
  });
  if (!res.ok) throw new Error(`Writing the homepage failed (${res.status}): ${await res.text()}`);

  console.log(`\nDone. ${withMedia.length} slides are in the admin under Pages → Home → Hero.`);
  console.log("Edit, reorder, add or remove them there; the preview beside the form shows it.");
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
