import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 400, height: undefined },
      { name: "card", width: 900, height: undefined },
      { name: "hero", width: 1920, height: undefined },
    ],
    mimeTypes: ["image/*"],
  },
};
