import type { CollectionConfig } from "payload";
import { hideUnlessGranted, sectionAccess } from "@/lib/adminAccess";

export const Ministries: CollectionConfig = {
  slug: "ministries",
  admin: {
    hidden: hideUnlessGranted("ministries"),
    useAsTitle: "title",
    defaultColumns: ["tag", "title", "order"],
  },
  access: sectionAccess("ministries", { publicRead: true }),
  fields: [
    {
      name: "tag",
      type: "text",
      required: true,
      admin: {
        description: 'Short label shown on the card, e.g. "Connect", "Grow".',
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "href",
      type: "text",
      defaultValue: "/get-involved",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Lower numbers show first.",
      },
    },
  ],
  defaultSort: "order",
};
