import type { CollectionConfig } from "payload";
import { hideUnlessGranted, sectionAccess } from "@/lib/adminAccess";

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  admin: {
    hidden: hideUnlessGranted("contact-messages"),
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "subject", "createdAt"],
  },
  access: sectionAccess("contact-messages", { publicCreate: true }),
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea" },
  ],
  defaultSort: "-createdAt",
};
