/**
 * Runs a .sql file against DATABASE_URI.
 *
 * Exists because the Payload CLI needs tsx to load the TypeScript config, and
 * tsx's CJS interop breaks on some Node builds — which leaves no way to get a
 * schema repair into the database from the command line. This needs none of
 * that: plain JavaScript, and the `pg` driver that already ships as a
 * dependency of the Postgres adapter.
 *
 *   node --env-file=.env.local scripts/run-sql.mjs scripts/fix-tenants-schema.sql
 *
 * The whole file is sent as one statement, so a BEGIN/COMMIT inside it is
 * honoured: either all of it lands or none of it does.
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("usage: node --env-file=.env.local scripts/run-sql.mjs <file.sql>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URI;
if (!connectionString) {
  console.error("DATABASE_URI is not set. Pass --env-file=.env.local, or export it.");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
const { host } = new URL(connectionString);
console.log(`Running ${file} against ${host}`);

const client = new pg.Client({
  connectionString,
  // Hosted Postgres (Neon, Supabase, Vercel) terminates TLS with a certificate
  // chain the local trust store often will not recognise; the connection is
  // still encrypted. Left to the connection string when it says otherwise.
  ssl: connectionString.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Done.");
} catch (error) {
  console.error(`\nFAILED: ${error.message}`);
  if (error.detail) console.error(`detail: ${error.detail}`);
  if (error.hint) console.error(`hint: ${error.hint}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
