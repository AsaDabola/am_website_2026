import type { CollectionConfig } from "payload";

// Deliberately has no payment-card fields. Raw card numbers must never
// touch our own database — that's a serious PCI-compliance and security
// problem. This collection only records giving *interest* (who, how much,
// how often) until a real payment processor (e.g. Stripe Checkout) is
// wired in to handle the actual charge.
export const DonationIntents: CollectionConfig = {
  slug: "donation-intents",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["fullName", "email", "amount", "frequency", "createdAt"],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "fullName", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "amount", type: "number", required: true },
    {
      name: "frequency",
      type: "select",
      required: true,
      options: ["One-Time", "Monthly", "Yearly"],
    },
  ],
  defaultSort: "-createdAt",
};
