import type { CollectionConfig } from "payload";

export const Campuses: CollectionConfig = {
  slug: "campuses",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "location", "active"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "location",
      type: "text",
      required: true,
      admin: {
        description: "City, State — shown next to the chapter name.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      admin: {
        description:
          "Leave empty for a main-site (US) chapter. Set this to show the chapter on that country site's network search instead.",
      },
    },
  ],
};
