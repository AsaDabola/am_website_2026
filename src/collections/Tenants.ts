import type { CollectionConfig } from "payload";
import { isSuperAdmin, tenantsAccess } from "@/lib/adminAccess";
import type { TextFieldSingleValidation } from "payload";
import { locales, localeLabels } from "@/i18n/routing";
import { CONTINENT_OPTIONS } from "@/lib/continents";
import {
  formatCountryCodes,
  isValidCountryCode,
  parseCountryCodes,
} from "@/lib/countryCodes";

// A Tenant is one of the ~60 country sites (e.g. amintl.org/europe/germany).
// Everything else in the multi-tenant system (Pages, and the syndication
// flag on Posts/Events) points back to a Tenant by relationship, so this is
// the one place a country gets added, renamed, or retired.
export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    // Readable by anyone — the country switcher, the network map and every
    // tenant route resolve through it — but there is nothing here a country
    // admin can act on, so it stays out of their sidebar.
    hidden: ({ user }) => !isSuperAdmin(user),
    useAsTitle: "country",
    defaultColumns: ["country", "continent", "slug", "locale", "active"],
    description:
      "One entry per country site. The URL is /{continent}/{slug}, e.g. continent 'europe' + slug 'germany' -> amintl.org/europe/germany.",
  },
  access: tenantsAccess,
  fields: [
    { name: "country", type: "text", required: true, admin: { description: 'e.g. "Germany"' } },
    { name: "city", type: "text", admin: { description: 'Main chapter city, e.g. "Frankfurt" — shown on the Our Network page.' } },
    {
      name: "continent",
      type: "select",
      required: true,
      options: CONTINENT_OPTIONS,
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
      // A visitor is sent to a country site on the strength of this field, so
      // a typo here does not fail loudly — it just quietly stops a country
      // from ever resolving, or hands its traffic to a neighbour. Both are
      // rejected at save time rather than left to be noticed in analytics.
      hooks: {
        beforeValidate: [
          ({ value }) => {
            const codes = parseCountryCodes(value);
            return codes.length > 0 ? formatCountryCodes(codes) : value;
          },
        ],
      },
      validate: (async (value, { req, id }) => {
        const codes = parseCountryCodes(value);
        if (codes.length === 0) return true;

        const bad = codes.filter((code) => !isValidCountryCode(code));
        if (bad.length > 0) {
          return `Not valid ISO 3166-1 alpha-2 codes: ${bad.join(", ")}. Use two letters per country, e.g. "DE,AT".`;
        }

        // Cross-tenant uniqueness. Payload's `unique` only covers the whole
        // field, which would happily allow "DE,AT" alongside "AT".
        const others = await req.payload.find({
          collection: "tenants",
          where: id ? { id: { not_equals: id } } : {},
          limit: 1000,
          depth: 0,
        });

        const clashes: string[] = [];
        for (const other of others.docs) {
          const taken = parseCountryCodes(
            (other as unknown as { countryCodes?: string | null }).countryCodes,
          );
          for (const code of codes) {
            if (taken.includes(code)) {
              clashes.push(
                `${code} (already on ${(other as unknown as { country: string }).country})`,
              );
            }
          }
        }
        if (clashes.length > 0) {
          return `A country code can only belong to one country site. Already taken: ${clashes.join(", ")}.`;
        }

        return true;
      }) as TextFieldSingleValidation,
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
    /**
     * Footer identity. Each falls back to the main site's wording when left
     * empty, so a country only fills in what it actually differs on — the same
     * principle as the Country copy collection, but kept here because these
     * three belong to the country itself rather than to a page's text.
     */
    {
      name: "orgName",
      type: "text",
      admin: {
        description:
          'Organisation name in this country\'s footer, e.g. "Apostolos Missions France". Leave empty to use the main site\'s name.',
      },
    },
    {
      name: "address",
      type: "textarea",
      admin: {
        description:
          "Postal address for this country's footer. Leave empty to use the main site's address.",
      },
    },
    {
      name: "contactEmail",
      type: "email",
      admin: {
        description:
          "Contact address for this country's footer. Leave empty to use info@amintl.org.",
      },
    },
    { name: "active", type: "checkbox", defaultValue: true },
  ],
  defaultSort: "country",
};
