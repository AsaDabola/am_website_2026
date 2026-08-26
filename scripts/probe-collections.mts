/**
 * Answers "which admin screens are broken, and why".
 *
 * A blank list view in /admin is what a missing column looks like: Payload
 * selects every field of the collection, Postgres rejects the query, and the
 * page renders nothing. The screen gives you no error, so this runs the same
 * query per collection against whatever database you point it at and prints
 * the ones that throw, with the failing SQL.
 *
 *   POSTGRES_URL='<the Vercel connection string>' \
 *     node --import tsx scripts/probe-collections.mts
 *
 * Read-only: it does a `find` with limit 1 and writes nothing. Safe against
 * the deployed database.
 *
 * NODE_ENV is forced to production so `push` cannot fire — without it, running
 * this against a scratch database would quietly migrate it, and running it
 * against a database that is behind would hide the very drift you came to
 * find. See scripts/README.md.
 */
(process.env as Record<string, string>).NODE_ENV = "production";

// Every collection the admin lists. A new collection needs adding here, or a
// missing column in it goes unreported.
const COLLECTIONS = [
  "users",
  "media",
  "campuses",
  "events",
  "posts",
  "ministries",
  "bible-study-signups",
  "volunteer-applications",
  "internship-applications",
  "tenants",
  "pages",
  "contact-messages",
  "donation-intents",
  "partners",
  "invoices",
  "chapter-affiliations",
  "membership-applications",
  "tenant-content",
];

// Imported after NODE_ENV is set: the config reads it as it loads.
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config.ts");

const payload = await getPayload({ config });

/**
 * Drizzle wraps the driver's error and puts the whole generated SQL in its
 * message — thousands of characters, with the one useful sentence ("column
 * ... does not exist") hidden underneath as the cause. Report the cause.
 */
function explain(error: unknown): string {
  let current: unknown = error;
  while (current instanceof Error) {
    if (!current.message.startsWith("Failed query:")) return current.message;
    if (!(current.cause instanceof Error)) break;
    current = current.cause;
  }
  return current instanceof Error ? current.message.split("\n")[0] : String(current);
}

const failures: string[] = [];

for (const collection of COLLECTIONS) {
  try {
    await payload.find({ collection: collection as never, limit: 1, depth: 0 });
    console.log(`ok    ${collection}`);
  } catch (error) {
    console.log(`FAIL  ${collection}`);
    failures.push(`${collection}: ${explain(error)}`);
  }
}

if (failures.length > 0) {
  console.log(`\n${failures.length} collection(s) failing:\n`);
  for (const failure of failures) console.log(`${failure}\n`);
}

process.exit(failures.length > 0 ? 1 : 0);
