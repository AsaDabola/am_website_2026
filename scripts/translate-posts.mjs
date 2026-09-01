/**
 * Translates every news article into every language the site ships.
 *
 *   node --env-file=.env.local scripts/translate-posts.mjs
 *
 * The articles are written in one language and the site is read in
 * forty-seven. This fills in the other forty-six: headline, summary and body,
 * stored per article per language in `post_translations`, which the site reads
 * through src/lib/postTranslations.ts. Anything not yet translated keeps the
 * words it was written in, so the site is never broken by a partial run.
 *
 * It is built to be run more than once, and to be interrupted. Every article
 * carries a digest of the English it was translated from, so a second run does
 * nothing except pick up articles that are new or have been edited since. Stop
 * it with ctrl-C and start it again and it carries on where it left off.
 *
 * ## What you need
 *
 * A translation provider and a key for it, as environment variables:
 *
 *   TRANSLATE_PROVIDER=google        # or: deepl
 *   TRANSLATE_API_KEY=...
 *
 * Google Cloud Translation (console.cloud.google.com → APIs → Cloud
 * Translation API → Credentials → API key) bills about $20 per million
 * characters. DeepL's free tier covers 500,000 characters a month and its paid
 * tier is about €20 per million; DeepL translates fewer languages but tends to
 * read better in the ones it has.
 *
 * Nothing is spent until you say yes: it counts the work, prices it, and asks.
 *
 * ## Doing it in pieces
 *
 *   --locales fr,de,ko     only these languages
 *   --limit 25             only the newest N articles (per language)
 *   --dry-run              count and price the work, write nothing, spend nothing
 *   --yes                  skip the confirmation (for an unattended run)
 *   --retranslate          redo articles already done, ignoring the digest
 *
 * Starting with `--locales` for the countries that matter most, and widening
 * later, costs the same in total and gets those sites readable sooner.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import pg from "pg";

import { extractText, applyText, countCharacters } from "./lib/lexical.mjs";

const ROOT = path.join(import.meta.dirname, "..");

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
const LIMIT = Number(value("limit", "0")) || 0;

/** The language articles are written in. Everything else is a target. */
const SOURCE = "en";

/** Every locale the site ships, read from the routing table so it cannot drift. */
function siteLocales() {
  const source = fs.readFileSync(path.join(ROOT, "src", "i18n", "routing.ts"), "utf8");
  const block = /export const locales = \[([\s\S]*?)\] as const;/.exec(source);
  if (!block) throw new Error("I couldn't read the locale list out of src/i18n/routing.ts.");
  return [...block[1].matchAll(/"([a-z-]+)"/g)].map((match) => match[1]);
}

/* --------------------------------------------------------------- database */

const ALIASES = ["DATABASE_URI", "POSTGRES_URL", "DATABASE_URL", "POSTGRES_PRISMA_URL"];

function connectionString() {
  const found = ALIASES.find((name) => process.env[name]);
  const raw = found && process.env[found].trim().replace(/^["']|["']$/g, "");
  if (!raw) {
    throw new Error(
      `No connection string found. Looked for: ${ALIASES.join(", ")}.\n` +
        "Pass --env-file=.env.local, or export one of them.",
    );
  }
  return raw;
}

/* -------------------------------------------------------------- providers */

/**
 * Both providers take a list of strings and give a list back in the same
 * order, which is what lets a whole article go over in one or two calls
 * instead of one per paragraph.
 */

const PROVIDERS = {
  google: {
    name: "Google Cloud Translation",
    /**
     * Overridable so this can be pointed at a self-hosted or proxied
     * translation service that speaks the same shape — and so the script can
     * be exercised end to end without spending anything.
     */
    base: () => process.env.TRANSLATE_ENDPOINT || "https://translation.googleapis.com/language/translate/v2",
    /** Google's own names for languages whose codes differ from ours. */
    aliases: { he: "iw", zh: "zh-CN", fil: "tl", nb: "no" },
    async languages(key) {
      const res = await fetch(
        `${PROVIDERS.google.base()}/languages?key=${encodeURIComponent(key)}`,
      );
      if (!res.ok) throw new Error(`Asking Google which languages it has failed (${res.status}): ${await res.text()}`);
      const body = await res.json();
      return body.data.languages.map((entry) => entry.language.toLowerCase());
    },
    async translate(key, texts, target) {
      const res = await fetch(
        `${PROVIDERS.google.base()}?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: texts, source: SOURCE, target, format: "text" }),
        },
      );
      if (!res.ok) {
        const error = new Error(`Google returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        error.status = res.status;
        throw error;
      }
      const body = await res.json();
      return body.data.translations.map((entry) => entry.translatedText);
    },
  },

  deepl: {
    name: "DeepL",
    aliases: { pt: "pt-PT", zh: "zh-HANS", en: "en-GB" },
    endpoint: (key) =>
      key.endsWith(":fx") ? "https://api-free.deepl.com/v2" : "https://api.deepl.com/v2",
    async languages(key) {
      const res = await fetch(`${PROVIDERS.deepl.endpoint(key)}/languages?type=target`, {
        headers: { Authorization: `DeepL-Auth-Key ${key}` },
      });
      if (!res.ok) throw new Error(`Asking DeepL which languages it has failed (${res.status}): ${await res.text()}`);
      return (await res.json()).map((entry) => entry.language.toLowerCase());
    },
    async translate(key, texts, target) {
      const res = await fetch(`${PROVIDERS.deepl.endpoint(key)}/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: texts, source_lang: SOURCE.toUpperCase(), target_lang: target.toUpperCase() }),
      });
      if (!res.ok) {
        const error = new Error(`DeepL returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        error.status = res.status;
        throw error;
      }
      return (await res.json()).translations.map((entry) => entry.text);
    },
  },
};

/**
 * The provider's name for one of our locales, or null if it cannot do it.
 *
 * Asked of the provider rather than hard-coded: the list of languages these
 * services cover grows, and a table written today would quietly go on
 * refusing a language months after it became available. Matching on the base
 * code as well as the exact one is what makes "pt" find "pt-BR".
 */
function providerCode(locale, aliases, supported) {
  const candidates = [aliases[locale], locale].filter(Boolean).map((code) => code.toLowerCase());
  for (const candidate of candidates) {
    if (supported.includes(candidate)) return candidate;
    const regional = supported.find((code) => code.split("-")[0] === candidate);
    if (regional) return regional;
  }
  return null;
}

/** One call, retried on the failures that are worth retrying. */
async function translateBatch(provider, key, texts, target) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await provider.translate(key, texts, target);
    } catch (error) {
      const retryable = error.status === 429 || (error.status >= 500 && error.status < 600);
      if (!retryable || attempt === 4) throw error;
      // Backing off rather than hammering: a rate limit answered immediately
      // is a rate limit again.
      await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
    }
  }
  return null;
}

/**
 * Splits a list of strings into calls the provider will accept.
 *
 * Both services cap the number of strings and the total size of one request,
 * and an article with eighty paragraphs exceeds the first while a single long
 * one can exceed the second.
 */
function batched(texts, { maxItems = 100, maxChars = 25_000 } = {}) {
  const batches = [];
  let current = [];
  let size = 0;
  for (const text of texts) {
    if (current.length && (current.length >= maxItems || size + text.length > maxChars)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += text.length;
  }
  if (current.length) batches.push(current);
  return batches;
}

/* ------------------------------------------------------------------ shape */

/**
 * Everything about one article that gets translated, flattened into a list of
 * strings and a way to put them back.
 *
 * The headline and summary are two entries; the body contributes one per run
 * of words in it. Keeping them in a single list means one article is one
 * request rather than three.
 */
function translatable(post) {
  const bodyRuns = post.body ? extractText(post.body) : [];
  const texts = [post.title ?? "", post.excerpt ?? "", ...bodyRuns];
  return {
    texts,
    rebuild(translated) {
      const [title, excerpt, ...runs] = translated;
      return {
        title,
        excerpt: post.excerpt ? excerpt : null,
        body: post.body ? applyText(post.body, runs) : null,
      };
    },
  };
}

/** What the translation was made from, so an edit to the article is noticed. */
function sourceHash(post) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify([post.title ?? "", post.excerpt ?? "", post.body ?? null]))
    .digest("hex")
    .slice(0, 32);
}

/* ------------------------------------------------------------------- asks */

let rl = null;
function ask(question) {
  rl ??= readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

async function confirm(question) {
  if (ASSUME_YES) return true;
  const answer = (await ask(`${question} (yes/no) `)).toLowerCase();
  return answer === "y" || answer === "yes";
}

function money(characters, provider) {
  // Both list around the same headline rate per million characters. This is an
  // estimate for deciding whether to press go, not an invoice.
  const perMillion = provider === "deepl" ? 20 : 20;
  return (characters / 1_000_000) * perMillion;
}

/* ------------------------------------------------------------------- main */

async function main() {
  const providerName = (process.env.TRANSLATE_PROVIDER || "google").toLowerCase();
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`I don't know the provider "${providerName}". Use google or deepl.`);
  }
  const key = process.env.TRANSLATE_API_KEY;
  if (!key && !DRY_RUN) {
    throw new Error(
      "TRANSLATE_API_KEY is not set.\n" +
        "Set it, or run with --dry-run to see the size of the job without a key.",
    );
  }

  const client = new pg.Client({
    connectionString: connectionString(),
    ssl: connectionString().includes("localhost") ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    // The table is created by scripts/add-post-translations.sql, and this is a
    // clearer thing to read than whatever Postgres says about a missing
    // relation three queries later.
    const { rows: exists } = await client.query("SELECT to_regclass('public.post_translations') AS table");
    if (!exists[0].table) {
      throw new Error(
        "The post_translations table does not exist yet.\n" +
          'Run it first:  psql "$DATABASE_URI" -f scripts/add-post-translations.sql',
      );
    }

    const asked = value("locales");
    const wanted = asked ? asked.split(",").map((code) => code.trim()).filter(Boolean) : siteLocales();
    const targets = wanted.filter((locale) => locale !== SOURCE);

    console.log(`\nProvider: ${provider.name}`);
    let supported = [];
    if (key) {
      supported = await provider.languages(key);
    } else {
      console.log("No key set — running as a dry run, so languages are assumed available.");
    }

    const plan = [];
    const unsupported = [];
    for (const locale of targets) {
      const code = key ? providerCode(locale, provider.aliases, supported) : locale;
      if (code) plan.push({ locale, code });
      else unsupported.push(locale);
    }

    if (unsupported.length) {
      console.log(
        `\n${provider.name} cannot translate ${unsupported.length} of the site's languages:\n  ${unsupported.join(", ")}`,
      );
      console.log("Those articles stay in the language they were written in. Everything else proceeds.");
    }

    const { rows: posts } = await client.query(
      `SELECT id, title, excerpt, body FROM posts
        ORDER BY published_date DESC NULLS LAST
        ${LIMIT ? `LIMIT ${LIMIT}` : ""}`,
    );
    console.log(`\n${posts.length} articles, ${plan.length} languages to fill.`);

    // What is already done, so the count below is the work that remains rather
    // than the work there ever was.
    const { rows: done } = await client.query(
      "SELECT post_id, locale, source_hash, edited FROM post_translations",
    );
    const already = new Map(done.map((row) => [`${row.post_id}:${row.locale}`, row]));

    const jobs = [];
    let characters = 0;
    for (const post of posts) {
      const hash = sourceHash(post);
      const shape = translatable(post);
      const size = countCharacters(shape.texts);
      for (const target of plan) {
        const existing = already.get(`${post.id}:${target.locale}`);
        if (existing?.edited) continue;
        if (!RETRANSLATE && existing && existing.source_hash === hash) continue;
        jobs.push({ post, hash, shape, target });
        characters += size;
      }
    }

    if (jobs.length === 0) {
      console.log("\nEverything is already translated and up to date. Nothing to do.");
      return;
    }

    console.log(`\n${jobs.length.toLocaleString("en")} article-languages to translate.`);
    console.log(`${characters.toLocaleString("en")} characters, roughly $${money(characters, providerName).toFixed(2)}.`);
    console.log("Already done and unchanged is skipped, so a second run is cheap.\n");

    if (DRY_RUN) {
      console.log("Dry run — nothing written, nothing spent.");
      return;
    }
    if (!(await confirm("Translate these now?"))) {
      console.log("Nothing was written.");
      return;
    }

    console.log("");
    let completed = 0;
    let failed = 0;
    const startedAt = Date.now();

    for (const job of jobs) {
      try {
        const out = [];
        for (const batch of batched(job.shape.texts)) {
          out.push(...(await translateBatch(provider, key, batch, job.target.code)));
        }
        const { title, excerpt, body } = job.shape.rebuild(out);

        await client.query(
          `INSERT INTO post_translations
             (post_id, locale, title, excerpt, body, source_hash, provider, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, now())
           ON CONFLICT (post_id, locale) DO UPDATE
             SET title = EXCLUDED.title,
                 excerpt = EXCLUDED.excerpt,
                 body = EXCLUDED.body,
                 source_hash = EXCLUDED.source_hash,
                 provider = EXCLUDED.provider,
                 updated_at = now()
           WHERE post_translations.edited = false`,
          [job.post.id, job.target.locale, title, excerpt, body ? JSON.stringify(body) : null, job.hash, providerName],
        );
        completed += 1;
      } catch (error) {
        failed += 1;
        console.error(`  ${job.target.locale} · article ${job.post.id}: ${error.message}`);
        // One article in one language failing is not a reason to stop: the
        // digest means the next run picks up exactly what did not land.
      }

      if ((completed + failed) % 25 === 0 || completed + failed === jobs.length) {
        const share = Math.round(((completed + failed) / jobs.length) * 100);
        const minutes = ((Date.now() - startedAt) / 60000).toFixed(1);
        process.stdout.write(
          `\r  ${completed + failed}/${jobs.length}  (${share}%)  ${failed ? `${failed} failed  ` : ""}${minutes}m elapsed   `,
        );
      }
    }

    console.log(`\n\nDone. ${completed.toLocaleString("en")} translated${failed ? `, ${failed} failed` : ""}.`);
    if (failed) console.log("Run it again to retry the ones that failed — the rest will be skipped.");
    console.log("The site picks these up on its next revalidation, within a minute.");
  } finally {
    await client.end().catch(() => {});
    rl?.close();
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
  rl?.close();
});
