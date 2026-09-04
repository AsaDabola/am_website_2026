import type { Payload } from "payload";
import { dbPool } from "@/lib/dbPool";
import type { PageBlockData } from "./pageBlockTypes";

/**
 * The translated wording for a page's authored sections.
 *
 * The built-in pages take their words from messages/*.json, translated into
 * all forty-eight languages. Rebuilding one of them out of editable sections
 * would put fixed English in place of that on sixty-eight country sites, so
 * the sections carry their own translations instead — seeded from the same
 * catalogue when a page is converted, and topped up by the translation script
 * for anything written afterwards.
 *
 * Addressed by the ids Payload gives each block and each array row, so
 * reordering sections in the admin does not shuffle the translations
 * underneath them.
 *
 * Never required. No table, no row, no value for a field: the section shows
 * the words it was written in, which is the same fallback the articles use.
 * Not a Payload collection, for the reason in the header of
 * scripts/add-page-translations.sql.
 */

/** The language sections are authored in. Never translated to or from itself. */
export const SOURCE_LOCALE = "en";

type Values = Record<string, unknown>;

async function readValues(
  payload: Payload,
  pageId: string | number,
  locale: string,
): Promise<Values | null> {
  const id = Number(pageId);
  if (!Number.isFinite(id) || !locale || locale === SOURCE_LOCALE) return null;

  try {
    const { rows } = await dbPool(payload).query(
      `SELECT "values" FROM page_translations WHERE page_id = $1 AND locale = $2 LIMIT 1`,
      [id, locale],
    );
    const values = rows[0]?.values;
    return values && typeof values === "object" ? (values as Values) : null;
  } catch {
    // No table yet, or no database: the page reads in the language it was
    // written in rather than not reading at all.
    return null;
  }
}

/**
 * One section with its text swapped for the translated text.
 *
 * Walks the block and every array row inside it. Anything carrying an `id`
 * contributes a prefix, so a field's address is stable across reordering. A
 * value is only substituted when it is the same shape as the original — a
 * string for a string, an object for a rich text document — so a stale or
 * malformed row cannot put an object where the renderer expects a sentence.
 */
function apply(node: unknown, values: Values, prefix: string): unknown {
  if (Array.isArray(node)) return node.map((item) => apply(item, values, prefix));
  if (!node || typeof node !== "object") return node;

  const source = node as Record<string, unknown>;
  const id = typeof source.id === "string" || typeof source.id === "number" ? String(source.id) : null;
  // A block or array row starts a new address; anything else (a group, a rich
  // text node) stays under the one it is inside.
  const here = id ? (prefix ? `${prefix}.${id}` : id) : prefix;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") {
      const translated = values[`${here}.${key}`];
      out[key] = typeof translated === "string" && translated ? translated : value;
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value) && "root" in value) {
      // A rich text document: translated as a whole, the way an article body
      // is, because its text lives in nested nodes rather than in one field.
      const translated = values[`${here}.${key}`];
      out[key] =
        translated && typeof translated === "object" && "root" in (translated as object)
          ? translated
          : value;
      continue;
    }

    // A nested object or array extends the address by its field name, so an
    // array row reads as "<block id>.cards.<row id>.title" — which is what the
    // seeder writes and what add-page-translations.sql documents.
    out[key] = apply(value, values, here ? `${here}.${key}` : key);
  }
  return out;
}

/**
 * A page's sections in the language being read.
 *
 * One query for the whole page rather than one per section, and a page with
 * nothing stored comes back exactly as it went in.
 */
export async function translateSections(
  payload: Payload,
  pageId: string | number,
  locale: string,
  sections: PageBlockData[],
): Promise<PageBlockData[]> {
  if (!sections.length) return sections;
  const values = await readValues(payload, pageId, locale);
  if (!values) return sections;
  return sections.map((block) => apply(block, values, "") as PageBlockData);
}
