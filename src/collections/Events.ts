import type { CollectionConfig } from "payload";
import { syndicationFields } from "./fields/syndication";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "dateLabel", "startDate", "tenant"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
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
