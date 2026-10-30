import type { Access, CollectionConfig } from "payload";
import {
  canUseSection,
  enforceTenantScope,
  hideUnlessGranted,
  isSuperAdmin,
  tenantScopeWhere,
} from "@/lib/adminAccess";

/**
 * The shared library, with each upload remembering who put it there.
 *
 * Media is the one granted section where scoping reads differently from
 * every other. Pages, posts and the rest are a country's own work and a
 * country admin has no business seeing another's. An image is a building
 * material: the main site's logos, photography and PDFs are what a country
 * page is assembled from, so narrowing `read` to the uploader's own tenant
 * would leave a country team with an empty picker and nothing to build with.
 *
 * So reading stays wide and only changing is scoped. A country admin can
 * upload, and can rename or delete what they uploaded; the main site's files
 * and other countries' files are theirs to use and not to touch. An upload
 * with no tenant belongs to the main site, which is every file that existed
 * before uploads remembered a country.
 */
const ownUploads: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!canUseSection(user, "media")) return false;
  return tenantScopeWhere(user);
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // The public site serves these files, so reading cannot be locked down —
    // and a logged-in country admin needs the whole library in the picker.
    read: () => true,
    create: ({ req: { user } }) => canUseSection(user, "media"),
    update: ownUploads,
    delete: ownUploads,
  },
  admin: {
    hidden: hideUnlessGranted("media"),
    useAsTitle: "alt",
    defaultColumns: ["alt", "tenant", "filename"],
    description:
      "Images, PDFs and spreadsheets used across the sites. Every file here can be used on any page; a country can change or remove only the files it uploaded.",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hooks: { beforeChange: [enforceTenantScope] },
      admin: {
        description:
          "Which country uploaded this. Filled in automatically; left empty the file belongs to the main amintl.org site.",
      },
    },
  ],
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 400, height: undefined },
      { name: "card", width: 900, height: undefined },
      { name: "hero", width: 1920, height: undefined },
    ],
    mimeTypes: [
      "image/*",
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
};
