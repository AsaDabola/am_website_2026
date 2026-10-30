import { randomBytes } from "crypto";
import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin, type Section } from "@/lib/adminAccess";

/**
 * Gives every country site its own sign-in, holding only that country.
 *
 * One `sub-admin` per active tenant, carrying that tenant and nothing else, so
 * the account reaches its own country's pages, posts, events, campuses,
 * leaders and wording — and no part of any other country.
 *
 * GET lists what it would create and creates nothing. POST creates, and is the
 * only time the passwords exist in readable form: they are generated here,
 * returned once, and stored by Payload as a hash. Losing the response means
 * resetting a password, not recovering it.
 *
 * Only a super admin can run it, which is the same rule the Users collection
 * already enforces on creating an account by hand.
 */

/**
 * The sections whose records carry a tenant, so granting one shows that
 * country's entries and nobody else's.
 *
 * UNSCOPED_SECTIONS in lib/adminAccess is deliberately not granted here. Those
 * records have no country on them — the contact form, the donation intents and
 * every application do not ask — so handing one to a country admin would show
 * them every country's submissions, including people's names and addresses.
 * A country that needs them should be given them deliberately, one account at
 * a time.
 */
const COUNTRY_SCOPED_SECTIONS: Section[] = [
  "pages",
  "posts",
  "events",
  "campuses",
  "leaders",
  "tenant-content",
];

/** The local part of the address, from the tenant's own slug: `germany`. */
function addressFor(slug: string, domain: string) {
  return `${slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}@${domain}`;
}

/**
 * Readable, and still 72 bits of entropy.
 *
 * Someone is going to carry this to a colleague in another country by hand, so
 * the alphabet drops the characters that are read wrongly when they do —
 * O/0, I/l/1 — rather than being pure base64 and arriving mistyped.
 */
function password() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(14);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function run(request: NextRequest, dryRun: boolean) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || !isSuperAdmin(user as never)) {
    return NextResponse.json(
      { ok: false, message: "Only a super admin can provision accounts." },
      { status: user ? 403 : 401 },
    );
  }

  const domain = new URL(request.url).searchParams.get("domain") || "amintl.org";

  const tenants = await payload.find({
    collection: "tenants",
    where: { active: { equals: true } },
    limit: 500,
    depth: 0,
    sort: "country",
  });

  const created: { country: string; email: string; password: string }[] = [];
  const skipped: { country: string; email: string; why: string }[] = [];

  for (const tenant of tenants.docs) {
    const email = addressFor(String(tenant.slug), domain);

    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs.length > 0) {
      // Never re-issue a password for an account someone is already using:
      // a second run would lock them out of their own site.
      skipped.push({ country: tenant.country, email, why: "already exists" });
      continue;
    }

    if (dryRun) {
      created.push({ country: tenant.country, email, password: "(generated on POST)" });
      continue;
    }

    const secret = password();
    await payload.create({
      collection: "users",
      data: {
        email,
        password: secret,
        role: "sub-admin",
        tenants: [tenant.id],
        sections: COUNTRY_SCOPED_SECTIONS,
      } as never,
    });
    created.push({ country: tenant.country, email, password: secret });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    domain,
    message: dryRun
      ? `Would create ${created.length} account(s); ${skipped.length} already exist.`
      : `Created ${created.length} account(s); ${skipped.length} already existed.`,
    sections: COUNTRY_SCOPED_SECTIONS,
    created,
    skipped,
    csv: ["country,email,password", ...created.map((r) => `${JSON.stringify(r.country)},${r.email},${r.password}`)].join("\n"),
  });
}

export async function GET(request: NextRequest) {
  return run(request, true);
}

export async function POST(request: NextRequest) {
  return run(request, false);
}
