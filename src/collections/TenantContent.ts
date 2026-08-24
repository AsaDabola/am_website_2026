import type { CollectionConfig } from "payload";
import { locales, localeLabels } from "@/i18n/routing";
import { DEFAULT_BY_KEY, MESSAGE_KEY_OPTIONS, humanizeKey } from "@/lib/messageKeys";

/**
 * Per-country copy changes.
 *
 * A country site shows the main version of every string until someone here
 * says otherwise. Only the differences are stored, which is what keeps the
 * network coherent: correct a headline on the main site and the fix reaches
 * all ~68 countries, except the ones that deliberately said something else.
 *
 * The alternative — giving each country a full copy of the site's text —
 * would make the first edit easy and every edit after that a 68-way merge.
 */
export const TenantContent: CollectionConfig = {
  slug: "tenant-content",
  labels: {
    singular: "Country copy",
    plural: "Country copy",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "tenant", "locale", "updatedAt"],
    description:
      "Change wording for one country site. Anything not listed here keeps following the main amintl.org copy.",
    group: "Content",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "label",
      type: "text",
      admin: {
        readOnly: true,
        description: "Set automatically from the country and language below.",
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            const tenantId = data?.tenant;
            if (!tenantId) return "Country copy";
            const tenant = await req.payload
              .findByID({ collection: "tenants", id: tenantId, depth: 0 })
              .catch(() => null);
            const country = (tenant as { country?: string } | null)?.country ?? "Unknown country";
            const locale = data?.locale as string | undefined;
            return locale
              ? `${country} — ${localeLabels[locale as keyof typeof localeLabels] ?? locale}`
              : `${country} — all languages`;
          },
        ],
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
      admin: { description: "The country site these changes apply to." },
    },
    {
      name: "locale",
      type: "select",
      options: locales.map((value) => ({ label: localeLabels[value], value })),
      admin: {
        description:
          "Leave empty to apply to this country in every language — the usual choice. Set a language only when a country reads the site in more than one and the wording should differ between them.",
      },
    },
    {
      name: "overrides",
      type: "array",
      labels: { singular: "Copy change", plural: "Copy changes" },
      admin: {
        description:
          "Pick the piece of copy to change, then write this country's version. The main version is shown next to each option.",
        initCollapsed: false,
      },
      fields: [
        {
          name: "key",
          type: "select",
          required: true,
          options: MESSAGE_KEY_OPTIONS,
          admin: {
            description:
              "Searchable by what the text says, not just its name — type a few words of the sentence you want to change.",
          },
        },
        {
          name: "value",
          type: "textarea",
          required: true,
          admin: {
            description:
              "This country's wording. For the roadmap bullet lists, put one item per line.",
          },
        },
        {
          name: "mainVersion",
          type: "text",
          admin: {
            readOnly: true,
            description: "The main amintl.org copy this replaces, for reference.",
          },
          hooks: {
            beforeChange: [
              ({ siblingData }) => {
                const key = (siblingData as { key?: string } | undefined)?.key;
                return key ? DEFAULT_BY_KEY[key] ?? "" : "";
              },
            ],
          },
        },
      ],
      validate: (value: unknown) => {
        const rows = Array.isArray(value)
          ? (value as { key?: string }[])
          : [];
        const seen = new Set<string>();
        const dupes = new Set<string>();
        for (const row of rows) {
          if (!row?.key) continue;
          if (seen.has(row.key)) dupes.add(row.key);
          seen.add(row.key);
        }
        if (dupes.size > 0) {
          // Two rows for one key means the winner depends on array order,
          // which is not something an editor should have to reason about.
          return `Each piece of copy can only be changed once per entry. Duplicated: ${[...dupes]
            .map(humanizeKey)
            .join(", ")}.`;
        }
        return true;
      },
    },
  ],
};
