import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";

// One-time seed for AM's real international chapters, transcribed from the
// "A Worldwide Community" list in the Figma Network page design. Safe to
// call more than once — skips any slug that already exists. Requires a
// logged-in admin session. Delete this route once seeded.
const TENANTS = [
  { country: "Australia", city: "Sydney", continent: "oceania", slug: "australia", locale: "en", countryCodes: "AU" },
  { country: "Colombia", city: "Bogotá", continent: "southamerica", slug: "colombia", locale: "es", countryCodes: "CO" },
  { country: "Burundi", continent: "africa", slug: "burundi", locale: "en", countryCodes: "BI" },
  { country: "Rwanda", city: "Kigali", continent: "africa", slug: "rwanda", locale: "en", countryCodes: "RW" },
  { country: "India", city: "Chennai", continent: "asia", slug: "india", locale: "en", countryCodes: "IN" },
  { country: "Germany", city: "Frankfurt", continent: "europe", slug: "germany", locale: "de", countryCodes: "DE" },
  { country: "United Kingdom", city: "London", continent: "europe", slug: "united-kingdom", locale: "en", countryCodes: "GB" },
  { country: "France", city: "Paris", continent: "europe", slug: "france", locale: "fr", countryCodes: "FR" },
  { country: "Netherlands", city: "Amsterdam", continent: "europe", slug: "netherlands", locale: "en", countryCodes: "NL" },
  { country: "China", city: "Beijing", continent: "asia", slug: "china", locale: "zh", countryCodes: "CN" },
  { country: "South Korea", city: "Seoul", continent: "asia", slug: "south-korea", locale: "ko", countryCodes: "KR" },
  { country: "Philippines", city: "Manila", continent: "asia", slug: "philippines", locale: "en", countryCodes: "PH" },
];

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const created: string[] = [];
  const skipped: string[] = [];

  for (const tenant of TENANTS) {
    const existing = await payload.find({
      collection: "tenants",
      where: { slug: { equals: tenant.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      skipped.push(tenant.slug);
      continue;
    }
    await payload.create({ collection: "tenants", data: { ...tenant, active: true } });
    created.push(tenant.slug);
  }

  return NextResponse.json({ ok: true, created, skipped });
}
