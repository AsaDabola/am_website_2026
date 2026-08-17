import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";

// One-time seed for AM's real international chapters. Sourced from the old
// site's "Our Network" chapter table (61 chapters total), filtered down to
// the 38 non-US/Canada countries — North America is already covered by the
// main site, so those chapters belong in the Campuses collection instead,
// not as country Tenants. Safe to call more than once — skips any slug
// that already exists. Requires a logged-in admin session. Delete this
// route once seeded.
const TENANTS = [
  { country: "Australia", city: "Sydney", continent: "oceania", slug: "australia", locale: "en", countryCodes: "AU" },
  { country: "Brazil", city: "São Paulo", continent: "southamerica", slug: "brazil", locale: "pt", countryCodes: "BR" },
  { country: "Argentina", city: "Buenos Aires", continent: "southamerica", slug: "argentina", locale: "es", countryCodes: "AR" },
  { country: "Bolivia", city: "La Paz", continent: "southamerica", slug: "bolivia", locale: "es", countryCodes: "BO" },
  { country: "Colombia", city: "Bogotá", continent: "southamerica", slug: "colombia", locale: "es", countryCodes: "CO" },
  { country: "Mexico", city: "Mexico City", continent: "southamerica", slug: "mexico", locale: "es", countryCodes: "MX" },
  { country: "Peru", city: "Lima", continent: "southamerica", slug: "peru", locale: "es", countryCodes: "PE" },
  { country: "Uruguay", city: "Montevideo", continent: "southamerica", slug: "uruguay", locale: "es", countryCodes: "UY" },
  { country: "Venezuela", city: "Caracas", continent: "southamerica", slug: "venezuela", locale: "es", countryCodes: "VE" },
  { country: "Kenya", city: "Nairobi", continent: "africa", slug: "kenya", locale: "en", countryCodes: "KE" },
  { country: "Uganda", city: "Kampala", continent: "africa", slug: "uganda", locale: "en", countryCodes: "UG" },
  { country: "Zambia", city: "Lusaka", continent: "africa", slug: "zambia", locale: "en", countryCodes: "ZM" },
  { country: "Nigeria", city: "Lagos", continent: "africa", slug: "nigeria", locale: "en", countryCodes: "NG" },
  { country: "Ethiopia", city: "Addis Ababa", continent: "africa", slug: "ethiopia", locale: "en", countryCodes: "ET" },
  { country: "Egypt", city: "Cairo", continent: "africa", slug: "egypt", locale: "en", countryCodes: "EG" },
  { country: "Tanzania", city: "Dar es Salaam", continent: "africa", slug: "tanzania", locale: "en", countryCodes: "TZ" },
  { country: "Zimbabwe", city: "Harare", continent: "africa", slug: "zimbabwe", locale: "en", countryCodes: "ZW" },
  { country: "Democratic Republic of the Congo", city: "Kinshasa", continent: "africa", slug: "democratic-republic-of-the-congo", locale: "fr", countryCodes: "CD" },
  { country: "India", city: "Chennai", continent: "asia", slug: "india", locale: "en", countryCodes: "IN" },
  { country: "Germany", city: "Frankfurt", continent: "europe", slug: "germany", locale: "de", countryCodes: "DE" },
  { country: "United Kingdom", city: "London", continent: "europe", slug: "united-kingdom", locale: "en", countryCodes: "GB" },
  { country: "France", city: "Paris", continent: "europe", slug: "france", locale: "fr", countryCodes: "FR" },
  { country: "Spain", city: "Madrid", continent: "europe", slug: "spain", locale: "es", countryCodes: "ES" },
  { country: "Ireland", city: "Dublin", continent: "europe", slug: "ireland", locale: "en", countryCodes: "IE" },
  { country: "Netherlands", city: "Amsterdam", continent: "europe", slug: "netherlands", locale: "en", countryCodes: "NL" },
  { country: "Poland", city: "Warsaw", continent: "europe", slug: "poland", locale: "en", countryCodes: "PL" },
  { country: "China", city: "Beijing", continent: "asia", slug: "china", locale: "zh", countryCodes: "CN" },
  { country: "South Korea", city: "Seoul", continent: "asia", slug: "south-korea", locale: "ko", countryCodes: "KR" },
  { country: "Japan", city: "Tokyo", continent: "asia", slug: "japan", locale: "ja", countryCodes: "JP" },
  { country: "Macao", city: "Macao", continent: "asia", slug: "macao", locale: "zh", countryCodes: "MO" },
  { country: "Mongolia", city: "Ulaanbaatar", continent: "asia", slug: "mongolia", locale: "en", countryCodes: "MN" },
  { country: "Malaysia", city: "Kuala Lumpur", continent: "asia", slug: "malaysia", locale: "en", countryCodes: "MY" },
  { country: "Cambodia", city: "Phnom Penh", continent: "asia", slug: "cambodia", locale: "en", countryCodes: "KH" },
  { country: "Indonesia", city: "Jakarta", continent: "asia", slug: "indonesia", locale: "en", countryCodes: "ID" },
  { country: "Laos", city: "Vientiane", continent: "asia", slug: "laos", locale: "en", countryCodes: "LA" },
  { country: "Philippines", city: "Manila", continent: "asia", slug: "philippines", locale: "en", countryCodes: "PH" },
  { country: "Thailand", city: "Bangkok", continent: "asia", slug: "thailand", locale: "en", countryCodes: "TH" },
  { country: "Vietnam", city: "Hanoi", continent: "asia", slug: "vietnam", locale: "en", countryCodes: "VN" },
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
