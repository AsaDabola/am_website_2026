/**
 * Boots Payload in development against whatever database POSTGRES_URL points
 * at, so the adapter's `push` builds the schema the collections describe.
 *
 * This exists to *generate* migration SQL, not to run one. `push` is
 * development-only — it never runs on Vercel — so the way to find out what a
 * new field needs in production is to push the schema into a throwaway
 * database before and after adding the field and diff the two dumps. See
 * scripts/README.md for the whole procedure.
 *
 * Never point this at the production database.
 *
 *   POSTGRES_URL=postgres://…/scratch node --import tsx scripts/push-schema.mts
 */

// Set before the config is loaded: `push` is gated on NODE_ENV, and the config
// reads the secret at module scope. Hence the dynamic imports below — a static
// `import` is hoisted above these assignments and would see neither.
// NODE_ENV is typed read-only by @types/node; setting it is the entire point
// here, since `push` is gated on it.
(process.env as Record<string, string>).NODE_ENV = "development";
process.env.PAYLOAD_SECRET ||= "scratch-secret-for-schema-generation";
process.env.NEXT_PUBLIC_SERVER_URL ||= "http://localhost:3000";

async function main() {
  const { getPayload } = await import("payload");
  const config = (await import("../src/payload.config")).default;

  const payload = await getPayload({ config });
  await payload.db.destroy?.();
  console.log("schema pushed");
  process.exit(0);
}

void main();
