import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";

/**
 * The people who lead the work, and how each of them got there.
 *
 * Not a page and not a directory: this is the record headquarters keeps of who
 * is leading where, so the question "how many leaders are there in Asia
 * Pacific, and in which countries" has an answer that does not require asking
 * seven coordinators. The counts are at /admin/leaders; this collection is
 * what they count.
 *
 * ## Internal only
 *
 * Nothing here reaches the public site, deliberately. A row holds a person's
 * photograph, who evangelised them, who disciples them, their training and
 * their covenants — and while the leadership page publishes names and faces
 * the people on it chose to publish, none of the rest of this was given for
 * that. It is read through the admin, by people the access rules below let in.
 *
 * ## Who can see whom
 *
 * Scoped by country like the rest of the network's content: a country's
 * administrators see their own country's leaders, an admin given a continent
 * sees that continent, and a super admin sees everyone. That falls out of
 * `tenantScopedAccess` and the `tenant` field below, so it is one rule rather
 * than a rule per screen.
 *
 * ## A note on what is stored here
 *
 * These are religious convictions and relationships about identifiable people,
 * in about seventy countries. Several of those countries treat that as
 * sensitive personal data with rules about consent, retention and transfer,
 * and a few are places where the record itself could put someone at risk. That
 * is a decision for AM rather than for this file, but it should be a decision
 * someone actually makes: what is collected, who may see it, and how long it
 * is kept. The fields are all optional so that a country can keep less.
 */
export const Leaders: CollectionConfig = {
  slug: "leaders",
  labels: { singular: "Leader", plural: "Leaders" },
  admin: {
    hidden: hideUnlessGranted("leaders"),
    useAsTitle: "name",
    defaultColumns: ["name", "tenant", "currentPosition", "membershipStatus", "updatedAt"],
    description:
      "Who is leading where, and how they got there. Internal — none of this appears on the public site.",
    group: "Network",
    listSearchableFields: ["name", "currentPosition", "affiliatedCenter"],
  },
  access: tenantScopedAccess("leaders"),
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          required: true,
          index: true,
          hooks: { beforeChange: [enforceTenantScope] },
          admin: {
            description:
              "The country this leader serves. The continent totals are worked out from it, so it is the one field the counts depend on.",
          },
        },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },

    {
      type: "row",
      fields: [
        {
          name: "fellowshipAffiliation",
          type: "text",
          admin: { description: "The church or fellowship this person belongs to." },
        },
        {
          name: "membershipStatus",
          type: "select",
          // The same words the membership application form uses, so a person
          // does not change category by moving between the two.
          options: ["Newcomer", "Registered", "Volunteer", "Staff", "Leader"],
          admin: { description: "Where they stand today." },
        },
      ],
    },

    /* ---------------------------------------------------------- the journey */

    {
      type: "collapsible",
      label: "How they came to faith",
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            { name: "evangelismDate", type: "date", label: "Date of evangelism" },
            {
              name: "evangelismPathway",
              type: "text",
              admin: { description: "How they were reached — a campus study, a friend, an event." },
            },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "evangelisedBy", type: "text", label: "Evangelised by" },
            { name: "discipledBy", type: "text", label: "Discipled by" },
          ],
        },
        {
          name: "mentor",
          type: "text",
          label: "Mentor / Shepherd / Recommender",
          admin: { description: "Who stands behind them now." },
        },
      ],
    },

    {
      type: "collapsible",
      label: "Training",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "faithAndOrderStatus",
          type: "select",
          label: "Faith & Order training",
          options: ["Not started", "In progress", "Completed"],
        },
        {
          name: "training",
          type: "array",
          label: "Curriculum and training completed",
          labels: { singular: "Course", plural: "Courses" },
          fields: [
            {
              type: "row",
              fields: [
                { name: "name", type: "text", required: true },
                { name: "completedOn", type: "date" },
              ],
            },
          ],
        },
      ],
    },

    {
      type: "collapsible",
      label: "Leadership",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "currentPosition",
          type: "text",
          admin: { description: "What they lead today." },
        },
        {
          name: "previousPositions",
          type: "array",
          label: "Previous leadership history",
          labels: { singular: "Position", plural: "Positions" },
          fields: [
            { name: "position", type: "text", required: true },
            {
              type: "row",
              fields: [
                { name: "from", type: "date" },
                { name: "to", type: "date", admin: { description: "Leave empty if it is ongoing." } },
              ],
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "nextStage",
              type: "text",
              admin: { description: "What they are being prepared for." },
            },
            {
              name: "requiredQualifications",
              type: "textarea",
              admin: { description: "What is still needed to get there." },
            },
          ],
        },
        {
          name: "recommendations",
          type: "textarea",
          label: "Relevant recommendations",
          admin: { description: "Who has recommended them, and for what." },
        },
        {
          name: "documents",
          type: "array",
          label: "Covenants and related documents",
          labels: { singular: "Document", plural: "Documents" },
          admin: {
            description:
              "Signed covenants, references, anything that belongs with the record. Uploaded to Media like everything else.",
          },
          fields: [
            {
              type: "row",
              fields: [
                { name: "title", type: "text", required: true },
                { name: "file", type: "upload", relationTo: "media", required: true },
              ],
            },
          ],
        },
      ],
    },

    {
      type: "collapsible",
      label: "Where they are",
      admin: { initCollapsed: false },
      fields: [
        { name: "affiliatedCenter", type: "text" },
        { name: "centerAddress", type: "textarea" },
        {
          name: "countryWebsite",
          type: "text",
          label: "Country website / URL",
          admin: {
            description:
              "Leave empty to use the country's own AM address, which the network already knows.",
          },
        },
      ],
    },
  ],
  defaultSort: "name",
};
