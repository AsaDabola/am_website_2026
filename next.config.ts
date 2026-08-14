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
  // drizzle-kit is dynamically require()'d by pushDevSchema (used by the
  // temporary /api/dev-push-schema route); Turbopack mangles that dynamic
  // require when bundled, so leave it external and let the runtime
  // require it directly from node_modules instead.
  serverExternalPackages: ["drizzle-kit"],
};

export default withPayload(withNextIntl(nextConfig));
