/**
 * Answers "which admin screen is broken, and why".
 *
 * A list view that renders the sidebar and nothing else is a missing column:
 * Payload selects every field of the collection, Postgres rejects the query,
 * and the page has no error to show you. This reads the database's actual
 * columns, compares them against scripts/schema.expected.txt, and reports the
 * gaps grouped by the collection whose screen they break.
 *
 *   POSTGRES_URL='<connection string>' node scripts/probe-collections.mjs
 *
 * Read-only, and safe against the deployed database — two SELECTs against
 * information_schema and nothing else.
 *
 * Deliberately plain .mjs with no Payload import. Booting Payload to ask it
 * the same question means loading its config through a TypeScript loader, and
 * `payload/dist/bin/loadEnv.js` destructures a CommonJS default export that
 * comes back undefined under tsx — the diagnostic then fails for a reason that
 * has nothing to do with the database you came to inspect.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "pg";

/**
 * Base table per collection, in the order the admin sidebar lists them.
 * Payload names a collection's table after its slug with hyphens turned to
 * underscores, and every table belonging to it — locales, block rows, array
 * rows — starts with that name and an underscore. A new collection needs
 * adding here, or a missing column in it is reported as "(no collection)".
 */
const COLLECTION_TABLES = [
  ["Users", "users"],
  ["Media", "media"],
  ["Campuses", "campuses"],
  ["Events", "events"],
  ["Posts", "posts"],
  ["Ministries", "ministries"],
  ["Bible Study Signups", "bible_study_signups"],
  ["Volunteer Applications", "volunteer_applications"],
  ["Internship Applications", "internship_applications"],
  ["Tenants", "tenants"],
  ["Pages", "pages"],
  ["Contact Messages", "contact_messages"],
  ["Donation Intents", "donation_intents"],
  ["Partners", "partners"],
  ["Invoices", "invoices"],
  ["Chapter Affiliations", "chapter_affiliations"],
  ["Membership Applications", "membership_applications"],
  ["Country copy", "tenant_content"],
];

/** Longest match wins: tenant_content_overrides belongs to Country copy, not Tenants. */
function collectionOf(table) {
  let best = null;
  for (const [label, base] of COLLECTION_TABLES) {
    if (table !== base && !table.startsWith(`${base}_`)) continue;
    if (!best || base.length > best[1].length) best = [label, base];
  }
  return best?.[0] ?? null;
}

const uri =
  process.env.DATABASE_URI ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!uri) {
  console.error("No connection string. Set POSTGRES_URL (or DATABASE_URI / DATABASE_URL).");
  process.exit(1);
}

// Vercel redacts variables marked sensitive when you `vercel env pull`, so a
// pulled .env can hold the literal text rather than a connection string.
if (uri.includes("[SENSITIVE]") || !/^postgres(ql)?:\/\//.test(uri)) {
  console.error(
    "That is not a usable connection string — Vercel redacts sensitive variables on pull.\n" +
      "Copy the real value from the Vercel dashboard (Storage -> your database -> connection string).",
  );
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const expected = readFileSync(join(here, "schema.expected.txt"), "utf8").split("\n").filter(Boolean);

// Neon insists on TLS; a scratch cluster on localhost has none to offer.
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(uri) || uri.includes("sslmode=disable");
const pool = new Pool({
  connectionString: uri,
  ssl: local ? false : { rejectUnauthorized: false },
});

let actual;
try {
  const { rows } = await pool.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `);

  const { rows: enums } = await pool.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
  `);

  actual = {
    columns: new Set(rows.map((row) => `${row.table_name}.${row.column_name}`)),
    tables: new Set(rows.map((row) => row.table_name)),
    enumValues: new Set(enums.map((row) => `${row.typname}=${row.enumlabel}`)),
  };
} catch (error) {
  console.error(`\nCould not read the schema: ${error.message}`);
  if (error.code === "28P01") {
    console.error(
      "That is a wrong password. If you have just rotated it in Neon, make sure the\n" +
        "new value is actually in POSTGRES_URL — a placeholder left in by mistake\n" +
        "fails exactly like this.",
    );
  }
  await pool.end().catch(() => {});
  process.exit(1);
}

await pool.end();

/** collection label -> list of what it is missing */
const missing = new Map();
const unattributed = [];

function record(table, detail) {
  const label = collectionOf(table);
  if (!label) {
    unattributed.push(detail);
    return;
  }
  if (!missing.has(label)) missing.set(label, []);
  missing.get(label).push(detail);
}

const missingTables = new Set();

for (const line of expected) {
  if (line.startsWith("ENUM ")) {
    const [name, labels] = line.slice(5).split(" = ");
    for (const label of labels.split(",")) {
      if (actual.enumValues.has(`${name}=${label}`)) continue;
      // The enum is named after the table and column that use it.
      record(name.replace(/^enum_/, ""), `enum ${name} is missing the value '${label}'`);
    }
    continue;
  }

  const [path] = line.split(" ");
  const table = path.slice(0, path.lastIndexOf("."));
  if (actual.columns.has(path)) continue;

  // One line per absent table rather than one per column it would have held.
  if (!actual.tables.has(table)) {
    if (missingTables.has(table)) continue;
    missingTables.add(table);
    record(table, `table ${table} does not exist`);
    continue;
  }
  record(table, `column ${path} does not exist`);
}

for (const [label] of COLLECTION_TABLES) {
  const problems = missing.get(label);
  if (!problems) {
    console.log(`ok    ${label}`);
    continue;
  }
  console.log(`FAIL  ${label}  (${problems.length})`);
}

const total = [...missing.values()].reduce((sum, list) => sum + list.length, 0) + unattributed.length;

if (total === 0) {
  console.log("\nNothing missing. Every collection has the columns the code selects.");
  process.exit(0);
}

console.log("\nWhat is missing:\n");
for (const [label, problems] of missing) {
  console.log(`${label}:`);
  for (const problem of problems) console.log(`  ${problem}`);
  console.log();
}
if (unattributed.length > 0) {
  console.log("Not tied to one collection:");
  for (const problem of unattributed) console.log(`  ${problem}`);
  console.log();
}

console.log(
  "Fix these by applying the matching scripts/*.sql with scripts/run-sql.mjs.\n" +
    "See scripts/README.md.",
);
process.exit(1);
