import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, submissionAccess } from "@/lib/adminAccess";
import { attributeToCountrySite } from "@/lib/submissionCountry";

// Deliberately has no payment-card fields. Raw card numbers must never
// touch our own database — that's a serious PCI-compliance and security
// problem. This collection records giving intent up front (who, how much,
// how often), then the Stripe webhook flips `status` to "completed" once
// the donor actually pays on Stripe's hosted Checkout page.
export const DonationIntents: CollectionConfig = {
  slug: "donation-intents",
  hooks: { beforeValidate: [attributeToCountrySite] },
  admin: {
    hidden: hideUnlessGranted("donation-intents"),
    useAsTitle: "email",
    defaultColumns: ["fullName", "email", "amount", "frequency", "status", "tenant", "createdAt"],
  },
  access: submissionAccess("donation-intents"),
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hooks: { beforeChange: [enforceTenantScope] },
      admin: {
        readOnly: true,
        description:
          "The country site this came in from, taken from the page the form was sent from. Empty means the main amintl.org site.",
      },
    },
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
