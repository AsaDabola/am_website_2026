import type { CollectionConfig } from "payload";

// Billing contacts for chapters/partner organizations we invoice through
// Stripe Invoicing — separate from the public Campuses directory since
// this holds contact/billing info that should never be publicly readable.
export const Partners: CollectionConfig = {
  slug: "partners",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "contactEmail", "type"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "name", type: "text", required: true, admin: { description: "Chapter or partner organization name." } },
    { name: "contactName", type: "text" },
    { name: "contactEmail", type: "email", required: true },
    {
      name: "type",
      type: "select",
      defaultValue: "chapter",
      options: ["chapter", "partner-org", "other"],
    },
    { name: "notes", type: "textarea" },
    { name: "stripeCustomerId", type: "text", admin: { readOnly: true } },
  ],
};
