import config from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

// Temporary one-time-use route: Payload's postgres adapter hardcodes
// schema push to skip whenever NODE_ENV === 'production' (see
// @payloadcms/db-postgres/dist/connect.js), which Vercel always sets —
// so `push: true` in payload.config.ts never actually ran there.
//
// pushDevSchema() itself calls drizzle-kit's pushSchema() and, if it
// reports any warnings, awaits an interactive `prompts()` confirmation
// before applying — which can never resolve in a non-interactive
// serverless invocation. Since this route only ever runs once against a
// brand-new, empty database, there is no data-loss risk to confirm, so
// this reimplements the same push and always applies. Delete this file
// once the tables exist; a proper `payload migrate` setup should
// replace it before the schema changes again.
export async function GET() {
  try {
    const payload = await getPayload({ config });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = payload.db as any;
    const { pushSchema } = adapter.requireDrizzleKit();
    const { extensions = {}, tablesFilter } = adapter;

    const { apply, hasDataLoss, warnings } = await pushSchema(
      adapter.schema,
      adapter.drizzle,
      adapter.schemaName ? [adapter.schemaName] : undefined,
      tablesFilter,
      extensions.postgis ? ["postgis"] : undefined,
    );

    await apply();

    const migrationsTable = adapter.schemaName
      ? `"${adapter.schemaName}"."payload_migrations"`
      : '"payload_migrations"';
    const result = await adapter.execute({
      drizzle: adapter.drizzle,
      raw: `SELECT * FROM ${migrationsTable} WHERE batch = '-1'`,
    });

    if (!result.rows.length) {
      await adapter.drizzle
        .insert(adapter.tables.payload_migrations)
        .values({ name: "dev", batch: -1 });
    }

    return NextResponse.json({ ok: true, warnings, hasDataLoss });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ ok: false, message, stack }, { status: 500 });
  }
}
