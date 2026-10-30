import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, submissionAccess } from "@/lib/adminAccess";
import { attributeToCountrySite } from "@/lib/submissionCountry";

export const MembershipApplications: CollectionConfig = {
  slug: "membership-applications",
  hooks: { beforeValidate: [attributeToCountrySite] },
  admin: {
    hidden: hideUnlessGranted("membership-applications"),
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "chapter", "membershipTier", "tenant", "createdAt"],
  },
  access: submissionAccess("membership-applications"),
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
