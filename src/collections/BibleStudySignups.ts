import type { CollectionConfig } from "payload";
import { hideUnlessGranted, sectionAccess } from "@/lib/adminAccess";

export const BibleStudySignups: CollectionConfig = {
  slug: "bible-study-signups",
  admin: {
    hidden: hideUnlessGranted("bible-study-signups"),
    useAsTitle: "email",
    defaultColumns: ["firstName", "lastName", "email", "createdAt"],
  },
  access: sectionAccess("bible-study-signups", { publicCreate: true }),
  fields: [
    {
      type: "row",
      fields: [
        { name: "firstName", type: "text", required: true },
        { name: "lastName", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "age",
          type: "select",
          required: true,
          options: ["Under 18", "18–22", "23–27", "28–34", "35+"],
        },
        {
          name: "maritalStatus",
          type: "select",
          required: true,
          options: ["Single", "Engaged", "Married", "Divorced", "Widowed"],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "schoolName", type: "text" },
        { name: "graduationYear", type: "text" },
      ],
    },
    { name: "preferredTimes", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", required: true },
        { name: "phone", type: "text", required: true },
      ],
    },
    { name: "testimony", type: "textarea", required: true },
    { name: "whyStudyBible", type: "textarea", required: true },
    {
      name: "howDidYouHear",
      type: "select",
      required: true,
      options: [
        "Friend or classmate",
        "Social media",
        "Campus event",
        "Church",
        "AM Academy",
        "Other",
      ],
    },
    { name: "comments", type: "textarea" },
  ],
  defaultSort: "-createdAt",
};
