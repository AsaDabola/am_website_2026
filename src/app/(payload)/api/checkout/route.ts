import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getStripe } from "@/lib/stripe";
import { COUNTRY_BY_CODE } from "@/lib/countrySites";

const FREQUENCIES = ["One-Time", "Monthly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const amount = Number(body.amount);
  const frequency = body.frequency as Frequency;

  if (!fullName || !email || !Number.isFinite(amount) || amount < 1) {
    return NextResponse.json({ error: "Invalid donation details" }, { status: 400 });
  }
  if (!FREQUENCIES.includes(frequency)) {
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Online payment isn't connected yet. Please try again soon." },
      { status: 503 },
    );
  }

  const payload = await getPayload({ config });

  // Which country site the donation came from, so it shows in that country's
  // list rather than only the main site's. The form sends its own path's
  // first segment; an unrecognised one, or none, means amintl.org itself.
  //
  // Note this attributes the record, not the money: there is one Stripe
  // account behind every site, and the thank-you redirect below still returns
  // to the main site's URL.
  const site = COUNTRY_BY_CODE.get(String(body.countryCode ?? "").toLowerCase());
  const tenant = site
    ? (
        await payload.find({
          collection: "tenants",
          where: { slug: { equals: site.slug } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
      ).docs[0]
    : undefined;

  const donationIntent = await payload.create({
    collection: "donation-intents",
    data: {
      fullName,
      email,
      amount,
      frequency,
      status: "pending",
      ...(tenant ? { tenant: tenant.id } : {}),
    },
    overrideAccess: true,
  });

  const origin = request.nextUrl.origin;
  const unitAmount = Math.round(amount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: frequency === "One-Time" ? "payment" : "subscription",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: "Donation to Apostolos Missions International",
          },
          ...(frequency === "One-Time"
            ? {}
            : { recurring: { interval: frequency === "Monthly" ? "month" : "year" } }),
        },
      },
    ],
    metadata: {
      donationIntentId: String(donationIntent.id),
      fullName,
      frequency,
    },
    success_url: `${origin}/get-involved/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/get-involved/donate`,
  });

  await payload.update({
    collection: "donation-intents",
    id: donationIntent.id,
    data: { stripeSessionId: session.id },
    overrideAccess: true,
  });

  return NextResponse.json({ url: session.url });
}
