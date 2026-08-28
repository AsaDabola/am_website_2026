import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";
import { locales, localeLabels } from "@/i18n/routing";
import { DEFAULT_BY_KEY, MESSAGE_KEY_OPTIONS, humanizeKey } from "@/lib/messageKeys";

/**
 * The site's wording, editable without a deploy.
 *
 * Most of the site is fixed pages built in code — Who We Are, What We Do, Get
 * Involved and the rest — so they are not in Pages and never will be. Their
 * words still have to be changeable, and this is where that happens: pick the
 * sentence, write the new one.
 *
 * Leaving the country empty changes the main amintl.org site, and with it
 * every country site that has not said otherwise. Naming a country changes
 * only that one. Only the differences are stored, which is what keeps the
 * network coherent: correct a headline once and the fix reaches all ~68
 * countries except the ones that deliberately say something else.
 *
 * The alternative — giving each country a full copy of the site's text —
 * would make the first edit easy and every edit after that a 68-way merge.
 */
export const TenantContent: CollectionConfig = {
  slug: "tenant-content",
  labels: {
    singular: "Page wording",
    plural: "Page wording",
  },
  admin: {
    hidden: hideUnlessGranted("tenant-content"),
    useAsTitle: "label",
    defaultColumns: ["label", "tenant", "locale", "updatedAt"],
    description:
      "Change the wording on the site's built-in pages. Leave the country empty to change the main amintl.org site — every country follows it until it says otherwise.",
    group: "Content",
  },
  access: tenantScopedAccess("tenant-content"),
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
            const locale = data?.locale as string | undefined;

            const tenant = tenantId
              ? await req.payload
                  .findByID({ collection: "tenants", id: tenantId, depth: 0 })
                  .catch(() => null)
              : null;
            const where = tenantId
              ? (tenant as { country?: string } | null)?.country ?? "Unknown country"
              : "Main site";

            return locale
              ? `${where} — ${localeLabels[locale as keyof typeof localeLabels] ?? locale}`
              : `${where} — all languages`;
          },
        ],
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hooks: { beforeChange: [enforceTenantScope] },
      index: true,
      admin: {
        description:
          "Leave empty to change the main amintl.org site, which every country follows. Name a country to change only that one.",
      },
    },
    {
      name: "locale",
      type: "select",
      options: locales.map((value) => ({ label: localeLabels[value], value })),
      admin: {
        description:
          "Leave empty to apply in every language — the usual choice. Set a language only when the site is read in more than one here and the wording should differ between them.",
      },
    },
    {
      name: "overrides",
      type: "array",
      labels: { singular: "Copy change", plural: "Copy changes" },
      admin: {
        description:
          "Pick the sentence to change, then write the new one. What the site says today is shown next to each option.",
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
              "The new wording. For the roadmap bullet lists, put one item per line.",
          },
        },
        {
          name: "mainVersion",
          type: "text",
          admin: {
            readOnly: true,
            description: "The wording this replaces, as the site ships it, for reference.",
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
