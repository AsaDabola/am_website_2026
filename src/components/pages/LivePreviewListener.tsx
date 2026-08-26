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
 * Harmless outside the admin — the listener only ever hears from a parent
 * frame that is the Payload editor, and there is no parent frame otherwise.
 */
export default function LivePreviewListener() {
  const router = useRouter();
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ""}
    />
  );
}
