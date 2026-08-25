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
import { Tenants } from "./collections/Tenants";
import { TenantContent } from "./collections/TenantContent";
import { Pages } from "./collections/Pages";
import { ContactMessages } from "./collections/ContactMessages";
import { DonationIntents } from "./collections/DonationIntents";
import { Partners } from "./collections/Partners";
import { Invoices } from "./collections/Invoices";
import { ChapterAffiliations } from "./collections/ChapterAffiliations";
import { MembershipApplications } from "./collections/MembershipApplications";
import { getDatabaseUri } from "./lib/getDatabaseUri";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
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
    Tenants,
    TenantContent,
    Pages,
    ContactMessages,
    DonationIntents,
    Partners,
    Invoices,
    ChapterAffiliations,
    MembershipApplications,
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
