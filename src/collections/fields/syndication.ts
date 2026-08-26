import type { Field } from "payload";
import { CONTINENT_OPTIONS } from "@/lib/continents";
import { enforceTenantScope } from "@/lib/adminAccess";

// Shared by any collection that should be able to flow across the
// multi-tenant network (Posts, Events, ...). `tenant` null means the
// content was authored on the main amintl.org site. The share* fields
// control which other sites additionally receive it, so a query for a
// given site's feed is: tenant === thisSite OR shareWithAllTenants ===
// true OR shareWithContinents contains thisSite's continent OR
// shareWithTenants contains thisSite OR (thisSite is main AND
// shareWithMainSite === true).
export const syndicationFields: Field[] = [
  {
    name: "tenant",
    type: "relationship",
    relationTo: "tenants",
    // A country admin can only file this under one of their own countries.
    hooks: { beforeChange: [enforceTenantScope] },
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
    // Continent before country, because it is how the region offices
    // actually think about an article: "this one is for Africa" is a single
    // decision, where naming its twenty-odd country sites one by one is
    // twenty, and has to be redone every time a country is added. A country
    // site added to a continent later inherits everything already shared
    // with that continent, which is the behaviour you want and the one the
    // per-country list cannot give you.
    name: "shareWithContinents",
    type: "select",
    hasMany: true,
    options: CONTINENT_OPTIONS,
    admin: {
      position: "sidebar",
      description: "Also show on every country site in these continents.",
      condition: (data) => !data?.shareWithAllTenants,
    },
  },
  {
    name: "shareWithTenants",
    type: "relationship",
    relationTo: "tenants",
    hasMany: true,
    admin: {
      position: "sidebar",
      description:
        "Also show on these specific country sites, on top of any continents chosen above.",
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
