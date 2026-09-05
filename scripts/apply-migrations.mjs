/**
 * Brings the database up to the schema the code expects, and refuses to let
 * the build finish if it cannot.
 *
 *   node scripts/apply-migrations.mjs          # what `npm run build` runs
 *   node scripts/apply-migrations.mjs --status # what is applied, what is not
 *   node scripts/apply-migrations.mjs --dry-run
 *
 * ## Why this exists
 *
 * Payload's `push` is development-only, so a field added to a collection
 * creates its column on your machine and never on the deployed database. The
 * procedure for closing that gap used to be "and then remember to run the SQL
 * file". It was forgotten three times, and each time the admin went blank —
 * Payload selects every field of a collection, Postgres rejects the query, and
 * the screen has no error to show anyone.
 *
 * So it is not a procedure any more. This runs inside `npm run build`, which
 * means a deploy carries its own schema: if the migration fails, the build
 * fails, and the old code keeps serving against the old schema rather than new
 * code meeting a database that cannot answer it.
 *
 * ## What it guarantees
 *
 *   - Every migration in scripts/migrations.mjs has run before the build that
 *     needs it is allowed to succeed.
 *   - A .sql file that nobody added to that list fails the build, so the step
 *     cannot be skipped by forgetting it.
 *   - Applying is recorded in `schema_migrations`, so it is not re-run.
 *   - A migration whose work is already in the schema is recorded **without
 *     being executed**. That is how this can be introduced to databases whose
 *     history was never written down, and it is a safety property rather than
 *     a shortcut: `add-admin-roles.sql` ends with an UPDATE that was right the
 *     once and would, run again today, promote every country admin on the
 *     network to super admin. Each migration says how to tell whether it has
 *     landed — the `done` predicate in migrations.mjs.
 *
 * ## The one way it can still be skipped
 *
 * No connection string. Locally that is normal — `next build` with no database
 * should still work — so it warns and carries on. On Vercel it is not normal,
 * so it fails. That is the only place the distinction is made, and it is made
 * on `process.env.VERCEL`.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import pg from "pg";

import { MIGRATIONS, NOT_MIGRATIONS } from "./migrations.mjs";

const SCRIPTS = import.meta.dirname;
const args = process.argv.slice(2);
const STATUS = args.includes("--status");
const DRY_RUN = args.includes("--dry-run");

/* ------------------------------------------------- the list is the contract */

/**
 * Fails when a .sql file exists that is neither a listed migration nor a
 * named diagnostic.
 *
 * This is the half of the guarantee that stops the next person — or the next
 * session — writing `add-something.sql`, deploying, and finding out from a
 * blank admin screen. Checked before the database is even opened, so it fails
 * the same way whether or not a connection string is present.
 */
function checkNothingUnregistered() {
  const known = new Set([...MIGRATIONS.map((m) => m.file), ...NOT_MIGRATIONS]);
  const stray = readdirSync(SCRIPTS)
    .filter((name) => name.endsWith(".sql"))
    .filter((name) => !known.has(name));

  if (stray.length === 0) return;

  console.error(
    `\n${stray.length} SQL file(s) in scripts/ are not registered:\n` +
      stray.map((name) => `  ${name}`).join("\n") +
      "\n\nAdd each one to MIGRATIONS at the end of scripts/migrations.mjs so it " +
      "runs on deploy,\nor to NOT_MIGRATIONS if it is a diagnostic that should " +
      "never run on its own.\n\nThis check exists because forgetting it is what " +
      "took the admin down three times.\n",
  );
  process.exit(1);
}

/** Every listed migration must actually be there. A typo is caught here. */
function checkAllPresent() {
  const missing = MIGRATIONS.filter(({ file }) => {
    try {
      readFileSync(path.join(SCRIPTS, file));
      return false;
    } catch {
      return true;
    }
  });
  if (missing.length) {
    console.error(`\nListed in migrations.mjs but not on disk:\n${missing.map(({ file }) => `  ${file}`).join("\n")}\n`);
    process.exit(1);
  }
}

/* --------------------------------------------------------------- connecting */

// Same aliases and order as src/lib/getDatabaseUri.ts: Vercel's Neon
// integration injects a different name depending on how it was connected, and
// a migration that disagreed with the app about which database it means would
// be worse than one that does not run.
const ALIASES = ["DATABASE_URI", "POSTGRES_URL", "DATABASE_URL", "POSTGRES_PRISMA_URL"];

function connectionString() {
  const found = ALIASES.find((name) => process.env[name]);
  const raw = found && process.env[found].trim().replace(/^["']|["']$/g, "");
  if (!raw) return { found: null, value: null };
  // `vercel env pull` writes a literal placeholder for a variable marked
  // sensitive. It looks like a real env file right up until something uses it.
  if (!/^postgres(ql)?:\/\//.test(raw)) {
    console.error(
      `\n${found} does not hold a Postgres connection string — it starts with "${raw.slice(0, 20)}".\n` +
        "If that reads [SENSITIVE], Vercel redacted it on pull. Copy the real value from\n" +
        "the Neon dashboard, or Vercel > Storage > your database.\n",
    );
    process.exit(1);
  }
  return { found, value: raw };
}

const RECORD_TABLE = `
  CREATE TABLE IF NOT EXISTS "public"."schema_migrations" (
    "name" varchar PRIMARY KEY,
    "checksum" varchar NOT NULL,
    "applied_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
`;

function digest(sql) {
  return crypto.createHash("sha256").update(sql).digest("hex").slice(0, 16);
}

/* -------------------------------------------------------------------- main */

async function main() {
  checkNothingUnregistered();
  checkAllPresent();

  const { found, value } = connectionString();
  if (!value) {
    const message =
      `No database connection string. Looked for: ${ALIASES.join(", ")}.`;
    if (process.env.VERCEL) {
      // On Vercel this is never right, and carrying on would deploy code
      // against a schema nobody checked — the exact failure this exists to
      // prevent. Fail closed.
      console.error(`\n${message}\nA deploy cannot skip its migrations.\n`);
      process.exit(1);
    }
    console.warn(`\n${message}\nSkipping migrations — fine for a local build, never for a deploy.\n`);
    return;
  }

  // A Postgres on this machine usually has no TLS at all, and demanding it
  // fails the build for a reason that has nothing to do with the migration —
  // which is exactly the kind of false alarm that gets a safety check disabled.
  // Anything else is hosted: encrypted, but with a chain the local trust store
  // often will not recognise.
  const isLocal =
    /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(value) || value.includes("sslmode=disable");

  const client = new pg.Client({
    connectionString: value,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  let host = "(unparsed)";
  try {
    host = new URL(value).host;
  } catch {
    host = `${value.slice(0, 11)}…`;
  }

  await client.connect();
  try {
    await client.query(RECORD_TABLE);
    const { rows } = await client.query(`SELECT name, checksum FROM schema_migrations`);
    const applied = new Map(rows.map((row) => [row.name, row.checksum]));

    const pending = [];
    const changed = [];
    // Already there, but never recorded — a database older than this runner.
    // Recorded without being executed: see the note on `done` in
    // migrations.mjs for why replaying one of these is the dangerous option.
    const alreadyThere = [];

    for (const { file, done } of MIGRATIONS) {
      const sql = readFileSync(path.join(SCRIPTS, file), "utf8");
      const sum = digest(sql);
      if (applied.has(file)) {
        if (applied.get(file) !== sum) changed.push(file);
        continue;
      }
      const { rows: [{ exists }] } = await client.query(`SELECT (${done}) AS exists`);
      if (exists) alreadyThere.push({ name: file, sum });
      else pending.push({ name: file, sql, sum });
    }

    if (STATUS) {
      const here = new Set(alreadyThere.map((row) => row.name));
      const due = new Set(pending.map((row) => row.name));
      console.log(`\n${host} (from ${found})\n`);
      for (const { file } of MIGRATIONS) {
        const mark = due.has(file) ? "PENDING" : here.has(file) ? "in place" : "applied";
        console.log(`  ${mark.padEnd(9)} ${file}`);
      }
      console.log(
        `\n${applied.size} recorded, ${alreadyThere.length} already in place, ${pending.length} pending.`,
      );
      if (changed.length) console.log(`Edited since it ran: ${changed.join(", ")}`);
      return;
    }

    // An edited migration is a warning, not a failure. Some of these files are
    // generated and get regenerated; and since every one is additive, an edit
    // that adds something is picked up by the next database to run it. What it
    // must not do is silently mean "already done" on a database that never had
    // the added part — which is what the drift check in README.md is for.
    for (const name of changed) {
      console.warn(`  note: ${name} has been edited since it was applied here.`);
    }

    // Recorded, not run. Their work is demonstrably in the schema already.
    for (const { name, sum } of alreadyThere) {
      await client.query(
        `INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [name, sum],
      );
    }
    if (alreadyThere.length) {
      console.log(
        `${alreadyThere.length} migration(s) already in the schema, recorded without re-running.`,
      );
    }

    if (pending.length === 0) {
      console.log(`Schema up to date (${host}).`);
      return;
    }

    console.log(`\n${pending.length} migration(s) to apply against ${host} (from ${found}):`);
    for (const { name } of pending) console.log(`  ${name}`);
    if (DRY_RUN) {
      console.log("\n--dry-run: nothing applied.");
      return;
    }
    console.log("");

    for (const { name, sql, sum } of pending) {
      const started = Date.now();
      try {
        // The whole file as one simple query, so Postgres runs it in an
        // implicit transaction — or honours the file's own BEGIN/COMMIT.
        // Either way it lands whole or not at all.
        await client.query(sql);
      } catch (error) {
        console.error(`\nFAILED on ${name}: ${error.message}`);
        if (error.detail) console.error(`detail: ${error.detail}`);
        if (error.hint) console.error(`hint: ${error.hint}`);
        console.error(
          "\nThe build stops here on purpose. Deploying past a failed migration is " +
            "how\nthe admin went blank before: new code, old schema, and no error on " +
            "screen.\n",
        );
        process.exit(1);
      }

      await client.query(
        `INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()`,
        [name, sum],
      );
      console.log(`  applied  ${name}  (${Date.now() - started}ms)`);
    }

    console.log(`\n${pending.length} migration(s) applied.`);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
