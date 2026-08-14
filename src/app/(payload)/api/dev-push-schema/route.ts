import config from "@payload-config";
import { getPayload } from "payload";
import { pushDevSchema } from "@payloadcms/drizzle";
import { NextResponse } from "next/server";

// Temporary one-time-use route: Payload's postgres adapter hardcodes
// schema push to skip whenever NODE_ENV === 'production' (see
// @payloadcms/db-postgres/dist/connect.js), which Vercel always sets —
// so `push: true` in payload.config.ts never actually ran there. This
// calls the same pushDevSchema() function directly to create the
// collection tables once against the real database. Delete this file
// once the tables exist; a proper `payload migrate` setup should
// replace it before the schema changes again.
export async function GET() {
  const payload = await getPayload({ config });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await pushDevSchema(payload.db as any);
  return NextResponse.json({ ok: true });
}
