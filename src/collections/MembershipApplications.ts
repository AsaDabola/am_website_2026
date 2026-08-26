import type { CollectionConfig } from "payload";
import { hideUnlessGranted, sectionAccess } from "@/lib/adminAccess";

export const MembershipApplications: CollectionConfig = {
  slug: "membership-applications",
  admin: {
    hidden: hideUnlessGranted("membership-applications"),
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "chapter", "membershipTier", "createdAt"],
  },
  access: sectionAccess("membership-applications", { publicCreate: true }),
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
