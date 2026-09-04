import type { CollectionConfig, TextFieldSingleValidation } from "payload";
import { enforceTenantScope, hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { homeBlocks } from "./blocks/homeBlocks";
import { pageBlocks } from "./blocks/pageBlocks";

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
          "This page is built in code — the site ships it, and it is listed here so every page of the site is in one place. Its wording is edited under Page wording. Its sections can be added to, or replaced entirely, under Sections below.",
      },
    },
    {
      name: "layoutMode",
      type: "select",
      defaultValue: "inherit",
      options: [
        { label: "Keep the page as designed", value: "inherit" },
        { label: "Add my sections above it", value: "before" },
        { label: "Add my sections below it", value: "after" },
        { label: "Use only my sections", value: "replace" },
      ],
      admin: {
        condition: (data) => data?.builtIn === true,
        description:
          "What to do with the sections below. Nothing is thrown away — set this back to \"as designed\" and the page the site ships comes back exactly as it was.",
      },
    },
    {
      name: "layout",
      type: "blocks",
      label: "Sections",
      // Deliberately not `[...pageBlocks, ...homeBlocks]`, tempting as it is —
      // a homepage section offered on every page would be a nice thing to
      // have. Payload gives a block one table per collection, so reusing the
      // home blocks in a second field re-declares that table, and the schema
      // it then wants marks about forty columns of the *existing, populated*
      // home block tables NOT NULL. Measured, not guessed: pushing this config
      // with and without the reuse is the only difference between the two.
      // Nothing here would apply that to the deployed database, but it is the
      // exact shape of the change that has taken the admin down twice, and the
      // general blocks below cover the same ground with more control over how
      // they look.
      blocks: pageBlocks,
      admin: {
        description:
          "Build the page out of sections. Drag to reorder them. Every section has a Look panel for its background, gradient, colours, spacing, width and alignment. Text typed here is shown as written — it is not yet translated into the site's other languages, so on a country site read in another language write it in that language, or leave the page as designed and change its wording under Page wording instead.",
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
      label: "Home page sections",
      blocks: homeBlocks,
      admin: {
        condition: (data) => data?.isHome === true && data?.builtIn !== true,
        description:
          "The homepage's own named sections, for a site's home page. Every other page is built under Sections above.",
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
