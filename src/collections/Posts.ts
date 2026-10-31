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
        // Kept, but relabelled rather than removed. Fourteen articles are
        // filed under it and the value is in the enum Postgres enforces, so
        // dropping the option would be a schema change those rows would fail.
        // Only the label changes — labels are not stored — and it now warns an
        // editor that the section it belonged to is gone.
        { label: "Testimony (no longer shown on the site)", value: "testimony" },
      ],
    },
    {
      name: "publishedDate",
      type: "date",
      required: true,
    },
    {
      /**
       * Required on a new article, and only on a new one.
       *
       * The listings leave out any article with no picture — see HAS_PICTURE
       * in lib/posts.ts, which exists because the archive import brought back
       * hundreds of text-only pieces and a card with nothing in its frame is
       * worse than no card. The side effect was its own bug report: an editor
       * wrote an article, saved it, watched it appear in /admin and never on
       * the site, and had nothing telling them why.
       *
       * So the rule is enforced where it can be read, at save time, rather
       * than applied silently afterwards. It is checked on create alone
       * because those hundreds of archive articles have no picture and have
       * to stay editable.
       */
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      validate: (value: unknown, { operation }: { operation?: string }) =>
        operation === "create" && !value
          ? "Choose a cover image. An article without one is saved, but it is left out of every news listing, so nobody would find it."
          : true,
      admin: {
        description:
          "Shown on the article's card in the listings. An article without one does not appear in them at all.",
      },
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
