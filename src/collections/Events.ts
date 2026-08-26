import type { CollectionConfig } from "payload";
import { hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";
import { syndicationFields } from "./fields/syndication";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    hidden: hideUnlessGranted("events"),
    useAsTitle: "title",
    defaultColumns: ["title", "dateLabel", "startDate", "tenant"],
  },
  access: tenantScopedAccess("events"),
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: 'URL segment, e.g. "spring-retreat-2026"' },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "location",
      type: "text",
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "dateLabel",
      type: "text",
      required: true,
      admin: {
        description: 'How the date is displayed, e.g. "April 4–5" or "February 18".',
      },
    },
    {
      name: "startDate",
      type: "date",
      required: true,
      admin: {
        description: "Used for sorting events chronologically.",
      },
    },
    ...syndicationFields,
  ],
  defaultSort: "startDate",
};
