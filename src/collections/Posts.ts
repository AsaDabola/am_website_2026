import type { CollectionConfig } from "payload";
import { hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { syndicationFields } from "./fields/syndication";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    hidden: hideUnlessGranted("posts"),
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedDate", "tenant"],
  },
  access: tenantScopedAccess("posts"),
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
      // The divisions the news section is presented in. Events is one of them
      // and lives in its own collection, because an event carries a date and a
      // location that an article does not.
      options: [
        { label: "News", value: "news" },
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
