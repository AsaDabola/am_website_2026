import type { CollectionConfig } from "payload";
import { hideUnlessGranted, sectionAccess } from "@/lib/adminAccess";

// Deliberately has no payment-card fields. Raw card numbers must never
// touch our own database — that's a serious PCI-compliance and security
// problem. This collection records giving intent up front (who, how much,
// how often), then the Stripe webhook flips `status` to "completed" once
// the donor actually pays on Stripe's hosted Checkout page.
export const DonationIntents: CollectionConfig = {
  slug: "donation-intents",
  admin: {
    hidden: hideUnlessGranted("donation-intents"),
    useAsTitle: "email",
    defaultColumns: ["fullName", "email", "amount", "frequency", "status", "createdAt"],
  },
  access: sectionAccess("donation-intents", { publicCreate: true }),
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
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: ["pending", "completed", "failed"],
    },
    { name: "stripeSessionId", type: "text", admin: { readOnly: true } },
    { name: "stripeCustomerId", type: "text", admin: { readOnly: true } },
    { name: "stripeSubscriptionId", type: "text", admin: { readOnly: true } },
    { name: "stripePaymentIntentId", type: "text", admin: { readOnly: true } },
  ],
  defaultSort: "-createdAt",
};
