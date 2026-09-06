/**
 * Puts the site's own content into the page editor, so the fields hold what
 * the page actually shows.
 *
 *   npm run seed-content              # fill anything empty
 *   npm run seed-content -- --dry-run # say what it would fill, change nothing
 *
 * ## Why
 *
 * Opening the home page in the admin used to show empty boxes beside a preview
 * of a full page. Every field had a value; the value lived in the components
 * and in messages/en.json, and "leave it empty and the site uses its own" is a
 * reasonable thing for a renderer to do and an unreasonable thing to show an
 * editor. It tells them their page has no content and then contradicts itself
 * on the right-hand side of the screen.
 *
 * Two halves fix it, and this is the second:
 *
 *   - collections/blocks/withDefaults gives every field a `defaultValue`, so a
 *     block added from now on arrives holding the real content;
 *   - this fills the blocks that already exist and were saved empty, which
 *     `defaultValue` cannot reach — it applies at creation, and these rows were
 *     created long ago.
 *
 * ## What it will and will not touch
 *
 * It only ever fills a field that is empty. A headline someone has written is
 * never overwritten, and running it twice changes nothing the second time —
 * which is what makes it safe to run on every deploy.
 *
 * Photographs become Media records, because an upload field holds a record and
 * not a path. They are uploaded once and matched by filename afterwards, so a
 * second run reuses them rather than filling the library with copies.
 *
 * Never fatal. If it cannot reach the database or an image is missing it says
 * so and returns cleanly, because a deploy should not fail over seeding
 * content that the site can already render without.
 */

(process.env as Record<string, string>).NODE_ENV = "production";

import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

type Payload = Awaited<ReturnType<typeof import("payload")["getPayload"]>>;

/** Empty means "nobody has put anything here", not "somebody typed nothing". */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * The Media record for one of the site's own photographs, made if it is not
 * there yet. Matched on filename, which is what Payload stores and what makes
 * a second run reuse rather than duplicate.
 */
async function mediaFor(
  payload: Payload,
  imagePath: string,
  cache: Map<string, number | string>,
): Promise<number | string | null> {
  if (cache.has(imagePath)) return cache.get(imagePath)!;

  const filename = path.basename(imagePath);
  const found = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  });
  if (found.docs[0]) {
    const id = (found.docs[0] as { id: number | string }).id;
    cache.set(imagePath, id);
    return id;
  }

  const file = path.join(ROOT, "public", imagePath);
  if (!fs.existsSync(file)) {
    console.warn(`  ! ${imagePath} is not in public/images — left empty`);
    return null;
  }
  if (DRY_RUN) return null;

  // Media requires alt text, and an empty string is not it. The filename is a
  // poor description and a truthful placeholder — better than blocking the
  // seed, and it reads as something to improve rather than as a real caption.
  const created = await payload.create({
    collection: "media",
    data: { alt: filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ") } as never,
    file: {
      data: fs.readFileSync(file),
      name: filename,
      mimetype: filename.endsWith(".svg") ? "image/svg+xml" : "image/webp",
      size: fs.statSync(file).size,
    },
  });
  const id = (created as { id: number | string }).id;
  cache.set(imagePath, id);
  return id;
}

/**
 * One block's defaults, with the photographs turned into Media records and
 * anything the editor has already filled in left exactly as it was.
 *
 * Returns null when there was nothing to add, so the caller can tell a block
 * that needed filling from one that did not.
 */
async function fill(
  payload: Payload,
  block: Record<string, unknown>,
  defaults: Record<string, unknown>,
  cache: Map<string, number | string>,
  filled: string[],
): Promise<Record<string, unknown> | null> {
  const { isShippedImage } = await import("../src/lib/homeDefaults");
  const { isMarkdown } = await import("../src/lib/pageDefaults");
  const { markdownToLexical } = await import("./lib/markdownToLexical.mjs");
  const out = { ...block };
  let changed = false;

  for (const [key, value] of Object.entries(defaults)) {
    if (!isEmpty(out[key])) continue;

    if (isShippedImage(value)) {
      const id = await mediaFor(payload, value, cache);
      if (id === null) continue;
      out[key] = id;
      filled.push(`${block.blockType}.${key}`);
      changed = true;
      continue;
    }

    // Prose is written as markdown, because the field behind it stores a
    // Lexical document and one written by hand cannot be proofread.
    if (isMarkdown(value)) {
      out[key] = markdownToLexical(value.markdown);
      filled.push(`${block.blockType}.${key}`);
      changed = true;
      continue;
    }

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      // A group — `appearance`, mostly. Copied whole; there is nothing inside
      // one that needs resolving.
      out[key] = value;
      filled.push(`${block.blockType}.${key}`);
      changed = true;
      continue;
    }

    if (Array.isArray(value)) {
      const rows: Record<string, unknown>[] = [];
      for (const row of value as Record<string, unknown>[]) {
        const made: Record<string, unknown> = {};
        for (const [rowKey, rowValue] of Object.entries(row)) {
          if (isShippedImage(rowValue)) {
            const id = await mediaFor(payload, rowValue, cache);
            if (id !== null) made[rowKey] = id;
          } else made[rowKey] = rowValue;
        }
        rows.push(made);
      }
      if (rows.length === 0) continue;
      out[key] = rows;
      filled.push(`${block.blockType}.${key} (${rows.length})`);
      changed = true;
      continue;
    }

    out[key] = value;
    filled.push(`${block.blockType}.${key}`);
    changed = true;
  }

  return changed ? out : null;
}

async function main() {
  const { getPayload } = await import("payload");
  const config = (await import("../src/payload.config")).default;
  const { HOME_DEFAULTS, HOME_BLOCK_ORDER } = await import("../src/lib/homeDefaults");

  const payload = await getPayload({ config });
  const cache = new Map<string, number | string>();

  // Every home page on the network: the main site's, and each country's that
  // has one. A country that has never customised its home page has no record
  // and is left alone — it renders the main version, which is the design.
  const pages = await payload.find({
    collection: "pages",
    where: { isHome: { equals: true } },
    limit: 200,
    depth: 0,
  });

  // The main site must have a home page for there to be anything to edit. A
  // country without one is left alone on purpose — it renders the main site's
  // homepage, which is the design, and giving every country a full copy is
  // exactly the 68-way merge the wording system exists to avoid.
  let homes = pages.docs as unknown as {
    id: number | string;
    title?: string;
    tenant?: unknown;
    sections?: Record<string, unknown>[] | null;
  }[];

  if (!homes.some((page) => !page.tenant)) {
    if (DRY_RUN) {
      console.log("The main site has no home page; it would be created.");
    } else {
      const created = await payload.create({
        collection: "pages",
        data: { title: "Home", slug: "", isHome: true, published: true, sections: [] } as never,
      });
      console.log("Created the main site's home page.");
      homes = [...homes, created as never];
    }
  }

  let touched = 0;
  for (const doc of homes) {
    const sections = doc.sections ?? [];
    const byType = new Map(sections.map((block) => [String(block.blockType), block]));

    const filled: string[] = [];
    const next: Record<string, unknown>[] = [];

    // Every section the page draws, in the order it draws them — not only the
    // ones that happen to be saved. A page missing nine of its twelve sections
    // is the same complaint as a section missing its text: the editor does not
    // show what the page is.
    for (const type of HOME_BLOCK_ORDER) {
      const existing = byType.get(type);
      const defaults = HOME_DEFAULTS[type];
      if (!existing) filled.push(`+ ${type}`);
      const block = existing ?? { blockType: type };
      const updated = await fill(payload, block, defaults, cache, filled);
      next.push(updated ?? block);
      byType.delete(type);
    }

    // Anything else an editor put there stays, after the standard sections.
    for (const block of byType.values()) next.push(block);

    if (filled.length === 0) continue;
    touched += 1;
    console.log(`\n${doc.title ?? doc.id}: ${filled.length} field(s)`);
    for (const one of filled) console.log(`  ${one}`);

    if (!DRY_RUN) {
      await payload.update({ collection: "pages", id: doc.id, data: { sections: next } as never });
    }
  }

  /* ------------------------------------------ the rest of the site's pages */

  const { PAGE_DEFAULTS } = await import("../src/lib/pageDefaults");
  const routes = Object.entries(PAGE_DEFAULTS);

  if (routes.length) {
    // The main site's copy of each built-in page. A country's own version, if
    // it has one, is left alone: it follows the main site until it says
    // otherwise, which is how the wording works and how this should too.
    const built = await payload.find({
      collection: "pages",
      where: { builtIn: { equals: true }, tenant: { exists: false } },
      limit: 200,
      depth: 0,
    });
    const bySlug = new Map(
      (built.docs as unknown as { id: number | string; slug?: string; layout?: unknown[] }[]).map(
        (page) => [String(page.slug ?? ""), page],
      ),
    );

    const { BUILT_IN_PAGES } = await import("../src/lib/builtInPages");
    const titles = new Map(BUILT_IN_PAGES.map((entry) => [entry.route, entry.title]));

    for (const [route, seed] of routes) {
      const slug = route.replace(/^\//, "");
      let page = bySlug.get(slug);

      // Make the entry rather than telling someone to run another script.
      // "Remember to run X first" is the shape of the problem this is fixing.
      if (!page) {
        if (DRY_RUN) {
          console.log(`${route}: no Pages entry; it would be created and filled.`);
          continue;
        }
        page = (await payload.create({
          collection: "pages",
          data: {
            title: titles.get(route) ?? slug,
            slug,
            builtIn: true,
            published: true,
          } as never,
        })) as never;
        console.log(`  created the Pages entry for ${route}`);
      }

      if ((page.layout ?? []).length > 0) continue;

      const filled: string[] = [];
      const blocks: Record<string, unknown>[] = [];
      for (const seedBlock of seed.blocks) {
        const { blockType, ...rest } = seedBlock;
        const made = await fill(payload, { blockType }, rest, cache, filled);
        blocks.push(made ?? { blockType });
      }

      touched += 1;
      console.log(`\n${route}: ${blocks.length} section(s)`);
      if (!DRY_RUN) {
        await payload.update({
          collection: "pages",
          id: page.id,
          data: { layout: blocks, layoutMode: seed.mode } as never,
        });
      }
    }
  }

  // Named so it reads as a fact rather than as nothing having happened.
  console.log(
    touched === 0
      ? "\nEvery home page already holds its content. Nothing to fill."
      : `\n${touched} page(s) ${DRY_RUN ? "would be" : "were"} filled in.`,
  );
  void HOME_BLOCK_ORDER;
  await payload.db.destroy?.();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // Deliberately not fatal: the site renders these sections with or without
    // the records, so a deploy must not fail because seeding could not run.
    console.warn(`\nCould not seed page content: ${(error as Error).message}`);
    process.exit(0);
  });
