import type { CollectionConfig } from "payload";
import { locales, localeLabels } from "@/i18n/routing";

// A Tenant is one of the ~60 country sites (e.g. amintl.org/europe/germany).
// Everything else in the multi-tenant system (Pages, and the syndication
// flag on Posts/Events) points back to a Tenant by relationship, so this is
// the one place a country gets added, renamed, or retired.
export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "country",
    defaultColumns: ["country", "continent", "slug", "locale", "active"],
    description:
      "One entry per country site. The URL is /{continent}/{slug}, e.g. continent 'europe' + slug 'germany' -> amintl.org/europe/germany.",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "country", type: "text", required: true, admin: { description: 'e.g. "Germany"' } },
    { name: "city", type: "text", admin: { description: 'Main chapter city, e.g. "Frankfurt" — shown on the Our Network page.' } },
    {
      name: "continent",
      type: "select",
      required: true,
      options: [
        { label: "Africa", value: "africa" },
        { label: "Asia", value: "asia" },
        { label: "Europe", value: "europe" },
        { label: "North America", value: "northamerica" },
        { label: "South America", value: "southamerica" },
        { label: "Oceania", value: "oceania" },
      ],
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: 'URL segment, e.g. "germany" for /europe/germany' },
    },
    {
      name: "locale",
      type: "select",
      defaultValue: "en",
      // Driven by the shipped locale set, so a new translation shows up here
      // as soon as its messages file exists.
      options: locales.map((value) => ({ label: localeLabels[value], value })),
      admin: {
        description:
          "Default site language for this country, used for the geo-suggestion banner. Only languages the site is translated into can be chosen — see Spoken languages for the gap.",
      },
    },
    {
      name: "countryCodes",
      type: "text",
      admin: {
        description:
          "Comma-separated ISO country codes this tenant matches for IP-based geo detection, e.g. \"DE\" or \"DE,AT\". A code must belong to exactly one tenant.",
      },
    },
    {
      name: "languages",
      type: "text",
      admin: {
        description:
          "Languages actually spoken here, as comma-separated BCP 47 tags (e.g. \"cs\" for Czechia). Where one of these is not in the Default language list above, the country is reading the site in a fallback language and is waiting on a translation.",
      },
    },
    {
      name: "tier",
      type: "select",
      options: [
        { label: "G20 mission country", value: "g20" },
        { label: "M40 mission country", value: "m40" },
      ],
      admin: { description: "Which half of AM's G20 + M40 mission country list this came from." },
    },
    { name: "active", type: "checkbox", defaultValue: true },
  ],
  defaultSort: "country",
};
