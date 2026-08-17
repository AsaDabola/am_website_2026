import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { syndicationFields } from "./fields/syndication";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedDate", "tenant"],
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
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: 'URL segment, e.g. "spring-retreat-recap" for /news/spring-retreat-recap' },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "news",
      options: [
        { label: "Featured News", value: "news" },
        { label: "Editorial", value: "editorial" },
        { label: "Photo News", value: "photo-news" },
        { label: "Testimony", value: "testimony" },
      ],
    },
    {
      name: "publishedDate",
      type: "date",
      required: true,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor(),
    },
    ...syndicationFields,
  ],
  defaultSort: "-publishedDate",
};
