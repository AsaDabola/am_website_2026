import type { CollectionConfig } from "payload";

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
      options: ["en", "es", "fr", "de", "pt", "ko", "ja", "zh"],
      admin: { description: "Default site language for this country, used for the geo-suggestion banner." },
    },
    {
      name: "countryCodes",
      type: "text",
      admin: {
        description:
          "Comma-separated ISO country codes this tenant matches for IP-based geo detection, e.g. \"DE\" or \"DE,AT\".",
      },
    },
    { name: "active", type: "checkbox", defaultValue: true },
  ],
  defaultSort: "country",
};
