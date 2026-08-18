import type { CollectionConfig } from "payload";

export const MembershipApplications: CollectionConfig = {
  slug: "membership-applications",
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "chapter", "membershipTier", "createdAt"],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "fullName", type: "text", required: true },
        { name: "phone", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", required: true },
        { name: "chapter", type: "text", required: true },
      ],
    },
    {
      name: "membershipTier",
      type: "select",
      required: true,
      options: ["Newcomer", "Registered", "Volunteer", "Staff", "Leader"],
    },
    {
      name: "statementOfFaithAgreement",
      type: "select",
      options: ["I agree and share the AM Statement of Faith"],
    },
    { name: "message", type: "textarea" },
    { name: "attestation", type: "checkbox", required: true },
  ],
  defaultSort: "-createdAt",
};
