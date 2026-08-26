"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

/**
 * Re-renders the page when the admin's Live Preview says the document changed.
 *
 * `router.refresh()` rather than a hook that patches the data in place: these
 * pages are server components built from Payload blocks, so the server is what
 * knows how to turn a changed document into markup. Refreshing re-runs that
 * and swaps in the new tree without losing scroll position.
 *
 * `serverURL` is the target origin of a postMessage, and an empty string is
 * not a valid one: it throws on mount, uncaught, which replaces every page
 * this sits on with Next's "This page couldn't load". NEXT_PUBLIC_SERVER_URL
 * is not set on every deployment — payload.config.ts is written to allow for
 * exactly that — so when it is missing this renders nothing rather than
 * mounting with "". The cost is that Live Preview will not refresh until the
 * variable is set; the alternative was a blank site.
 *
 * The check reads an inlined NEXT_PUBLIC_ value, so the server and the client
 * reach the same answer and there is no hydration mismatch.
 */
export default function LivePreviewListener() {
  const router = useRouter();
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!serverURL) return null;

  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />;
}
