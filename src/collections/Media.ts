import type { CollectionConfig } from "payload";
import { hideUnlessGranted, sectionAccess } from "@/lib/adminAccess";

export const Media: CollectionConfig = {
  slug: "media",
  access: sectionAccess("media", { publicRead: true }),
  admin: {
    hidden: hideUnlessGranted("media"),
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
    mimeTypes: [
      "image/*",
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
};
