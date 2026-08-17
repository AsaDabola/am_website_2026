import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getStripe } from "@/lib/stripe";

type LineItem = { description: string; amount: number };

// Admin-only: creates (or reuses) a Stripe Customer for the partner, adds
// the line items, finalizes the invoice, and emails it to the partner's
// billing contact — Stripe's "send_invoice" collection method, so the
// partner pays on their own schedule via a link rather than a live checkout.
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const partnerId = String(body.partnerId ?? "");
  const memo = typeof body.memo === "string" ? body.memo : undefined;
  const dueDate = typeof body.dueDate === "string" ? body.dueDate : undefined;
  const lineItems: LineItem[] = Array.isArray(body.lineItems) ? body.lineItems : [];

  if (!partnerId || lineItems.length === 0) {
    return NextResponse.json({ error: "A partner and at least one line item are required" }, { status: 400 });
  }
  for (const item of lineItems) {
    if (!item.description || !Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0) {
      return NextResponse.json({ error: "Each line item needs a description and a positive amount" }, { status: 400 });
    }
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: "Stripe isn't connected yet" }, { status: 503 });
  }

  const partner = await payload.findByID({ collection: "partners", id: partnerId });
  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  let stripeCustomerId = partner.stripeCustomerId as string | undefined;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: partner.name,
      email: partner.contactEmail,
      metadata: { partnerId: String(partner.id) },
    });
    stripeCustomerId = customer.id;
    await payload.update({
      collection: "partners",
      id: partner.id,
      data: { stripeCustomerId },
      overrideAccess: true,
    });
  }

  const daysUntilDue = dueDate
    ? Math.max(1, Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000))
    : 30;

  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    collection_method: "send_invoice",
    days_until_due: daysUntilDue,
    description: memo,
    auto_advance: true,
  });

  for (const item of lineItems) {
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id,
      amount: Math.round(Number(item.amount) * 100),
      currency: "usd",
      description: item.description,
    });
  }

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id as string);
  await stripe.invoices.sendInvoice(invoice.id as string);

  const record = await payload.create({
    collection: "invoices",
    data: {
      partner: partner.id,
      memo,
      lineItems,
      dueDate,
      status: "open",
      amountDue: (finalized.amount_due ?? 0) / 100,
      stripeInvoiceId: finalized.id,
      stripeCustomerId,
      hostedInvoiceUrl: finalized.hosted_invoice_url ?? undefined,
      invoicePdf: finalized.invoice_pdf ?? undefined,
    },
    overrideAccess: true,
  });

  return NextResponse.json({ invoice: record });
}
