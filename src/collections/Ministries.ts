import type { CollectionConfig } from "payload";

export const Ministries: CollectionConfig = {
  slug: "ministries",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["tag", "title", "order"],
  },
  access: {
    read: () => true,
  },
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
