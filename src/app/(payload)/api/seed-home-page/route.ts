import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { buildHomeSections } from "@/lib/homeSections";
import { routing } from "@/i18n/routing";

// One-time seed: creates the main site's Home Page (tenant empty, isHome
// true) pre-filled with the site's current copy, so an admin can start
// editing/cloning real content instead of an empty form. Safe to call more
// than once — it's a no-op if a Home page already exists.
// Requires a logged-in admin session.
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
  }

  const existing = await payload.find({
    collection: "pages",
    where: { and: [{ tenant: { exists: false } }, { isHome: { equals: true } }] },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return NextResponse.json({ ok: true, message: "Home page already exists", skipped: true });
  }

  // The main site's own page, so the default locale — a country's copy is
  // built in that country's language by the clone endpoint instead.
  const locale = routing.defaultLocale;

  const page = await payload.create({
    collection: "pages",
    data: {
      title: "Home",
      slug: "",
      isHome: true,
      published: true,
      sections: await buildHomeSections(locale),
    },
  });

  return NextResponse.json({ ok: true, pageId: page.id, locale });
}
