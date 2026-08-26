import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, tenantScopedAccess } from "@/lib/adminAccess";

export const Campuses: CollectionConfig = {
  slug: "campuses",
  admin: {
    hidden: hideUnlessGranted("campuses"),
    useAsTitle: "name",
    defaultColumns: ["name", "location", "active"],
  },
  access: tenantScopedAccess("campuses"),
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "location",
      type: "text",
      required: true,
      admin: {
        description: "City, State — shown next to the chapter name.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hooks: { beforeChange: [enforceTenantScope] },
      admin: {
        description:
          "Leave empty for a main-site (US) chapter. Set this to show the chapter on that country site's network search instead.",
      },
    },
  ],
};
