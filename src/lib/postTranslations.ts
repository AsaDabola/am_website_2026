import type { Payload } from "payload";

import { dbPool } from "@/lib/dbPool";

/**
 * The translated wording for articles, read one page at a time.
 *
 * Articles are written in one language — usually English on amintl.org, or the
 * country's own language on a country site — and the site is read in
 * forty-seven. This holds the translated title, summary and body for each
 * article in each language, so a reader in Seoul gets the headline in Korean
 * rather than a wall of English in the middle of an otherwise Korean page.
 *
 * Filled by `npm run translate-posts`. Never required: an article with no
 * translation for the language being read falls back to the words it was
 * written in, which is what the site did before any of this existed.
 *
 * Not a Payload collection, and for the same reason the traffic counters are
 * not — see the note in lib/traffic.ts. Being one would put a column on
 * payload_locked_documents_rels, and shipping that before the SQL has run
 * takes out every document screen in the admin. Here it means the site works
 * identically whether the table exists or not.
 *
 * Read in bulk rather than per article: a listing shows twelve articles, and
 * twelve round trips to translate one page is the difference between a page
 * that loads and one that does not.
 */

export type PostTranslation = {
  title?: string;
  excerpt?: string;
  body?: unknown;
};

/** The language articles are stored in. Never translated to or from itself. */
export const SOURCE_LOCALE = "en";

export async function getPostTranslations(
  payload: Payload,
  ids: (string | number)[],
  locale: string,
): Promise<Map<string, PostTranslation>> {
  const found = new Map<string, PostTranslation>();
  if (!ids.length || !locale || locale === SOURCE_LOCALE) return found;

  try {
    const { rows } = await dbPool(payload).query(
      `SELECT post_id, title, excerpt, body
         FROM post_translations
        WHERE locale = $1 AND post_id = ANY($2::int[])`,
      [locale, ids.map((id) => Number(id)).filter(Number.isFinite)],
    );

    for (const row of rows) {
      found.set(String(row.post_id), {
        title: typeof row.title === "string" && row.title ? row.title : undefined,
        excerpt: typeof row.excerpt === "string" && row.excerpt ? row.excerpt : undefined,
        body: row.body ?? undefined,
      });
    }
  } catch {
    // No table yet, or the database is unhappy. Either way the article still
    // reads in the language it was written in, which is the fallback the whole
    // design leans on.
  }

  return found;
}
