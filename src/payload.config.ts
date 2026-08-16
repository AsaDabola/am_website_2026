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
import { Pages } from "./collections/Pages";
import { ContactMessages } from "./collections/ContactMessages";
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
    Pages,
    ContactMessages,
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
    // This project has no migrations yet, so let Payload sync the schema
    // straight from the collection configs — including in production.
    // Once the schema settles, switch to `payload migrate` and drop this.
    push: true,
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
