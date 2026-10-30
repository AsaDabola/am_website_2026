import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, submissionAccess } from "@/lib/adminAccess";
import { attributeToCountrySite } from "@/lib/submissionCountry";

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  hooks: { beforeValidate: [attributeToCountrySite] },
  admin: {
    hidden: hideUnlessGranted("contact-messages"),
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "subject", "tenant", "createdAt"],
  },
  access: submissionAccess("contact-messages"),
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
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea" },
  ],
  defaultSort: "-createdAt",
};
