import type { CollectionConfig } from "payload";

/**
 * Submissions from the internship application on
 * /get-involved/internship. Payload's REST layer exposes this as
 * POST /api/internship-applications, which is what the form posts to.
 *
 * `create` is public because the form is: anyone can apply. Everything else
 * needs a logged-in admin, so an application can only be read back in
 * /admin — these carry a date of birth, two named referees and their contact
 * details, and a personal account of someone's faith.
 */
export const InternshipApplications: CollectionConfig = {
  slug: "internship-applications",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["firstName", "lastName", "program", "email", "createdAt"],
    description:
      "Applications to the summer, short-term and long-term internships. Read-only in practice — reply to the applicant by email.",
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
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
        { name: "email", type: "email", required: true },
        { name: "phone", type: "text", required: true },
      ],
    },
    { name: "streetAddress", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "city", type: "text", required: true },
        { name: "stateProvince", type: "text", required: true },
        { name: "zipCode", type: "text", required: true },
      ],
    },
    { name: "country", type: "text", required: true },
    {
      name: "dateOfBirth",
      type: "text",
      required: true,
      admin: { description: "As typed by the applicant, e.g. MM / DD / YYYY." },
    },

    {
      name: "program",
      type: "select",
      required: true,
      options: [
        { label: "Summer Internship", value: "summer" },
        { label: "Short-term Internship", value: "short-term" },
        { label: "Long-term Internship", value: "long-term" },
      ],
    },
    {
      name: "preferredStartDate",
      type: "text",
      required: true,
      admin: { description: "As typed, e.g. MM / YYYY." },
    },
    { name: "howDidYouHear", type: "text", required: true },

    {
      name: "educationLevel",
      type: "select",
      required: true,
      options: [
        { label: "High school", value: "high-school" },
        { label: "Some college", value: "some-college" },
        { label: "Undergraduate degree", value: "undergraduate" },
        { label: "Postgraduate degree", value: "postgraduate" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "churchName", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "leaderName", type: "text", required: true },
        { name: "leaderContact", type: "text", required: true },
      ],
    },
    { name: "faithJourney", type: "textarea", required: true },
    { name: "whyThisProgram", type: "textarea", required: true },

    // Two referees, each the same four fields. A group rather than an array
    // because the design asks for exactly two and names them — an array would
    // let an applicant submit none, which is the one thing this must not allow.
    {
      name: "reference1",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "email", type: "email", required: true },
            { name: "phone", type: "text", required: true },
          ],
        },
        { name: "relationship", type: "text", required: true },
      ],
    },
    {
      name: "reference2",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "email", type: "email", required: true },
            { name: "phone", type: "text", required: true },
          ],
        },
        { name: "relationship", type: "text", required: true },
      ],
    },

    // Both are required at the point of submission, so a stored `false` would
    // mean something went round the form. Kept as fields rather than dropped
    // once checked, because what was agreed to and when is the record.
    {
      name: "confirmsAccurate",
      type: "checkbox",
      required: true,
      label: "Confirmed the information is accurate and complete",
    },
    {
      name: "agreesToTerms",
      type: "checkbox",
      required: true,
      label: "Agreed to the terms and conditions and privacy policy",
    },
  ],
  defaultSort: "-createdAt",
};
