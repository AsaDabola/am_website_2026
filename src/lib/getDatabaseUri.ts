/**
 * Vercel's Neon integration doesn't always inject the same env var name
 * (it varies by how the integration was connected), so check the common
 * aliases in order of preference — pooled connection first.
 *
 * Falls back to an unreachable placeholder instead of throwing so that
 * `next build` still succeeds before the Neon integration is connected —
 * pages that don't touch the database render fine; anything that does
 * will fail at request time with a clear connection error until a real
 * connection string is set.
 */
export function getDatabaseUri(): string {
  const uri =
    process.env.DATABASE_URI ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!uri) {
    console.warn(
      "[payload] No database connection string found (DATABASE_URI / POSTGRES_URL / DATABASE_URL). " +
        "Connect the Neon storage integration on Vercel, or set DATABASE_URI locally. Using a placeholder for now.",
    );
    return "postgres://placeholder:placeholder@localhost:5432/placeholder";
  }

  return uri;
}
