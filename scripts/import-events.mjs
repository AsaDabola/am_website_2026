/**
 * Puts the events on the site, each with its own photograph.
 *
 * The photographs are named after the events themselves — "Advent Retreat
 * (Dec. 6-7).webp" — so the folder is both the list of what to create and the
 * picture for each. Only events with a photograph are created, which is the
 * instruction: an events page of empty grey cards is worse than a shorter one.
 *
 *   npm run import-events
 *
 * No year is invented. "Dec. 6-7" does not say which December, and the only
 * thing that is actually known about when these happened is the order of the
 * list they came in — newest first. So that order is what gets stored, and the
 * events page is ordered by it rather than by a date. The bracketed part of
 * the name is kept as the line the card shows.
 *
 * Nothing is uploaded or created until you say yes.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { resolveFolder } from "./lib/paths.mjs";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const ANSWERS_FILE = value("answers", "import-answers.json");
const TITLES_FILE = value("titles", path.join(import.meta.dirname, "data", "event-titles.json"));

const MONTHS = [
  ["january", "jan"],
  ["february", "feb"],
  ["march", "mar"],
  ["april", "apr"],
  ["may"],
  ["june", "jun"],
  ["july", "jul"],
  ["august", "aug"],
  ["september", "sept", "sep"],
  ["october", "oct"],
  ["november", "nov"],
  ["december", "dec"],
];

/** "Advent Retreat (Dec. 6-7)" → the event's name and whatever was bracketed. */
export function splitName(name) {
  const withoutExtension = name.replace(/\.[a-z0-9]+$/i, "");
  const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(withoutExtension);
  if (!match) return { title: withoutExtension.trim(), note: null };
  return { title: match[1].trim(), note: match[2].trim() };
}

/**
 * The month and day a bracketed note names, or nothing.
 *
 * Only the first month and the first number after it are read. The notes run
 * from "Feb. 18" through "Jan 4 – Jan 6" to "December 10th", and every one of
 * them starts at the day this returns. A note with no month in it — "Lusaka,
 * Zambia", "Online available via Zoom link" — is not a date, and saying it is
 * would put an invented day on the page.
 */
export function parseWhen(note) {
  if (!note) return null;
  const lower = note.toLowerCase();

  for (let index = 0; index < MONTHS.length; index++) {
    for (const spelling of MONTHS[index]) {
      const at = new RegExp(`\\b${spelling}\\b\\.?`, "i").exec(lower);
      if (!at) continue;
      const after = lower.slice(at.index + at[0].length);
      const day = /^[^0-9a-z]*(\d{1,2})/.exec(after);
      return { month: index + 1, day: day ? Number(day[1]) : 1 };
    }
  }
  return null;
}

export function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const words = (text) => new Set(normalize(text).split(" ").filter(Boolean));

/**
 * The listed event a photograph is of.
 *
 * Most names match a listed one word for word. Two are shorter ways of saying
 * the same thing — "Mission Tour" for "US Mission Tour (September)" — and are
 * matched by containing every word of the photograph's name, but only when
 * exactly one listed event does. Two candidates identify neither, and putting
 * an event in the wrong place in the order is not worth the guess.
 */
export function findListed(title, listed) {
  const exact = listed.findIndex((entry) => normalize(entry.title) === normalize(title));
  if (exact !== -1) return { entry: listed[exact], at: exact };

  const wanted = words(title);
  const hits = [];
  listed.forEach((entry, at) => {
    const has = words(entry.title);
    for (const word of wanted) if (!has.has(word)) return;
    hits.push({ entry, at });
  });
  return hits.length === 1 ? hits[0] : null;
}

/** Everything the site needs for one event, or the reason it cannot be made. */
export function planEvent(fileName, { listed }) {
  const photo = splitName(fileName);

  // The list holds the fuller wording — "Fall Semester Fellowship Launch"
  // where the photograph is filed as "Fall Fellowship" — and its position is
  // the only thing that says when this happened relative to the rest.
  const match = findListed(photo.title, listed) ?? findListed(`${photo.title} ${photo.note ?? ""}`, listed);
  const canonical = match ? splitName(match.entry.title) : photo;
  const note = canonical.note ?? photo.note;

  if (!note) {
    return { fileName, title: canonical.title, reason: "the name says nothing about when it was" };
  }

  // A bracketed place is not a date. Those are left out rather than printed on
  // the card where the date goes; none of them would read as a time.
  if (!parseWhen(note) && note.includes(",")) {
    return { fileName, title: canonical.title, reason: `"${note}" is a place, not a date` };
  }

  return {
    fileName,
    title: canonical.title,
    // What the photograph itself was called. An event already on the site may
    // be under that name rather than the list's fuller one, and matching only
    // the fuller one would add a second copy of it.
    photoTitle: photo.title,
    dateLabel: note,
    // 1 shows first. Photographs of nothing in the list go after everything
    // that is in it, keeping their own order among themselves.
    sortOrder: match ? match.at + 1 : null,
    matchedList: Boolean(match),
    // Two "Fall Retreat"s exist, in different months, and the slug has to be
    // unique across every event on the site.
    slug: toSlug(`${canonical.title} ${note}`),
  };
}

let rl = null;
let lines = null;
const prompts = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));
async function ask(question, { fallback = "", hidden = false, raw = false } = {}) {
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
  // A dragged folder path can end in an escaped space, and trimming it here
  // would leave the backslash stranded on the name — so a path question keeps
  // what it was given and lets resolveFolder read it.
  const given = done ? "" : answer;
  return (raw ? given : given.trim()) || fallback;
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

async function fetchAllEvents(baseUrl, token) {
  const events = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${baseUrl}/api/events?limit=200&page=${page}&depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    });
    if (!res.ok) throw new Error(`Fetching events failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    events.push(...body.docs);
    if (!body.hasNextPage) break;
  }
  return events;
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
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  const { doc } = await res.json();
  return doc;
}

async function writeEvent(baseUrl, token, existing, plan, mediaId) {
  const body = existing
    ? { coverImage: mediaId, sortOrder: plan.sortOrder }
    : {
        title: plan.title,
        slug: plan.slug,
        dateLabel: plan.dateLabel,
        sortOrder: plan.sortOrder,
        coverImage: mediaId,
      };
  const url = existing ? `${baseUrl}/api/events/${existing.id}` : `${baseUrl}/api/events`;

  const res = await fetch(url, {
    method: existing ? "PATCH" : "POST",
    headers: { Authorization: `JWT ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${existing ? "Updating" : "Creating"} failed (${res.status}): ${await res.text()}`);
}

async function main() {
  console.log("\nThis puts the events on the site, each with its own photograph.");
  console.log("Only events that have a photograph are created. Nothing until you say yes.\n");

  const saved = fs.existsSync(ANSWERS_FILE) ? JSON.parse(fs.readFileSync(ANSWERS_FILE, "utf8")) : {};

  const folder = resolveFolder(await ask("Folder with the event photographs:", { fallback: saved.eventsRoot || "", raw: true }));
  if (!folder) throw new Error("I need the folder holding the photographs.");
  if (!fs.existsSync(folder)) throw new Error(`I couldn't find ${folder}.`);
  if (!fs.statSync(folder).isDirectory()) {
    throw new Error(`${folder} is a file, not a folder. If it is a zip, unzip it first and give me the folder.`);
  }

  const files = fs.readdirSync(folder).filter((name) => /\.(webp|jpe?g|png)$/i.test(name));
  if (!files.length) throw new Error(`No photographs in ${folder}.`);

  const baseUrl = (
    await ask("Website address:", { fallback: saved.baseUrl || "https://amintl.org" })
  ).replace(/\/$/, "");
  const email = await ask("Your admin email:", { fallback: saved.email || "" });
  const password = await ask("Your admin password:", { hidden: true });
  const listed = fs.existsSync(TITLES_FILE) ? JSON.parse(fs.readFileSync(TITLES_FILE, "utf8")) : [];

  console.log(`\nSigning in to ${baseUrl} …`);
  const token = await signIn(baseUrl, email, password);
  const events = await fetchAllEvents(baseUrl, token);
  const byTitle = new Map(events.map((event) => [normalize(event.title), event]));

  console.log(`${files.length} photographs in the folder.`);
  console.log(`${events.length} events already on the site.\n`);

  const plans = files.map((file) => planEvent(file, { listed }));

  // Anything the list does not hold goes after everything it does, keeping the
  // order the folder gives it, so nothing lands in the middle by accident.
  let next = listed.length + 1;
  for (const plan of plans) if (!plan.reason && plan.sortOrder === null) plan.sortOrder = next++;

  const usable = plans
    .filter((plan) => !plan.reason)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const unusable = plans.filter((plan) => plan.reason);

  const alreadyThere = (plan) =>
    byTitle.get(normalize(plan.title)) ?? byTitle.get(normalize(plan.photoTitle)) ?? null;

  const toCreate = usable.filter((plan) => !alreadyThere(plan));
  const toUpdate = usable.filter((plan) => alreadyThere(plan));

  console.log("Here is what I found:\n");
  console.log(`  ${toCreate.length} events would be created, in this order, each with its photograph:`);
  for (const plan of toCreate) {
    const guessed = plan.matchedList ? "" : "   (not in the list — placed at the end)";
    console.log(`      ${String(plan.sortOrder).padStart(3)}.  ${plan.title} — ${plan.dateLabel}${guessed}`);
  }
  if (toUpdate.length) {
    console.log(`\n  ${toUpdate.length} are already on the site and would only get their photograph:`);
    for (const plan of toUpdate) console.log(`      ${plan.title}`);
  }
  if (unusable.length) {
    console.log(`\n  ${unusable.length} photographs name no date I can read, so they are left out:`);
    for (const plan of unusable) console.log(`      ${plan.fileName} — ${plan.reason}`);
  }

  console.log("\n  No years are set: the order above is the order the page will show,");
  console.log("  taken from the list, newest first. The bracketed part is the line on");
  console.log("  the card.");

  if (!toCreate.length && !toUpdate.length) {
    console.log("\nNothing to do.");
    return;
  }

  console.log("");
  if (!(await askYesNo(`Go ahead on ${baseUrl}?`))) {
    console.log("Nothing was changed.");
    return;
  }

  fs.writeFileSync(
    ANSWERS_FILE,
    JSON.stringify({ ...saved, eventsRoot: folder, baseUrl, email }, null, 2),
  );

  console.log("");
  let done = 0;
  let failed = 0;
  for (const plan of [...toCreate, ...toUpdate]) {
    try {
      const media = await uploadMedia(baseUrl, token, path.join(folder, plan.fileName), plan.title);
      await writeEvent(baseUrl, token, alreadyThere(plan), plan, media.id);
      done++;
      if (done % 5 === 0) console.log(`  ${done}/${toCreate.length + toUpdate.length}`);
    } catch (error) {
      failed++;
      console.error(`  ! ${plan.title}: ${error.message}`);
    }
  }

  console.log(`\nDone. ${done} events on the site${failed ? `, ${failed} failed` : ""}.`);
  console.log("The events page refreshes within a minute.");
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main()
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => rl?.close());
}
