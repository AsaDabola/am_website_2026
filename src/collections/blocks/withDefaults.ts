import type { Block, Field } from "payload";
import { HOME_DEFAULTS, isShippedImage, type BlockDefaults } from "@/lib/homeDefaults";

/**
 * Gives every field of a block the value the site actually shows there.
 *
 * Payload fills a field from its `defaultValue` when the row is created, so a
 * Hero added in the admin now arrives holding the real headline, the real
 * button labels and the real two slides — rather than a column of empty boxes
 * beside a preview of a full page.
 *
 * Done by walking the block's own field list rather than by writing
 * `defaultValue` on each field by hand. Two reasons: it is a hundred fields,
 * and a hand-written default is a second copy of the content that goes stale
 * the first time the English changes. This reads the same messages/en.json the
 * components read.
 *
 * Photographs are skipped. An upload field holds a Media record, and no record
 * exists at the moment a default is applied; the seeder fills those, because
 * it can create them. Everything textual is here.
 */

/** Fields can nest inside rows and collapsibles, which carry no name of their own. */
function isPresentational(field: Field): field is Extract<Field, { fields: Field[] }> {
  return (
    (field.type === "row" || field.type === "collapsible" || field.type === "group") &&
    Array.isArray((field as { fields?: Field[] }).fields)
  );
}

function withDefault(field: Field, defaults: BlockDefaults): Field {
  // A row or collapsible is a layout wrapper: its children are named, it is
  // not, so the same defaults object goes straight through.
  if (isPresentational(field) && !("name" in field && field.name)) {
    return { ...field, fields: field.fields.map((child) => withDefault(child, defaults)) };
  }

  const name = "name" in field ? field.name : undefined;
  if (!name) return field;

  const value = defaults[name];
  if (value === undefined) return field;

  // An upload field wants a record id, and there is none to give yet.
  if (field.type === "upload" || isShippedImage(value)) return field;

  // Spreading a Field loses the discriminant that tells the union which member
  // it is, so the result is re-asserted. The shape is unchanged — one property
  // added to the object that was already a valid Field.
  const withValue = (defaultValue: unknown): Field => ({ ...field, defaultValue } as Field);

  if (field.type === "array" && Array.isArray(value)) {
    // Rows keep their photographs as paths, which Payload would reject on an
    // upload field, so they come out here too — the seeder puts them back.
    return withValue(
      (value as Record<string, unknown>[]).map((row) =>
        Object.fromEntries(Object.entries(row).filter(([, item]) => !isShippedImage(item))),
      ),
    );
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return withValue(value);
  }

  return field;
}

/** The same block, with the site's own content as its defaults. */
export function withHomeDefaults(block: Block): Block {
  const defaults = HOME_DEFAULTS[block.slug];
  if (!defaults) return block;
  return { ...block, fields: block.fields.map((field) => withDefault(field, defaults)) };
}
