/**
 * Translates the sections a page is built from into every language the site
 * ships.
 *
 *   node --env-file=.env.local --import tsx scripts/translate-pages.mts
 *
 * The built-in pages used to take their words from messages/*.json, which is
 * translated into forty-eight languages. Now that their bodies are authored
 * sections, that translation has to come from somewhere — and this is it.
 * One row per page per language in `page_translations`, read by
 * src/lib/pageTranslations.ts, which the page builder already calls. A page
 * with no row for the language being read shows the words it was written in,
 * so a partial run never breaks a site.
 *
 * Written as TypeScript rather than a plain script for one reason: it reads
 * `collections/blocks/pageBlocks` to decide what counts as prose. A `text`
 * field is not necessarily words — `href`, `anchor` and `accentColour` are all
 * text — so the field list has to come from the block definitions rather than
 * from a hand-kept list that would fall behind the next block anyone adds.
 *
 * ## What you need
 *
 * The same provider and key as the article translator:
 *
 *   TRANSLATE_PROVIDER=openai        # or: google, deepl
 *   TRANSLATE_API_KEY=...
 *
 * See the header of scripts/translate-posts.mjs for what each provider costs
 * and which languages each can do. Nothing is spent until you say yes.
 *
 * ## Doing it in pieces
 *
 *   --locales fr,de,ko     only these languages
 *   --pages 3,7            only these page ids
 *   --dry-run              count and price the work, write nothing
 *   --yes                  skip the confirmation
 *   --retranslate          redo pages already done, ignoring the digest
 */

import crypto from "node:crypto";
import readline from "node:readline";
import pg from "pg";

import { extractText, applyText, countCharacters } from "./lib/lexical.mjs";
import {
  BATCH_LIMITS,
  PROVIDERS,
  SOURCE,
  batched,
  providerCode,
  siteLocales,
  translateBatch,
} from "./lib/translate.mjs";

/* ------------------------------------------------------------------ input */

const args = process.argv.slice(2);
const has = (name: string) => args.includes(`--${name}`);
const value = (name: string, fallback: string | null = null) => {
  const at = args.indexOf(`--${name}`);
  return at !== -1 && args[at + 1] && !args[at + 1].startsWith("--") ? args[at + 1] : fallback;
};

const DRY_RUN = has("dry-run");
const ASSUME_YES = has("yes");
const RETRANSLATE = has("retranslate");

/* --------------------------------------------------------------- database */

const ALIASES = ["DATABASE_URI", "POSTGRES_URL", "DATABASE_URL", "POSTGRES_PRISMA_URL"];

function connectionString() {
  const found = ALIASES.find((name) => process.env[name]);
  const raw = found && process.env[found]!.trim().replace(/^["']|["']$/g, "");
  if (!raw) {
    throw new Error(
      `No connection string found. Looked for: ${ALIASES.join(", ")}.\n` +
        "Pass --env-file=.env.local, or export one of them.",
    );
  }
  return raw;
}

/* ------------------------------------------------------- what is prose */

/**
 * Field names that hold words a reader sees, taken from the block definitions.
 *
 * Everything of type text, textarea or richText, minus the handful that are
 * text but not prose. Those are named rather than pattern-matched: an address,
 * an anchor and a colour are each text, and translating any of them would
 * break the thing it points at.
 */
const NOT_PROSE = new Set([
  "href",
  "anchor",
  "url",
  "email",
  "photoPath",
  "backgroundColour",
  "gradientFrom",
  "gradientTo",
  "overlayColour",
  "accentColour",
  "icon",
]);

type FieldLike = {
  name?: string;
  type?: string;
  fields?: FieldLike[];
  blocks?: { fields?: FieldLike[] }[];
};

function collectProseNames(fields: FieldLike[], into: Set<string>) {
  for (const field of fields ?? []) {
    if (field.fields) collectProseNames(field.fields, into);
    for (const block of field.blocks ?? []) collectProseNames(block.fields ?? [], into);
    if (!field.name || NOT_PROSE.has(field.name)) continue;
    if (field.type === "text" || field.type === "textarea" || field.type === "richText") {
      into.add(field.name);
    }
  }
}

/* -------------------------------------------------------------- the walk */

/**
 * Every translatable value on a page's sections, keyed by the address the
 * reader looks it up under.
 *
 * This walks the stored data exactly as `apply` in src/lib/pageTranslations.ts
 * does — a node carrying an `id` starts a new address segment, anything else
 * extends the address by its field name — because the two have to agree on
 * every key or the translation is written where nothing will look for it.
 * That agreement is checked end to end rather than asserted: translate a page
 * into one language and read it back in that language.
 */
type Entry = { key: string; kind: "string" | "rich"; texts: string[]; document?: unknown };

function collect(node: unknown, prose: Set<string>, prefix: string, out: Entry[]) {
  if (Array.isArray(node)) {
    for (const item of node) collect(item, prose, prefix, out);
    return;
  }
  if (!node || typeof node !== "object") return;

  const source = node as Record<string, unknown>;
  const id =
    typeof source.id === "string" || typeof source.id === "number" ? String(source.id) : null;
  const here = id ? (prefix ? `${prefix}.${id}` : id) : prefix;

  for (const [key, item] of Object.entries(source)) {
    if (typeof item === "string") {
      if (!here || !prose.has(key) || !item.trim()) continue;
      out.push({ key: `${here}.${key}`, kind: "string", texts: [item] });
      continue;
    }

    if (item && typeof item === "object" && !Array.isArray(item) && "root" in item) {
      if (!here || !prose.has(key)) continue;
      const texts = extractText(item);
      if (texts.length) out.push({ key: `${here}.${key}`, kind: "rich", texts, document: item });
      continue;
    }

    collect(item, prose, here ? `${here}.${key}` : key, out);
  }
}

/** What the translation was made from, so an edit to the page is noticed. */
function sourceHash(entries: Entry[]) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(entries.map((entry) => [entry.key, entry.texts])))
    .digest("hex")
    .slice(0, 32);
}

/* ------------------------------------------------------------------- asks */

let rl: readline.Interface | null = null;
function ask(question: string): Promise<string> {
  rl ??= readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl!.question(question, (answer) => resolve(answer.trim())));
}

async function confirm(question: string) {
  if (ASSUME_YES) return true;
  const answer = (await ask(`${question} (yes/no) `)).toLowerCase();
  return answer === "y" || answer === "yes";
}

function money(characters: number, provider: string) {
  // The same rough estimate the article translator prints, and for the same
  // reason: it is for deciding whether to press go, not an invoice.
  return (characters / 1_000_000) * (provider === "openai" ? 1 : 20);
}

/* ------------------------------------------------------------------- main */

async function main() {
  const providerName = (process.env.TRANSLATE_PROVIDER || "google").toLowerCase();
  // The providers are a plain object in a JavaScript module, so it comes in
  // untyped; naming the shape here is what the rest of this function reads it
  // through.
  type Provider = {
    name: string;
    aliases: Record<string, string>;
    languages: (key: string) => Promise<string[]>;
  };
  const provider = (PROVIDERS as unknown as Record<string, Provider | undefined>)[providerName];
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

  const { pageBlocks } = await import("../src/collections/blocks/pageBlocks");
  const prose = new Set<string>();
  for (const block of pageBlocks) collectProseNames(block.fields as FieldLike[], prose);

  const uri = connectionString();
  const client = new pg.Client({
    connectionString: uri,
    ssl: /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(uri) || uri.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const { rows: exists } = await client.query(
      "SELECT to_regclass('public.page_translations') AS table",
    );
    if (!exists[0].table) {
      throw new Error(
        "The page_translations table does not exist yet.\n" +
          "Run the migrations first:  node scripts/apply-migrations.mjs",
      );
    }

    const asked = value("locales");
    const wanted = asked
      ? asked.split(",").map((code) => code.trim()).filter(Boolean)
      : siteLocales();
    const targets = wanted.filter((locale) => locale !== SOURCE);

    console.log(`\nProvider: ${provider.name}`);
    let supported: string[] = [];
    if (key) supported = await provider.languages(key);
    else console.log("No key set — running as a dry run, so languages are assumed available.");

    const plan: { locale: string; code: string }[] = [];
    const unsupported: string[] = [];
    for (const locale of targets) {
      const code = key ? providerCode(locale, provider.aliases, supported) : locale;
      if (code) plan.push({ locale, code });
      else unsupported.push(locale);
    }
    if (unsupported.length) {
      console.log(
        `\n${provider.name} cannot translate ${unsupported.length} of the site's languages:\n  ${unsupported.join(", ")}`,
      );
      console.log("Those pages stay in the language they were written in. Everything else proceeds.");
    }

    // Payload holds a page's sections across two dozen block tables, so the
    // sections are read back through Payload rather than assembled from SQL.
    // Payload's schema push offers to delete the three tables it does not own —
    // post_translations, traffic and schema_migrations — and waits for an answer.
    // A script is not a person, so it is turned off here. The schema comes from
    // scripts/migrations.mjs instead. See the note in payload.config.ts.
    process.env.PAYLOAD_DISABLE_PUSH = "1";

    const { getPayload } = await import("payload");
    const config = (await import("../src/payload.config")).default;
    const payload = await getPayload({ config });

    const only = value("pages");
    const ids = only ? only.split(",").map((id) => Number(id.trim())).filter(Boolean) : null;

    const pages = await payload.find({
      collection: "pages",
      where: ids ? { id: { in: ids } } : {},
      limit: 500,
      depth: 0,
    });

    const withSections = (
      pages.docs as unknown as { id: number; title?: string; layout?: unknown[] }[]
    ).filter((page) => (page.layout ?? []).length > 0);

    console.log(`\n${withSections.length} pages with sections, ${plan.length} languages to fill.`);

    const { rows: done } = await client.query(
      "SELECT page_id, locale, source_hash, edited FROM page_translations",
    );
    const already = new Map(done.map((row) => [`${row.page_id}:${row.locale}`, row]));

    const jobs: { page: { id: number; title?: string }; hash: string; entries: Entry[]; target: { locale: string; code: string } }[] = [];
    let characters = 0;
    let empty = 0;

    for (const page of withSections) {
      const entries: Entry[] = [];
      collect(page.layout, prose, "", entries);
      if (entries.length === 0) {
        empty += 1;
        continue;
      }
      const hash = sourceHash(entries);
      const size = countCharacters(entries.flatMap((entry) => entry.texts));
      for (const target of plan) {
        const existing = already.get(`${page.id}:${target.locale}`);
        if (existing?.edited) continue;
        if (!RETRANSLATE && existing && existing.source_hash === hash) continue;
        jobs.push({ page, hash, entries, target });
        characters += size;
      }
    }

    if (empty) console.log(`${empty} of them have sections but no words in them yet.`);

    if (jobs.length === 0) {
      console.log("\nEverything is already translated and up to date. Nothing to do.");
      return;
    }

    console.log(`\n${jobs.length.toLocaleString("en")} page-languages to translate.`);
    console.log(
      `${characters.toLocaleString("en")} characters, roughly $${money(characters, providerName).toFixed(2)}.`,
    );
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
        // One page is one list of strings, in a fixed order, so a page of
        // twenty headings is one or two calls rather than twenty.
        const flat = job.entries.flatMap((entry) => entry.texts);
        const out: string[] = [];
        const limits = (BATCH_LIMITS as unknown as Record<string, { maxItems: number; maxChars: number }>)[providerName];
        for (const batch of batched(flat, limits)) {
          out.push(...(await translateBatch(provider, key, batch, job.target.code)));
        }
        if (out.length !== flat.length) {
          throw new Error(`asked for ${flat.length} strings, got ${out.length} back`);
        }

        const values: Record<string, unknown> = {};
        let at = 0;
        for (const entry of job.entries) {
          const slice = out.slice(at, at + entry.texts.length);
          at += entry.texts.length;
          values[entry.key] =
            entry.kind === "rich" ? applyText(entry.document, slice) : slice[0];
        }

        await client.query(
          `INSERT INTO page_translations (page_id, locale, "values", source_hash, provider, updated_at)
           VALUES ($1, $2, $3, $4, $5, now())
           ON CONFLICT (page_id, locale) DO UPDATE
             SET "values" = EXCLUDED."values",
                 source_hash = EXCLUDED.source_hash,
                 provider = EXCLUDED.provider,
                 updated_at = now()
           WHERE page_translations.edited = false`,
          [job.page.id, job.target.locale, JSON.stringify(values), job.hash, providerName],
        );
        completed += 1;
      } catch (error) {
        failed += 1;
        console.error(
          `  ${job.target.locale} · page ${job.page.id} (${job.page.title ?? "untitled"}): ${(error as Error).message}`,
        );
        // One page in one language failing is not a reason to stop: the digest
        // means the next run picks up exactly what did not land.
      }

      if ((completed + failed) % 10 === 0 || completed + failed === jobs.length) {
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n${error.message}`);
    rl?.close();
    process.exit(1);
  });
