import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { BUILT_IN_PAGES } from "@/lib/builtInPages";

/**
 * Lists the site's built-in pages (Who We Are, Bible Studies, Contact Us —
 * everything in src/lib/builtInPages.ts) in the admin's Pages collection, so
 * Pages shows the whole site rather than only what has been added by hand.
 *
 * The equivalent of scripts/seed-built-in-pages.mjs, but through Payload's
 * local API instead of an HTTP login — that script is still there for running
 * from a laptop, but this is what lets the same thing happen from inside the
 * app itself (a button in the admin, or a one-off authenticated request)
 * without needing separate credentials.
 *
 * Main site only, exactly like the standalone script: an entry with no
 * tenant. Matched on slug and skipped if already there, so re-running after
 * adding a page to builtInPages.ts only adds the new one, and a page an
 * editor has since customised (its navLabel, say) is left untouched.
 *
 * GET reports what would be created, without writing. POST does the write.
 * Both require a logged-in admin session.
 */

async function requireAdmin(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  return user ? payload : null;
}

/** The slug a Page record carries for a route: "/about/mission" → "about/mission". */
function slugFor(route: string) {
  return route === "/" ? "" : route.replace(/^\//, "");
}

async function existingMainSiteSlugs(payload: Awaited<ReturnType<typeof getPayload>>) {
  const result = await payload.find({
    collection: "pages",
    where: { tenant: { exists: false } },
    limit: 1000,
    depth: 0,
    pagination: false,
  });
  return new Set(result.docs.map((doc) => String(doc.slug ?? "")));
}

export async function GET(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

  const known = await existingMainSiteSlugs(payload);
  const wouldCreate = BUILT_IN_PAGES.filter((entry) => !known.has(slugFor(entry.route)));

  return NextResponse.json({
    total: BUILT_IN_PAGES.length,
    alreadyListed: BUILT_IN_PAGES.length - wouldCreate.length,
    wouldCreate: wouldCreate.map((entry) => entry.route),
  });
}

export async function POST(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

  const known = await existingMainSiteSlugs(payload);

  const created: string[] = [];
  const failed: { route: string; error: string }[] = [];

  for (const entry of BUILT_IN_PAGES) {
    const slug = slugFor(entry.route);
    if (known.has(slug)) continue;

    try {
      await payload.create({
        collection: "pages",
        data: {
          title: entry.title,
          slug,
          isHome: entry.route === "/",
          published: true,
          builtIn: true,
        },
      });
      created.push(entry.route);
    } catch (error) {
      failed.push({ route: entry.route, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({
    ok: failed.length === 0,
    created,
    skipped: BUILT_IN_PAGES.length - created.length - failed.length,
    failed,
  });
}
