import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

const INVOICE_STATUS: Record<string, "paid" | "void" | "uncollectible" | "open"> = {
  "invoice.paid": "paid",
  "invoice.voided": "void",
  "invoice.marked_uncollectible": "uncollectible",
  "invoice.finalized": "open",
};

// Stripe dashboard → Developers → Webhooks → add endpoint pointing at
// /api/webhooks/stripe, listening for checkout.session.completed (Donate
// page) plus invoice.paid / invoice.voided / invoice.marked_uncollectible
// (partner/chapter Invoicing). This is the only thing that flips a
// DonationIntent or Invoice record's status — the browser redirect back to
// the thank-you page is not trusted on its own since a donor could land
// there without actually paying.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const donationIntentId = session.metadata?.donationIntentId;

    if (donationIntentId) {
      const payload = await getPayload({ config });
      await payload.update({
        collection: "donation-intents",
        id: donationIntentId,
        data: {
          status: "completed",
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
          stripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
        },
        overrideAccess: true,
      });
    }
  }

  const newInvoiceStatus = INVOICE_STATUS[event.type];
  if (newInvoiceStatus) {
    const invoice = event.data.object as Stripe.Invoice;
    const payload = await getPayload({ config });
    const existing = await payload.find({
      collection: "invoices",
      where: { stripeInvoiceId: { equals: invoice.id } },
      limit: 1,
    });
    const record = existing.docs[0];
    if (record) {
      await payload.update({
        collection: "invoices",
        id: record.id,
        data: {
          status: newInvoiceStatus,
          amountDue: (invoice.amount_due ?? 0) / 100,
          amountPaid: (invoice.amount_paid ?? 0) / 100,
        },
        overrideAccess: true,
      });
    }
  }

  return NextResponse.json({ received: true });
}
