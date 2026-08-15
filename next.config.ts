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
  // @payloadcms/drizzle's requireDrizzleKit.js, used by the temporary
  // /api/dev-push-schema route. Turbopack rewrites that require() call
  // whenever the *calling* module (@payloadcms/drizzle) is bundled, even
  // though the require target itself is external — producing a mangled
  // "drizzle-kit-<hash>/api" specifier that doesn't exist. Externalizing
  // drizzle-kit alone isn't enough; @payloadcms/drizzle must be left
  // unbundled too so that file's require() call reaches Node untouched.
  serverExternalPackages: ["drizzle-kit", "@payloadcms/drizzle"],
};

export default withPayload(withNextIntl(nextConfig));
