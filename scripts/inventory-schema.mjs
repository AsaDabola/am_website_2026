/**
 * Prints every table and column in the database it is pointed at, one
 * "table.column type" per line, sorted.
 *
 * Read-only. Its whole purpose is to make schema drift visible: `push` is
 * development-only, so a field added to a collection reaches a local database
 * by itself and never reaches the deployed one, and the resulting failures are
 * swallowed by the `catch` blocks around every query. Run this against the
 * deployed database and diff it against the same output from a scratch
 * database that `scripts/push-schema.mts` has just built, and the missing
 * pieces are the diff. See scripts/README.md.
 *
 *   POSTGRES_URL='postgres://…' node scripts/inventory-schema.mjs > deployed.txt
 */

import { Pool } from "pg";

const uri =
  process.env.DATABASE_URI ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!uri) {
  console.error(
    "No connection string. Set POSTGRES_URL (or DATABASE_URI / DATABASE_URL).",
  );
  process.exit(1);
}

// Vercel redacts variables marked sensitive when you `vercel env pull`, so a
// pulled .env can hold the literal text rather than a connection string. That
// fails later with a baffling DNS error, so it is caught here instead.
if (uri.includes("[SENSITIVE]") || !/^postgres(ql)?:\/\//.test(uri)) {
  console.error(
    "That is not a usable connection string — Vercel redacts sensitive variables on pull.\n" +
      "Copy the real value from the Vercel dashboard (Storage -> your database -> connection string).",
  );
  process.exit(1);
}

// Neon insists on TLS; a scratch cluster on localhost has none to offer.
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(uri) || uri.includes("sslmode=disable");
const pool = new Pool({
  connectionString: uri,
  ssl: local ? false : { rejectUnauthorized: false },
});

const { rows } = await pool.query(`
  SELECT table_name, column_name, data_type, udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, column_name
`);

for (const row of rows) {
  // USER-DEFINED covers the enums Payload generates for select fields, and the
  // enum's own name is the part worth seeing.
  const type = row.data_type === "USER-DEFINED" ? row.udt_name : row.data_type;
  console.log(`${row.table_name}.${row.column_name} ${type}`);
}

const { rows: enums } = await pool.query(`
  SELECT t.typname, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS labels
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
  GROUP BY t.typname
  ORDER BY t.typname
`);

for (const row of enums) {
  console.log(`ENUM ${row.typname} = ${row.labels}`);
}

await pool.end();
