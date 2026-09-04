/**
 * Fills in the site's own wording in every language it is read in.
 *
 *   node --env-file=.env.local scripts/translate-messages.mjs
 *
 * The site's fixed text — headings, buttons, labels, the hero headlines —
 * lives in messages/en.json and is translated into the other forty-seven
 * files beside it. Those files are what next-intl serves, layered over English
 * by src/i18n/request.ts, so a key that is missing from a locale falls back to
 * English rather than showing a variable name.
 *
 * That fallback is the whole reason this script can be safe to run at any
 * time: it only ever adds keys a locale does not have, so a partial run leaves
 * the site correct-but-English rather than broken.
 *
 * The usual reason to run it is that a line of English changed. Changing it
 * leaves forty-seven files still holding the *old* sentence, which is worse
 * than holding nothing — so delete the key from those files (or pass
 * --retranslate) and run this to fill it back in.
 *
 * ## What you need
 *
 * The same provider and key the article translator uses:
 *
 *   TRANSLATE_PROVIDER=openai        # or: google, deepl
 *   TRANSLATE_API_KEY=...
 *
 * Nothing is spent until you say yes: it counts the work, prices it, and asks.
 *
 * ## Doing it in pieces
 *
 *   --keys Home.Hero               only keys under this path (repeatable, comma-separated)
 *   --locales fr,de,ko             only these languages
 *   --retranslate                  redo keys a locale already has
 *   --dry-run                      count and price the work, write nothing
 *   --yes                          skip the confirmation
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import {
  BATCH_LIMITS,
  PROVIDERS,
  SOURCE,
  batched,
  localeLabels,
  providerCode,
  siteLocales,
  translateBatch,
} from "./lib/translate.mjs";

const ROOT = path.join(import.meta.dirname, "..");
const MESSAGES = path.join(ROOT, "messages");

/* ------------------------------------------------------------------ input */

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name, fallback = null) => {
  const at = args.indexOf(`--${name}`);
  return at !== -1 && args[at + 1] && !args[at + 1].startsWith("--") ? args[at + 1] : fallback;
};

const DRY_RUN = has("dry-run");
const ASSUME_YES = has("yes");
const RETRANSLATE = has("retranslate");
const KEY_PREFIXES = (value("keys") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

/* ----------------------------------------------------------------- shapes */

/**
 * Every string in the catalogue, as "dotted.path" -> text.
 *
 * Flattened so a locale can be compared with English key by key regardless of
 * how deeply either happens to be nested.
 */
function flatten(node, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(node ?? {})) {
    const at = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, at, out);
    else if (typeof value === "string") out[at] = value;
  }
  return out;
}

/** Writes one dotted path back into a nested object, making parents as needed. */
function put(node, dotted, text) {
  const parts = dotted.split(".");
  let at = node;
  for (const part of parts.slice(0, -1)) {
    if (!at[part] || typeof at[part] !== "object") at[part] = {};
    at = at[part];
  }
  at[parts.at(-1)] = text;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

/* ------------------------------------------------------------------- asks */

let rl = null;
async function ask(question) {
  rl ??= readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

async function askYesNo(question) {
  if (ASSUME_YES) return true;
  const answer = (await ask(`${question} (yes/no) `)).toLowerCase();
  return answer === "y" || answer === "yes";
}

function money(characters, provider) {
  return (characters / 1_000_000) * (provider === "openai" ? 1 : 20);
}

/* ------------------------------------------------------------------- main */

async function main() {
  const providerName = (process.env.TRANSLATE_PROVIDER || "openai").toLowerCase();
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`I don't know the provider "${providerName}". Use openai, google or deepl.`);
  }
  const key = process.env.TRANSLATE_API_KEY;
  if (!key && !DRY_RUN) {
    throw new Error(
      "TRANSLATE_API_KEY is not set.\n" +
        "Set it, or run with --dry-run to see the size of the job without a key.",
    );
  }

  const english = flatten(readJson(path.join(MESSAGES, "en.json")));
  const wanted = Object.entries(english).filter(
    ([dotted, text]) =>
      // An empty string is deliberate — a line the design no longer draws —
      // and there is nothing to translate in it.
      text.trim().length > 0 &&
      (KEY_PREFIXES.length === 0 ||
        KEY_PREFIXES.some((prefix) => dotted === prefix || dotted.startsWith(`${prefix}.`))),
  );

  if (wanted.length === 0) {
    console.log("No English strings matched. Check --keys.");
    return;
  }

  const asked = value("locales");
  const targets = (asked ? asked.split(",").map((s) => s.trim()) : siteLocales()).filter(
    (locale) => locale !== SOURCE,
  );

  const labels = localeLabels();
  console.log(`\nProvider: ${provider.name}`);

  let supported = null;
  if (key && provider.languages) {
    try {
      supported = await provider.languages(key);
    } catch (error) {
      console.log(`(could not ask which languages it has: ${error.message})`);
    }
  }

  /* What is actually missing, per locale. */
  const jobs = [];
  let characters = 0;
  for (const locale of targets) {
    const file = path.join(MESSAGES, `${locale}.json`);
    if (!fs.existsSync(file)) continue;

    const code = supported ? providerCode(locale, provider.aliases, supported) : locale;
    if (!code) {
      console.log(`  ${labels[locale] ?? locale}: ${provider.name} cannot translate this one — skipped.`);
      continue;
    }

    const existing = flatten(readJson(file));
    const missing = wanted.filter(([dotted]) => RETRANSLATE || !(dotted in existing));
    if (missing.length === 0) continue;

    jobs.push({ locale, code, file, missing });
    characters += missing.reduce((total, [, text]) => total + text.length, 0);
  }

  if (jobs.length === 0) {
    console.log("\nEvery language already has every one of those keys. Nothing to do.");
    return;
  }

  const strings = jobs.reduce((total, job) => total + job.missing.length, 0);
  console.log(
    `\n${strings.toLocaleString("en")} strings across ${jobs.length} languages.\n` +
      `${characters.toLocaleString("en")} characters, roughly $${money(characters, providerName).toFixed(2)}.`,
  );

  if (DRY_RUN) {
    console.log("\n--dry-run: nothing written, nothing spent.");
    return;
  }
  if (!(await askYesNo("\nGo ahead?"))) {
    console.log("Nothing done.");
    return;
  }

  let done = 0;
  for (const job of jobs) {
    const texts = job.missing.map(([, text]) => text);
    const translated = [];
    for (const batch of batched(texts, BATCH_LIMITS[providerName])) {
      translated.push(...(await translateBatch(provider, key, batch, job.code)));
    }

    // Written only once the whole locale has come back, so an interrupted run
    // leaves a file untouched rather than half-filled.
    if (translated.length !== texts.length) {
      console.log(`  ${job.locale}: got ${translated.length} of ${texts.length} back — skipped.`);
      continue;
    }

    const data = readJson(job.file);
    job.missing.forEach(([dotted], index) => put(data, dotted, translated[index]));
    writeJson(job.file, data);

    done += texts.length;
    process.stdout.write(`\r  ${job.locale} done  (${done}/${strings} strings)            `);
  }

  console.log(`\n\nDone. ${done} strings written across ${jobs.length} languages.`);
  console.log("These ship with the next deploy — they are files, not database rows.");
}

main()
  .catch((error) => {
    console.error(`\n${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => rl?.close());
