import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { seedPageContent } from "@/lib/seedPageContent";

/**
 * Fills every page's editor with the content that page actually shows.
 *
 * The equivalent of scripts/seed-page-content.mts, but through Payload's local
 * API instead of a standalone process — the same arrangement the other seed
 * routes here use, and for a sharper reason than convenience: that script has
 * never once run. It loads payload.config.ts through `tsx`, which compiles it
 * as CommonJS, and payload's bin/loadEnv.js default-imports `@next/env`, which
 * has no default export across that boundary. Every deploy prints
 * "Could not seed page content: Cannot destructure property 'loadEnvConfig'"
 * and carries on, because the script is deliberately non-fatal. So the content
 * written into HOME_DEFAULTS and PAGE_DEFAULTS reached the repository and
 * never reached the database, and the admin shows empty fields beside a
 * preview of a full page.
 *
 * Inside Next the config loads exactly as the admin loads it, so none of that
 * applies.
 *
 * GET reports what it would fill, and writes nothing. POST does the write.
 * Both require a logged-in admin session. Only empty fields are ever filled,
 * so running it twice changes nothing the second time and no wording anyone
 * has written is overwritten.
 */

async function requireAdmin(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  return user ? payload : null;
}

export async function GET(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const report = await seedPageContent(payload, { dryRun: true });
  return NextResponse.json({ ok: true, ...report });
}

export async function POST(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const report = await seedPageContent(payload);
  return NextResponse.json({
    ok: true,
    message:
      report.pages.length === 0
        ? "Every page already holds its content. Nothing to fill."
        : `Filled ${report.pages.length} page(s).`,
    ...report,
  });
}
