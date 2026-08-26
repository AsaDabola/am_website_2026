import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // drizzle-kit is dynamically require()'d (via createRequire) inside
  // @payloadcms/drizzle's requireDrizzleKit.js. Turbopack rewrites that
  // require() whenever the calling module is bundled, producing a mangled
  // specifier that does not exist, so both are left unbundled. The route this
  // was originally added for is gone, but the adapter still reaches for
  // drizzle-kit on its own, so this stays.
  serverExternalPackages: ["drizzle-kit", "@payloadcms/drizzle"],
};

export default withPayload(withNextIntl(nextConfig));
