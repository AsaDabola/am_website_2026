# Database scripts

## The problem these exist to solve

Payload's `push: true` in `src/payload.config.ts` is **development-only**. The
Postgres adapter gates it on `NODE_ENV !== 'production'`, so it never runs on
Vercel, whatever the setting suggests.

That means: **a field added to a collection creates its column on your machine
and never on the deployed database.** And the failure is silent, because every
query in this codebase is wrapped in a `catch` that falls back to defaults —
`fetchCollectionSafely`, `getActiveTenantRows`, `getPostsList` and the rest. A
missing column does not produce an error page. It produces an empty country
switcher, an empty news feed, "chapters coming soon" on every site.

So whenever you add or rename a field, you also have to add its column to the
deployed database. These scripts are how.

## Adding a field: the whole procedure

1. Add the field to the collection as normal.

2. Start a throwaway Postgres and let Payload build the schema it now wants:

   ```bash
   createdb scratch
   POSTGRES_URL='postgres://localhost/scratch' node --import tsx scripts/push-schema.mts
   ```

3. See exactly what is missing from the deployed database:

   ```bash
   POSTGRES_URL='postgres://localhost/scratch' node scripts/inventory-schema.mjs > /tmp/wanted.txt
   POSTGRES_URL='<the Vercel connection string>' node scripts/inventory-schema.mjs > /tmp/live.txt
   diff /tmp/live.txt /tmp/wanted.txt
   ```

   Lines only in `wanted.txt` are the drift.

4. Write the DDL for those lines into a `.sql` file here, then **verify it** —
   apply it to a *second* scratch database holding the old schema and confirm
   the dumps match:

   ```bash
   pg_dump --schema-only --no-owner --no-privileges "$OLD" > /tmp/patched.sql
   pg_dump --schema-only --no-owner --no-privileges "$NEW" > /tmp/pushed.sql
   diff /tmp/patched.sql /tmp/pushed.sql   # must be empty
   ```

   This is not optional ceremony. Payload's adapter cares about exact table and
   column names — `shareWithContinents` becomes a table called
   `posts_share_with_continents` with a column called `value` of a generated
   enum type — and hand-written guesses at that shape fail in the same silent
   way the missing column did.

5. Apply it to the deployed database:

   ```bash
   POSTGRES_URL='<the Vercel connection string>' node scripts/run-sql.mjs scripts/your-file.sql
   ```

6. Regenerate the committed snapshot so the next person can diff against it
   without any of the above:

   ```bash
   POSTGRES_URL='postgres://localhost/scratch' node scripts/inventory-schema.mjs > scripts/schema.expected.txt
   ```

## Checking for drift at any time

`scripts/schema.expected.txt` is the schema the current collections describe.
To find out what a database is missing, one command:

```bash
POSTGRES_URL='<connection string>' node scripts/inventory-schema.mjs | diff - scripts/schema.expected.txt
```

Anything shown as only in `schema.expected.txt` is a column the code will
select and the database does not have — which is to say, a feature that is
quietly switched off.

## A blank screen in /admin

A list view that renders the sidebar and nothing else is a missing column.
Payload selects every field of the collection, Postgres rejects the query, and
the page has no error to show you. To find out which collection and which
column, without reading a schema diff:

```bash
POSTGRES_URL='<connection string>' node --import tsx scripts/probe-collections.mts
```

It runs the same query the list view runs, once per collection, and prints the
failures:

```
FAIL  pages
pages: column pages__blocks_getInvolved_cards.description does not exist
```

Read-only, and safe against the deployed database — `find` with limit 1, and
`NODE_ENV` forced to production so `push` cannot fire. Exits non-zero if
anything failed, so it works in a deploy check.

## The files

| File | What it does |
| --- | --- |
| `push-schema.mts` | Boots Payload in development so `push` builds the schema. **Never point at production.** |
| `inventory-schema.mjs` | Read-only. Prints every table, column and enum, for diffing. |
| `probe-collections.mts` | Read-only. Runs each admin list view's query and names the collections that fail. |
| `schema.expected.txt` | Committed snapshot of what the collections currently describe. |
| `run-sql.mjs` | Applies a `.sql` file to the database in `POSTGRES_URL`. |
| `fix-tenants-schema.sql` | Adds `tenants.languages` and the other early missing columns. |
| `fix-tenant-footer-columns.sql` | Adds `tenants.org_name`, `address`, `contact_email`. |
| `add-continent-syndication.sql` | Adds the `shareWithContinents` tables for Posts and Events. |
| `catch-up-missing-collections.sql` | The big one. Four whole collections and 40 locale values that never reached the deployed database. |
| `add-internship-applications.sql` | Adds the Internship Applications collection. |
| `add-get-involved-card-description.sql` | Adds `description` to the Get Involved cards, and the message keys it introduced. |
| `copy-flags.mjs` | Copies country flag SVGs into `public/flags`. |

## A note on connection strings

`vercel env pull` redacts variables marked sensitive, so a pulled `.env` can
contain the literal text `[SENSITIVE]` instead of a connection string. Both
scripts here reject that up front rather than letting it fail later as a DNS
error. Copy the real value from the Vercel dashboard under
Storage → your database → connection string.
