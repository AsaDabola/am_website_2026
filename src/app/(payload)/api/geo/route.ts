import { NextRequest, NextResponse } from "next/server";
import { findTenantByCountryCode } from "@/lib/geo";
import { CODE_FOR_SLUG } from "@/lib/countrySites";

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
      // The address of that country's site, which is what the caller wants to
      // send someone to.
      code: CODE_FOR_SLUG.get(tenant.slug) ?? null,
      locale: tenant.locale,
    },
  });
}
