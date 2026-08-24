import { NextRequest, NextResponse } from "next/server";
import { findTenantByCountryCode } from "@/lib/geo";

// Vercel sets this header on every request at the edge; it's absent when
// running locally or off Vercel, in which case we just report no match.
export async function GET(request: NextRequest) {
  const countryCode = request.headers.get("x-vercel-ip-country");
  if (!countryCode) {
    return NextResponse.json({ tenant: null });
  }

  const tenant = await findTenantByCountryCode(countryCode);
  if (!tenant) return NextResponse.json({ tenant: null });

  return NextResponse.json({
    tenant: {
      country: tenant.country,
      continent: tenant.continent,
      slug: tenant.slug,
      locale: tenant.locale,
    },
  });
}
