import type { CollectionConfig } from "payload";

export const ChapterAffiliations: CollectionConfig = {
  slug: "chapter-affiliations",
  admin: {
    useAsTitle: "targetUniversity",
    defaultColumns: ["targetUniversity", "city", "country", "applicationType", "createdAt"],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "applicationType",
      type: "select",
      required: true,
      options: ["Annual reaffirmation", "New chapter"],
    },
    {
      type: "row",
      fields: [
        { name: "city", type: "text", required: true },
        { name: "country", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "targetUniversity", type: "text", required: true },
        { name: "startDate", type: "text", required: true },
      ],
    },
    { name: "memberCount", type: "text", required: true },

    { name: "chartered", type: "select", required: true, options: ["Yes", "No"] },
    { name: "charterLetter", type: "upload", relationTo: "media" },
    { name: "constitutionFile", type: "upload", relationTo: "media" },
    { name: "delayReason", type: "textarea" },

    {
      type: "row",
      fields: [
        { name: "leaderName", type: "text", required: true },
        { name: "leaderRole", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "leaderEmail", type: "email", required: true },
        { name: "leaderPhone", type: "text", required: true },
      ],
    },
    {
      name: "additionalLeaders",
      type: "array",
      fields: [
        { name: "name", type: "text" },
        { name: "role", type: "text" },
        { name: "email", type: "email" },
        { name: "phone", type: "text" },
      ],
    },
    { name: "leadershipChanges", type: "textarea" },
    { name: "attestation", type: "checkbox", required: true },

    { name: "memberListFile", type: "upload", relationTo: "media" },
    {
      name: "members",
      type: "array",
      fields: [
        { name: "name", type: "text" },
        { name: "email", type: "email" },
      ],
    },
  ],
  defaultSort: "-createdAt",
};
