import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/adminAccess";

/**
 * How much the site is being read, kept as running totals rather than as a log.
 *
 * One row is one number: "on this day, on this country site, this page was
 * opened 41 times". A page view does not add a row — it adds one to the rows
 * that already describe it. So the table stays small however busy the site
 * gets, and the Traffic screen can add up a year without reading a year of
 * individual visits.
 *
 * Five rows are touched per view, all in one statement: the site's own total,
 * the page, where the reader came from, and which country they read it in.
 *
 * Nothing here identifies anybody. No address is stored, no cookie is set, and
 * a "visit" is counted from a flag that lives only in the open tab. There is
 * therefore nothing to consent to, which matters when the network reaches
 * countries whose law would otherwise require asking.
 *
 * Written by /api/track, and only there — the upsert it does has no equivalent
 * in Payload's create/update, so writing through this collection would race
 * itself and lose counts. This exists to give the table a schema, a place in
 * the generated types, and access control on the way out.
 */
export const Traffic: CollectionConfig = {
  slug: "traffic",
  admin: {
    // There is nothing to edit here, and a list of counters is not something
    // anyone should have to scroll. The Traffic screen is how this is read.
    hidden: true,
    useAsTitle: "label",
    defaultColumns: ["day", "site", "kind", "label", "views"],
  },
  access: {
    // Read is granted to anyone signed in and then narrowed per country by the
    // Traffic screen itself, which is where the reach of a role is known. Only
    // the tracking endpoint writes, and it goes around this.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  /**
   * What makes a view an increment rather than a new row. Postgres treats
   * NULLs in a unique index as distinct from each other, so every column here
   * is written as "" rather than left empty — otherwise the international
   * site's rows would never match themselves and the table would grow one row
   * per view after all.
   */
  indexes: [{ fields: ["day", "site", "kind", "label"], unique: true }],
  fields: [
    {
      name: "day",
      type: "text",
      required: true,
      index: true,
      admin: { description: "The UTC date, as YYYY-MM-DD." },
    },
    {
      name: "site",
      type: "text",
      required: true,
      defaultValue: "",
      admin: { description: 'The country site\'s code — "de" — or empty for amintl.org.' },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      options: [
        { label: "Whole site", value: "total" },
        { label: "Page", value: "page" },
        { label: "Came from", value: "referrer" },
        { label: "Read in", value: "country" },
      ],
    },
    {
      name: "label",
      type: "text",
      required: true,
      defaultValue: "",
      admin: { description: "The page, the referring site, or the reader's country. Empty on a total." },
    },
    { name: "views", type: "number", required: true, defaultValue: 0 },
    {
      name: "visits",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { description: "Views that began a new visit — a first page in a tab." },
    },
  ],
  defaultSort: "-day",
};
