/**
 * Every schema change this database needs, in the order it needs them.
 *
 * This list is the contract. `apply-migrations.mjs` runs everything here that a
 * database has not had yet, and it runs as part of `npm run build` — so a
 * deploy carries its own schema and the two cannot come apart. That is the
 * whole point: the admin has been taken down three times by code shipping
 * ahead of its SQL, and "remember to run the file" was never going to hold.
 *
 * ## Adding a migration
 *
 * Write the `.sql` file, then add its name at the **end** of this list. The
 * order here is the order it runs, and it is append-only: a file already in
 * the list has run on databases you cannot see, so moving it changes history
 * rather than the future.
 *
 * You cannot forget this step. `apply-migrations.mjs` fails if a `.sql` file
 * exists in scripts/ that is neither listed here nor named below as a
 * diagnostic — which fails the build, before the deploy.
 *
 * ## What a migration has to be
 *
 * **Idempotent**, and **additive**. Every one of these may be run against a
 * database that already has some or all of it: `CREATE TABLE IF NOT EXISTS`,
 * `ADD COLUMN IF NOT EXISTS`, `DO $$ … EXCEPTION WHEN duplicate_object`. No
 * DROP, no ALTER TYPE, no change to a column that already exists.
 *
 * That is not belt-and-braces. It is what lets this list be replayed against
 * a database whose history is not recorded — which is every database that
 * existed before this runner did.
 *
 * Generate the file rather than writing it: see generate-catchup-sql.mjs and
 * the procedure in README.md.
 */

/**
 * ## The `done` predicate, and why every migration needs one
 *
 * These files existed for a year before this runner did, and they ran against
 * databases whose history nobody wrote down. So on first sight of a database,
 * "has this already been applied?" cannot be answered from a table — it has to
 * be answered from the schema itself. `done` is a SQL expression returning
 * true when the migration's work is already there.
 *
 * A migration whose `done` is true is recorded and **not executed**. That is
 * not an optimisation, it is a safety property. `add-admin-roles.sql` ends
 * with
 *
 *     UPDATE users SET role = 'super-admin' WHERE role = 'country-admin'
 *
 * which was right the once — it stopped the first migration locking everyone
 * out of their own admin. Running it a second time, years later, would
 * silently promote every country admin on the network to super admin. A
 * migration runner that replays history is a runner that hands out
 * permissions nobody granted.
 *
 * So: `done` is checked first, always, for every migration. Write it against
 * the *last* thing the file does where the file is not atomic, so a
 * half-applied migration reads as not done and is completed rather than
 * skipped.
 */

const columnExists = (table, column) =>
  `SELECT EXISTS (SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}')`;

const tableExists = (table) =>
  `SELECT EXISTS (SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = '${table}')`;

const enumHas = (type, label) =>
  `SELECT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = 'public' AND t.typname = '${type}' AND e.enumlabel = '${label}')`;

/** In dependency order, oldest first. Append only. */
export const MIGRATIONS = [
  // The early repairs, from before any of this was written down.
  { file: "fix-tenants-schema.sql", done: columnExists("tenants", "languages") },
  { file: "fix-tenant-footer-columns.sql", done: columnExists("tenants", "contact_email") },
  { file: "fix-tenant-enums.sql", done: enumHas("enum_tenants_continent", "oceania") },
  { file: "catch-up-missing-collections.sql", done: tableExists("membership_applications") },

  { file: "add-continent-syndication.sql", done: tableExists("posts_share_with_continents") },
  { file: "add-internship-applications.sql", done: tableExists("internship_applications") },
  {
    file: "add-get-involved-card-description.sql",
    done: columnExists("pages_blocks_get_involved_cards", "description"),
  },

  // Access control. The note in add-admin-roles.sql is worth reading: without
  // it nobody can sign in to /admin at all. And see the warning above about
  // what re-running this one would do.
  { file: "add-admin-roles.sql", done: columnExists("users", "role") },
  { file: "add-admin-levels.sql", done: enumHas("enum_users_role", "sub-admin") },

  { file: "add-built-in-pages.sql", done: columnExists("pages", "built_in") },
  {
    file: "allow-main-site-wording.sql",
    // The only migration that removes something — a NOT NULL — so being done
    // is the constraint being gone.
    done: `SELECT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'tenant_content'
               AND column_name = 'tenant_id' AND is_nullable = 'YES')`,
  },
  { file: "add-event-order.sql", done: columnExists("events", "sort_order") },
  { file: "add-hero-slides.sql", done: tableExists("pages_blocks_hero_slides") },

  // Not Payload collections, so `push` never builds these two. They were the
  // reason this runner had to exist for local databases as well as deployed
  // ones — see the headers of the files themselves.
  { file: "add-traffic.sql", done: tableExists("traffic") },
  { file: "add-post-translations.sql", done: tableExists("post_translations") },

  // The page builder. `layout_mode` is the column whose absence blanks the
  // Pages screen in the admin, so it is the honest thing to test for.
  { file: "add-page-builder.sql", done: columnExists("pages", "layout_mode") },
  { file: "add-page-translations.sql", done: tableExists("page_translations") },

  // Per-country photographs, alongside the per-country wording that was
  // already there.
  { file: "add-country-images.sql", done: tableExists("tenant_content_images") },

  // The leader records, and the counts built on them. A new collection, which
  // is the change that took the admin down twice — it puts a column on
  // payload_locked_documents_rels, and without it no document in any
  // collection opens. It goes out with the code now instead of after it.
  { file: "add-leaders.sql", done: tableExists("leaders") },
];

/**
 * Files in scripts/ that are SQL but are not migrations.
 *
 * Read-only questions, meant to be run by hand against a database you are
 * trying to understand. Naming them here is what lets the runner treat every
 * *other* unlisted .sql file as a mistake.
 */
export const NOT_MIGRATIONS = [
  "check-schema.sql",
  "check-post-delete.sql",
];
