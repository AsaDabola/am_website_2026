import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Campuses } from "./collections/Campuses";
import { Events } from "./collections/Events";
import { Posts } from "./collections/Posts";
import { Ministries } from "./collections/Ministries";
import { BibleStudySignups } from "./collections/BibleStudySignups";
import { VolunteerApplications } from "./collections/VolunteerApplications";
import { InternshipApplications } from "./collections/InternshipApplications";
import { Tenants } from "./collections/Tenants";
import { TenantContent } from "./collections/TenantContent";
import { Pages } from "./collections/Pages";
import { livePreviewUrl } from "./lib/livePreviewUrl";
import { ContactMessages } from "./collections/ContactMessages";
import { DonationIntents } from "./collections/DonationIntents";
import { Partners } from "./collections/Partners";
import { Invoices } from "./collections/Invoices";
import { ChapterAffiliations } from "./collections/ChapterAffiliations";
import { MembershipApplications } from "./collections/MembershipApplications";
import { Traffic } from "./collections/Traffic";
import { getDatabaseUri } from "./lib/getDatabaseUri";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // "" rather than undefined when unset: Payload appends serverURL to the csrf
  // allowlist unless it is exactly "", so an unset variable would put
  // `undefined` on the list and then match no origin at all — locking out every
  // cookie-authenticated write instead of allowing them.
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  /**
   * Origins whose cookies Payload will honour.
   *
   * This only bites on requests that carry an `Origin` header — which browsers
   * send on POST but not on a same-origin GET. That is why a mismatch here
   * shows up as reads working and writes returning 401, rather than as being
   * logged out.
   *
   * Vercel serves the admin on more than one hostname (the project domain, and
   * a unique URL per deployment), so a single configured serverURL cannot cover
   * them. Each is added from the environment Vercel provides.
   */
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    "http://localhost:3000",
  ].filter((origin): origin is string => Boolean(origin)),
  admin: {
    user: Users.slug,
    /**
     * Where a component path beginning with "/" starts from. Without this it
     * is the directory the build was started in, and every path here would
     * have to carry a "src/" that means nothing to the rest of the codebase.
     */
    importMap: { baseDir: dirname },
    components: {
      /**
       * The AM wordmark where Payload draws its own — on the login screen and
       * in the header. Signing in should look like signing in to this
       * organisation, not to a CMS.
       */
      graphics: {
        Logo: "/components/admin/Brand#AdminLogo",
        Icon: "/components/admin/Brand#AdminIcon",
      },
      views: {
        /**
         * The screen behind /admin.
         *
         * Payload's own is a list of every collection — what is in here, but
         * not what is going on. Ours opens on how much has been published,
         * what came in through the forms, what was last touched, and how far
         * the network reaches, scoped to whatever the person signing in was
         * given. The collections are still one click away in the sidebar.
         */
        dashboard: { Component: "/components/admin/Dashboard#Dashboard" },
        /**
         * How much the site is being read: /admin/traffic.
         *
         * Its own screen rather than a panel on the dashboard, because it
         * answers a different question and wants the whole width to answer it.
         * The counters behind it are written by /api/track.
         */
        traffic: {
          Component: "/components/admin/Traffic#TrafficView",
          path: "/traffic",
          exact: true,
          meta: { title: "Traffic" },
        },
      },
      // Traffic is not a collection, so it needs its own way in.
      beforeNavLinks: ["/components/admin/TrafficNavLink#TrafficNavLink"],
    },
    /**
     * The page beside the form, updating as it is edited.
     *
     * This plus the blocks field's own drag handles is the Shopify editor's
     * shape: a list of sections you reorder by dragging, with the real page
     * rendering next to it. Reordering, adding and removing sections is done
     * in the sidebar list, not on the canvas.
     */
    livePreview: {
      collections: ["pages"],
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 390, height: 844 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
      url: ({ data, req }) =>
        livePreviewUrl({
          data: data as Record<string, unknown>,
          payload: req.payload,
          serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
        }),
    },
  },
  collections: [
    Users,
    Media,
    Campuses,
    Events,
    Posts,
    Ministries,
    BibleStudySignups,
    VolunteerApplications,
    InternshipApplications,
    Tenants,
    TenantContent,
    Pages,
    ContactMessages,
    DonationIntents,
    Partners,
    Invoices,
    ChapterAffiliations,
    MembershipApplications,
    Traffic,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getDatabaseUri(),
    },
    // Schema sync for local work only. This is NOT a production mechanism,
    // whatever the setting suggests: the adapter gates it on
    // `NODE_ENV !== 'production'` and ignores it on a deployed build. A column
    // added to a collection therefore reaches a local database by itself and
    // never reaches the deployed one, which is how production ended up without
    // `tenants.languages` and failing every query that selected it.
    //
    // Deployed schema changes go through `npm run migrate:create` (writes a
    // migration into src/migrations against whatever database you point it at)
    // and `npm run migrate` to apply it.
    push: true,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
});
