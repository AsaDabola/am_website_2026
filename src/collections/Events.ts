import type { CollectionConfig } from "payload";
import { hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";
import { syndicationFields } from "./fields/syndication";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    hidden: hideUnlessGranted("events"),
    useAsTitle: "title",
    defaultColumns: ["title", "dateLabel", "sortOrder", "tenant"],
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
      admin: {
        description:
          "The day it starts, when that is known. Sorting falls back to this only where two events share a place in the order.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      index: true,
      admin: {
        description:
          "Where this sits in the list — 1 shows first. The events came across from a list whose order is all that is known about when they happened, so this, not the date, is what the page is ordered by.",
      },
    },
    ...syndicationFields,
  ],
  defaultSort: "sortOrder",
};
