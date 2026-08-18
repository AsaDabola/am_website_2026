import { NextRequest, NextResponse } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";

// Vercel sets this header on every request at the edge; it's absent when
// running locally or off Vercel, in which case we just report no match.
export async function GET(request: NextRequest) {
  const countryCode = request.headers.get("x-vercel-ip-country");
  if (!countryCode) {
    return NextResponse.json({ tenant: null });
  }

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "tenants",
      where: { and: [{ active: { equals: true } }, { countryCodes: { contains: countryCode } }] },
      limit: 1,
    });

    const tenant = result.docs[0];
    if (!tenant) return NextResponse.json({ tenant: null });

    return NextResponse.json({
      tenant: {
        country: tenant.country,
        continent: tenant.continent,
        slug: tenant.slug,
        locale: tenant.locale,
      },
    });
  } catch {
    return NextResponse.json({ tenant: null });
  }
}
