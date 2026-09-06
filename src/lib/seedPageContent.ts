import fs from "node:fs";
import path from "node:path";
import type { getPayload } from "payload";
import { HOME_DEFAULTS, HOME_BLOCK_ORDER, isShippedImage } from "@/lib/homeDefaults";
import { PAGE_DEFAULTS, isMarkdown } from "@/lib/pageDefaults";
import { BUILT_IN_PAGES } from "@/lib/builtInPages";
import { markdownToLexical } from "../../scripts/lib/markdownToLexical.mjs";

/**
 * Puts the site's own content into the page editor, so the fields hold what
 * the page actually shows.
 *
 * This is the logic of scripts/seed-page-content.mts, moved somewhere the app
 * itself can run it. The script cannot: `tsx` compiles payload.config.ts as
 * CommonJS (the project has no `"type": "module"`), and payload's
 * bin/loadEnv.js default-imports `@next/env`, which has no default export
 * across that interop boundary. It throws before reaching any of this, the
 * script is deliberately non-fatal, and so every deploy has quietly seeded
 * nothing — which is why the admin shows empty boxes beside a full preview.
 *
 * Run from inside Next, the config loads the same way the admin loads it, so
 * the same work happens without touching that module boundary at all.
 *
 * It only ever fills a field that is empty, so a headline someone has written
 * is never overwritten and a second run changes nothing.
 */

type Payload = Awaited<ReturnType<typeof getPayload>>;

export type SeedReport = {
  /** One line per page touched, naming the fields filled. */
  pages: { page: string; filled: string[] }[];
  /** Images named by the defaults that are not in public/ — left empty. */
  missingImages: string[];
  dryRun: boolean;
};

/** Empty means "nobody has put anything here", not "somebody typed nothing". */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * The Media record for one of the site's own photographs, made if it is not
 * there yet. Matched on filename first, so an image already in the library is
 * reused rather than duplicated — which is also what makes this work on
 * Vercel, where public/ is not reliably readable from a serverless function:
 * anything already uploaded is found, and anything not is reported rather
 * than failing the run.
 */
async function mediaFor(
  payload: Payload,
  imagePath: string,
  cache: Map<string, number | string | null>,
  report: SeedReport,
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

  const file = path.join(process.cwd(), "public", imagePath);
  if (!fs.existsSync(file)) {
    report.missingImages.push(imagePath);
    cache.set(imagePath, null);
    return null;
  }
  if (report.dryRun) return null;

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
  cache: Map<string, number | string | null>,
  filled: string[],
  report: SeedReport,
): Promise<Record<string, unknown> | null> {
  const out = { ...block };
  let changed = false;

  for (const [key, value] of Object.entries(defaults)) {
    if (!isEmpty(out[key])) continue;

    if (isShippedImage(value)) {
      const id = await mediaFor(payload, value, cache, report);
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
            const id = await mediaFor(payload, rowValue, cache, report);
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

export async function seedPageContent(
  payload: Payload,
  { dryRun = false }: { dryRun?: boolean } = {},
): Promise<SeedReport> {
  const report: SeedReport = { pages: [], missingImages: [], dryRun };
  const cache = new Map<string, number | string | null>();

  /* ------------------------------------------------------- the home pages */

  // Every home page on the network: the main site's, and each country's that
  // has one. A country that has never customised its home page has no record
  // and is left alone — it renders the main version, which is the design.
  const found = await payload.find({
    collection: "pages",
    where: { isHome: { equals: true } },
    limit: 200,
    depth: 0,
  });

  let homes = found.docs as unknown as {
    id: number | string;
    title?: string;
    tenant?: unknown;
    sections?: Record<string, unknown>[] | null;
  }[];

  if (!homes.some((page) => !page.tenant) && !dryRun) {
    const created = await payload.create({
      collection: "pages",
      data: { title: "Home", slug: "", isHome: true, published: true, sections: [] } as never,
    });
    homes = [...homes, created as never];
  }

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
      const updated = await fill(payload, block, defaults, cache, filled, report);
      next.push(updated ?? block);
      byType.delete(type);
    }

    // Anything else an editor put there stays, after the standard sections.
    for (const block of byType.values()) next.push(block);

    if (filled.length === 0) continue;
    report.pages.push({ page: String(doc.title ?? doc.id), filled });

    if (!dryRun) {
      await payload.update({ collection: "pages", id: doc.id, data: { sections: next } as never });
    }
  }

  /* ------------------------------------------ the rest of the site's pages */

  // The main site's copy of each built-in page. A country's own version, if it
  // has one, is left alone: it follows the main site until it says otherwise.
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

  const titles = new Map(BUILT_IN_PAGES.map((entry) => [entry.route, entry.title]));

  // Every page the site has gets an entry, not only the ones with sections to
  // seed. A page missing from /admin reads as a page that cannot be edited.
  if (!dryRun) {
    for (const entry of BUILT_IN_PAGES) {
      const slug = entry.route.replace(/^\//, "");
      if (bySlug.has(slug)) continue;
      const made = (await payload.create({
        collection: "pages",
        data: { title: entry.title, slug, builtIn: true, published: true } as never,
      })) as never as { id: number; slug?: string; layout?: unknown[] };
      bySlug.set(slug, made);
    }
  }

  for (const [route, seed] of Object.entries(PAGE_DEFAULTS)) {
    const slug = route.replace(/^\//, "");
    let page = bySlug.get(slug);

    if (!page) {
      if (dryRun) {
        report.pages.push({ page: route, filled: ["(entry would be created and filled)"] });
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
    }

    if ((page.layout ?? []).length > 0) continue;

    const filled: string[] = [];
    const blocks: Record<string, unknown>[] = [];
    for (const seedBlock of seed.blocks) {
      const { blockType, ...rest } = seedBlock;
      const made = await fill(payload, { blockType }, rest, cache, filled, report);
      blocks.push(made ?? { blockType });
    }

    report.pages.push({ page: route, filled: [`${blocks.length} section(s)`, ...filled] });

    if (!dryRun) {
      await payload.update({
        collection: "pages",
        id: page.id,
        data: { layout: blocks, layoutMode: seed.mode } as never,
      });
    }
  }

  return report;
}
