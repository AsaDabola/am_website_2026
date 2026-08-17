import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getStripe } from "@/lib/stripe";

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
  const donationIntent = await payload.create({
    collection: "donation-intents",
    data: { fullName, email, amount, frequency, status: "pending" },
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
