import type { CollectionConfig, TextFieldSingleValidation } from "payload";
import { enforceTenantScope, hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { homeBlocks } from "./blocks/homeBlocks";

// Editor-managed pages. Leaving `tenant` empty makes a page part of the main
// amintl.org site; setting it scopes the page to one country site instead
// (rendered at /{continent}/{tenant.slug}/{slug}, or the tenant's home page
// when `isHome` is checked and slug is empty). The existing hardcoded routes
// (/about, /bible-study, etc.) keep working — Next.js only falls through to
// this collection for paths that don't match a real route file.
export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    hidden: hideUnlessGranted("pages"),
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "tenant", "published"],
    description:
      "Add, edit, or remove pages without a code deploy. Pages with no tenant belong to the main amintl.org site.",
  },
  access: tenantScopedAccess("pages"),
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      admin: {
        description:
          "URL path segment(s), e.g. \"our-story\" or \"programs/summer-camp\". Leave empty only for a home page.",
      },
      // Not `required`, because a home page is addressed by its parent path
      // and must have an empty slug. Marking it required contradicted that
      // and made every home page impossible to save — which is why the main
      // site had no Home page to clone from. Everything else still needs one.
      validate: ((value, { siblingData }) => {
        const isHome = (siblingData as { isHome?: boolean } | undefined)?.isHome;
        if (isHome) return true;
        return typeof value === "string" && value.trim().length > 0
          ? true
          : "Required, unless this is a home page.";
      }) as TextFieldSingleValidation,
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hooks: { beforeChange: [enforceTenantScope] },
      admin: { description: "Leave empty for a page on the main amintl.org site." },
    },
    {
      name: "isHome",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "This is the home page — served at / for the main site, or /{continent}/{country} for a tenant.",
      },
    },
    { name: "published", type: "checkbox", defaultValue: true },
    {
      name: "builtIn",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          "This page is built in code — the site ships it, and it is listed here so every page of the site is in one place. Its wording is edited under Page wording; its layout is changed in the design. The content fields below are hidden for it, because filling them in would do nothing.",
      },
    },
    {
      name: "navLabel",
      type: "text",
      admin: { description: "Label to show in site navigation. Leave empty to keep this page out of the nav." },
    },
    {
      name: "hero",
      admin: { condition: (data) => data?.builtIn !== true },
      type: "group",
      fields: [
        { name: "heading", type: "text" },
        { name: "subheading", type: "text" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor(),
      admin: { condition: (data) => data?.builtIn !== true },
    },
    {
      name: "sections",
      type: "blocks",
      blocks: homeBlocks,
      admin: {
        condition: (data) => data?.builtIn !== true,
        description:
          "Homepage-style content sections (used instead of the simple hero/body above — mainly for a site's home page).",
      },
    },
    {
      name: "meta",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
      ],
    },
  ],
};
