import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { auditCountryCodes } from "@/lib/geo";

/**
 * Reports which ISO country code resolves to which country site, and flags
 * anything that would make the geo redirect ambiguous. Admin-only: the code
 * map is not secret, but it is operational detail with no reason to be public.
 *
 * Returns 409 when the data is inconsistent, so this can be used as a
 * post-deploy check rather than something a person has to read.
 */
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const audit = await auditCountryCodes();
  const ok =
    audit.conflicts.length === 0 &&
    audit.malformed.length === 0 &&
    audit.tenantsWithoutCodes.length === 0;

  return NextResponse.json({ ok, ...audit }, { status: ok ? 200 : 409 });
}
