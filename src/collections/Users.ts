import type { CollectionConfig } from "payload";
import { SECTIONS, UNSCOPED_SECTIONS, isSuperAdmin, type Section } from "@/lib/adminAccess";

const sectionLabel = (section: Section) =>
  section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ") + (UNSCOPED_SECTIONS.has(section) ? " (all countries)" : "");

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "tenants"],
    description:
      "Who can sign in, and what they can reach. A country admin sees only the sections and the country sites listed on their account.",
    // A country admin has no business managing accounts, including their own
    // permissions.
    hidden: ({ user }) => !isSuperAdmin(user as never),
  },
  access: {
    // Everyone signed in can read users, which is what the admin needs to show
    // "last edited by". Only a super admin can create one, change one, or
    // delete one — otherwise a country admin could grant themselves the rest
    // of the network.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => isSuperAdmin(user as never),
    update: ({ req: { user } }) => isSuperAdmin(user as never),
    delete: ({ req: { user } }) => isSuperAdmin(user as never),
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "country-admin",
      options: [
        { label: "Super admin — the whole network", value: "super-admin" },
        { label: "Country admin — the countries listed below", value: "country-admin" },
      ],
      admin: {
        description: "Super admins see everything and are the only ones who can manage accounts.",
      },
    },
    {
      name: "tenants",
      type: "relationship",
      relationTo: "tenants",
      hasMany: true,
      admin: {
        condition: (data) => data?.role !== "super-admin",
        description:
          "The country sites this person may edit. Content with no country belongs to the main amintl.org site and stays out of reach.",
      },
    },
    {
      name: "sections",
      type: "select",
      hasMany: true,
      options: SECTIONS.map((section) => ({ label: sectionLabel(section), value: section })),
      admin: {
        condition: (data) => data?.role !== "super-admin",
        description:
          "Which parts of the admin this person can open. The ones marked (all countries) have no country on the record, so granting one shows every country's entries.",
      },
    },
  ],
};
