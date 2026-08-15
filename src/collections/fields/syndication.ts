import type { Field } from "payload";

// Shared by any collection that should be able to flow across the
// multi-tenant network (Posts, Events, ...). `tenant` null means the
// content was authored on the main amintl.org site. The share* fields
// control which other sites additionally receive it, so a query for a
// given site's feed is: tenant === thisSite OR shareWithAllTenants ===
// true OR shareWithTenants contains thisSite OR (thisSite is main AND
// shareWithMainSite === true).
export const syndicationFields: Field[] = [
  {
    name: "tenant",
    type: "relationship",
    relationTo: "tenants",
    admin: {
      position: "sidebar",
      description: "Which country site this was authored on. Leave empty for the main amintl.org site.",
    },
  },
  {
    name: "shareWithAllTenants",
    type: "checkbox",
    defaultValue: false,
    admin: {
      position: "sidebar",
      description: "Show on every country site's feed, in addition to its home site.",
    },
  },
  {
    name: "shareWithTenants",
    type: "relationship",
    relationTo: "tenants",
    hasMany: true,
    admin: {
      position: "sidebar",
      description: "Also show on these specific country sites.",
      condition: (data) => !data?.shareWithAllTenants,
    },
  },
  {
    name: "shareWithMainSite",
    type: "checkbox",
    defaultValue: false,
    admin: {
      position: "sidebar",
      description: "Also show on the main amintl.org feed (only relevant when this was authored on a country site).",
      condition: (data) => Boolean(data?.tenant),
    },
  },
];
