/**
 * Writes the SQL that brings a database up to the schema the collections
 * currently describe.
 *
 * This is the step that used to be done by hand, and it is the step that has
 * twice taken the live admin down. Payload's adapter cares about exact names —
 * `shareWithContinents` becomes a table called `posts_share_with_continents`
 * with a `value` column of a generated enum type — and a hand-written guess at
 * that shape fails silently. One page-builder block is 26 tables and 500-odd
 * columns; nobody should be typing that.
 *
 * So: let Payload build the schema in a scratch database, ask Postgres itself
 * for the DDL of everything the target is missing, and make each statement
 * idempotent so the file is safe to run twice.
 *
 *   createdb scratch
 *   POSTGRES_URL='postgres://localhost/scratch' node --import tsx scripts/push-schema.mts
 *   SOURCE_URL='postgres://localhost/scratch' \
 *   TARGET_URL='<the live connection string>' \
 *     node scripts/generate-catchup-sql.mjs > scripts/add-my-feature.sql
 *
 * Read the file before running it. It is generated, not trusted: it says at
 * the top what it found, and it only ever adds — no DROP, no ALTER TYPE, no
 * change to a column that already exists. A rename therefore shows up as a new
 * column, and dropping the old one stays a deliberate, human decision.
 *
 * Verify it the way scripts/README.md describes — apply it to a copy of the
 * old schema and diff the dumps against the pushed one — and then run it with
 * scripts/run-sql.mjs.
 *
 * Needs `pg_dump` on PATH, at a version no older than the servers.
 */

import { execFileSync } from "node:child_process";
import { Pool } from "pg";

const SOURCE = process.env.SOURCE_URL;
const TARGET = process.env.TARGET_URL;

if (!SOURCE || !TARGET) {
  console.error(
    "Set both:\n" +
      "  SOURCE_URL  a scratch database that push-schema.mts has just built\n" +
      "  TARGET_URL  the database to bring up to it (read-only here)\n",
  );
  process.exit(1);
}

if (SOURCE === TARGET) {
  console.error("SOURCE_URL and TARGET_URL are the same database — nothing to compare.");
  process.exit(1);
}

function connect(uri) {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(uri) || uri.includes("sslmode=disable");
  return new Pool({ connectionString: uri, ssl: local ? false : { rejectUnauthorized: false } });
}

/** Every table with its columns, and every enum with its labels. */
async function readSchema(uri) {
  const pool = connect(uri);
  try {
    const { rows: columns } = await pool.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);
    const { rows: enums } = await pool.query(`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typtype = 'e'
    `);

    const tables = new Map();
    for (const row of columns) {
      if (!tables.has(row.table_name)) tables.set(row.table_name, new Set());
      tables.get(row.table_name).add(row.column_name);
    }
    return { tables, enums: new Set(enums.map((row) => row.typname)) };
  } finally {
    await pool.end();
  }
}

/**
 * The column's definition as written, straight from the catalogue rather than
 * rebuilt from information_schema — `pg_get_expr` gives the DEFAULT exactly as
 * Postgres stored it, including the enum casts Payload's defaults carry.
 */
async function columnDefinitions(uri, table, names) {
  const pool = connect(uri);
  try {
    const { rows } = await pool.query(
      `
      SELECT a.attname AS name,
             format_type(a.atttypid, a.atttypmod) AS type,
             pg_get_expr(d.adbin, d.adrelid) AS default_expr,
             a.attnotnull AS not_null,
             a.attidentity AS identity
      FROM pg_attribute a
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = $1::regclass AND a.attnum > 0 AND NOT a.attisdropped
        AND a.attname = ANY($2::text[])
      ORDER BY a.attnum
      `,
      [`public.${table}`, [...names]],
    );
    return rows;
  } finally {
    await pool.end();
  }
}

/** The indexes on a table, as CREATE INDEX statements. */
async function indexDefinitions(uri, tables) {
  const pool = connect(uri);
  try {
    const { rows } = await pool.query(
      `SELECT tablename, indexname, indexdef FROM pg_indexes
       WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
      [tables],
    );
    return rows;
  } finally {
    await pool.end();
  }
}

/** Splits a pg_dump into statements, dropping its session settings and comments. */
function statements(dump) {
  return dump
    .split("\n")
    .filter((line) => !line.startsWith("--") && !line.startsWith("\\"))
    .join("\n")
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !/^(SET|SELECT pg_catalog\.set_config)/i.test(statement));
}

/**
 * The same statement, but safe to run against a database that already has the
 * object. Anything not recognised is passed through inside a DO block that
 * swallows "already exists", which is the honest fallback: it still runs, and
 * a second run is still a no-op.
 */
function idempotent(statement) {
  const dollarQuoted = (body) =>
    `DO $$\nBEGIN\n  ${body};\nEXCEPTION\n  WHEN duplicate_object THEN NULL;\n  WHEN duplicate_table THEN NULL;\n  WHEN duplicate_column THEN NULL;\nEND $$;`;

  if (/^CREATE TABLE /i.test(statement))
    return `${statement.replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ")};`;

  if (/^CREATE (UNIQUE )?INDEX /i.test(statement))
    return `${statement.replace(/^CREATE (UNIQUE )?INDEX /i, (_, unique) => `CREATE ${unique ?? ""}INDEX IF NOT EXISTS `)};`;

  if (/^CREATE SEQUENCE /i.test(statement))
    return `${statement.replace(/^CREATE SEQUENCE /i, "CREATE SEQUENCE IF NOT EXISTS ")};`;

  // A constraint has no IF NOT EXISTS, and adding a second primary key does
  // not raise `duplicate_object` — it raises `invalid_table_definition`, so a
  // blanket EXCEPTION block does not cover it and the file fails the second
  // time it is run. Ask for the constraint by name instead.
  const constraint = /ADD CONSTRAINT (\w+)/i.exec(statement);
  if (constraint) {
    return (
      `DO $$\nBEGIN\n` +
      `  IF NOT EXISTS (\n` +
      `    SELECT 1 FROM pg_constraint\n` +
      `    WHERE conname = '${constraint[1]}' AND connamespace = 'public'::regnamespace\n` +
      `  ) THEN\n` +
      `    ${statement.replace(/\n\s+/g, " ")};\n` +
      `  END IF;\nEND $$;`
    );
  }

  // Enums have no IF NOT EXISTS either, and anything unrecognised is at least
  // made safe to repeat.
  return dollarQuoted(statement);
}

const source = await readSchema(SOURCE);
const target = await readSchema(TARGET);

const missingEnums = [...source.enums].filter((name) => !target.enums.has(name)).sort();
const missingTables = [...source.tables.keys()].filter((name) => !target.tables.has(name)).sort();

const missingColumns = [];
for (const [table, columns] of source.tables) {
  const existing = target.tables.get(table);
  if (!existing) continue;
  const absent = [...columns].filter((column) => !existing.has(column)).sort();
  if (absent.length) missingColumns.push({ table, columns: absent });
}

if (!missingEnums.length && !missingTables.length && !missingColumns.length) {
  console.log("-- Nothing to do: the target already has every table, column and type.");
  process.exit(0);
}

const out = [];
const now = new Date().toISOString().slice(0, 10);

out.push(
  "-- Generated by scripts/generate-catchup-sql.mjs. Do not hand-edit; regenerate.",
  `-- ${now}`,
  "--",
  `-- ${missingTables.length} table(s), ${missingColumns.reduce((n, row) => n + row.columns.length, 0)} column(s)` +
    ` on ${missingColumns.length} existing table(s), ${missingEnums.length} type(s).`,
  "--",
  "-- Additive only: no DROP, no ALTER TYPE, no change to an existing column.",
  "-- Every statement is safe to run twice.",
  "",
  "BEGIN;",
  "",
);

// Types first, and all of them.
//
// `pg_dump -t` dumps the named tables and nothing else — not the enum types
// their columns are declared as. That is not obvious from the output, which
// looks complete, and the file then fails on its first CREATE TABLE against a
// database that has never seen the type. Asking the catalogue directly is both
// simpler and complete.
if (missingEnums.length) {
  const pool = connect(SOURCE);
  const { rows } = await pool.query(
    `SELECT t.typname,
            string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS labels
     FROM pg_type t
     JOIN pg_enum e ON e.enumtypid = t.oid
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = 'public' AND t.typname = ANY($1::text[])
     GROUP BY t.typname
     ORDER BY t.typname`,
    [missingEnums],
  );
  await pool.end();

  out.push(`-- ${rows.length} new type(s).`, "");
  for (const row of rows) {
    out.push(idempotent(`CREATE TYPE public.${row.typname} AS ENUM (${row.labels})`), "");
  }
}

if (missingTables.length) {
  const dump = execFileSync(
    "pg_dump",
    [
      "--schema-only",
      "--no-owner",
      "--no-privileges",
      ...missingTables.flatMap((table) => ["-t", `public.${table}`]),
      SOURCE,
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  out.push(`-- ${missingTables.length} new table(s), with their types, keys and indexes.`, "");
  for (const statement of statements(dump)) out.push(idempotent(statement), "");
}

if (missingColumns.length) {
  out.push(`-- New columns on ${missingColumns.length} existing table(s).`, "");
  for (const { table, columns } of missingColumns) {
    const definitions = await columnDefinitions(SOURCE, table, columns);
    for (const column of definitions) {
      // NOT NULL is deliberately dropped on an added column: the rows already
      // in the target have no value for it, and a NOT NULL without a default
      // cannot be added to a table with rows at all. Payload treats a null the
      // same as an unset field, so this is the shape that works both ways.
      const parts = [`ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`];
      if (column.default_expr && !column.identity) parts.push(`DEFAULT ${column.default_expr}`);
      out.push(`${parts.join(" ")};`);
      if (column.not_null && !column.identity) {
        out.push(
          `-- NOTE: ${table}.${column.name} is NOT NULL in the schema Payload built.` +
            " Left nullable here because existing rows have no value for it.",
        );
      }
    }
    out.push("");
  }

  // The indexes those columns want. Only the ones the target does not have.
  const wanted = await indexDefinitions(SOURCE, missingColumns.map((row) => row.table));
  const have = new Set(
    (await indexDefinitions(TARGET, missingColumns.map((row) => row.table))).map((row) => row.indexname),
  );
  const newIndexes = wanted.filter((row) => !have.has(row.indexname));
  if (newIndexes.length) {
    out.push(`-- ${newIndexes.length} index(es) for those columns.`, "");
    for (const row of newIndexes) out.push(idempotent(row.indexdef), "");
  }
}

out.push("COMMIT;", "");
console.log(out.join("\n"));
