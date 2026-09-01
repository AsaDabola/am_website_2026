import type { Payload } from "payload";

/**
 * The raw connection under Payload's adapter.
 *
 * Two things in this codebase talk SQL rather than going through Payload's
 * own methods — the traffic counters, which need an upsert Payload has no
 * equivalent for, and the article translations, which need one lookup for a
 * page of articles rather than one per article. Both reach the database the
 * same way, through here.
 */
export type Pool = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

export function dbPool(payload: Payload): Pool {
  const candidate = (payload.db as unknown as { pool?: Pool }).pool;
  if (!candidate) throw new Error("The database adapter has no connection pool.");
  return candidate;
}
