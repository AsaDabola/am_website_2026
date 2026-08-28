import type { CollectionConfig } from "payload";
import { SECTIONS, UNSCOPED_SECTIONS, isSuperAdmin, type Section } from "@/lib/adminAccess";
import { CONTINENT_OPTIONS } from "@/lib/continents";

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
      "Who can sign in, and what they can reach. Below super admin, an account sees only the sections listed on it, holding only the countries it was given — named one by one, or a continent at a time.",
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
      defaultValue: "sub-admin",
      options: [
        { label: "Super admin — the whole network", value: "super-admin" },
        { label: "Admin — whole continents, or countries, as listed below", value: "admin" },
        { label: "Sub admin — only the countries listed below", value: "sub-admin" },
      ],
      admin: {
        description:
          "Super admins see everything and are the only ones who can manage accounts. An admin reaches every country in the continents given to it, so a country added to that continent later needs no further granting. A sub admin reaches only the countries named on it.",
      },
    },
    {
      name: "continents",
      type: "select",
      hasMany: true,
      options: CONTINENT_OPTIONS,
      admin: {
        condition: (data) => data?.role === "admin",
        description:
          "Every country site in these continents, including ones added later. Leave empty to give this admin only the countries named below.",
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
          "The country sites this person may edit, named one at a time. Content with no country belongs to the main amintl.org site and stays out of reach of everyone but a super admin.",
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
