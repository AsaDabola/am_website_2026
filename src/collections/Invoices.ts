import type { CollectionConfig } from "payload";

// Mirrors a Stripe Invoice sent to a Partner (chapter/partner-org billing).
// Created by /api/invoices/create, kept in sync by the Stripe webhook
// (invoice.paid / invoice.voided / invoice.marked_uncollectible).
export const Invoices: CollectionConfig = {
  slug: "invoices",
  admin: {
    useAsTitle: "stripeInvoiceId",
    defaultColumns: ["partner", "status", "amountDue", "dueDate", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "partner", type: "relationship", relationTo: "partners", required: true },
    { name: "memo", type: "textarea", admin: { description: "Shown to the partner on the invoice." } },
    {
      name: "lineItems",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "description", type: "text", required: true },
        { name: "amount", type: "number", required: true, admin: { description: "Dollars." } },
      ],
    },
    { name: "dueDate", type: "date" },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: ["draft", "open", "paid", "void", "uncollectible"],
      admin: { readOnly: true },
    },
    { name: "amountDue", type: "number", admin: { readOnly: true, description: "Dollars." } },
    { name: "amountPaid", type: "number", admin: { readOnly: true, description: "Dollars." } },
    { name: "stripeInvoiceId", type: "text", admin: { readOnly: true } },
    { name: "stripeCustomerId", type: "text", admin: { readOnly: true } },
    { name: "hostedInvoiceUrl", type: "text", admin: { readOnly: true } },
    { name: "invoicePdf", type: "text", admin: { readOnly: true } },
  ],
  defaultSort: "-createdAt",
};
