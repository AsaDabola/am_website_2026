import Image from "next/image";
import type { ComponentProps } from "react";
import { getLocale } from "next-intl/server";
import { getRequestImages } from "@/lib/tenantImages";

/**
 * A photograph the site ships, which a country site may have replaced.
 *
 * Drop-in for next/image wherever the source is one of the site's own files:
 * same props, same behaviour, except that it asks first whether the country
 * being rendered has put its own picture in that frame. Nobody has, on most
 * pages of most sites, and then it draws exactly what it was given.
 *
 * A server component, which is what makes this cheap and invisible: the swap
 * happens before the HTML is written, so there is no flash of the wrong
 * photograph and nothing extra reaches the browser. Every file drawing a
 * `/images/…` path is a server component, which is why this could be a swap of
 * one import rather than a rewrite.
 *
 * An `src` that is not one of the site's own files — a remote address, a
 * media upload already resolved — passes straight through, so this is safe to
 * use anywhere.
 */
export default async function SiteImage(props: ComponentProps<typeof Image>) {
  const { src } = props;

  if (typeof src !== "string" || !src.startsWith("/images/")) {
    return <Image {...props} />;
  }

  let replacement: string | undefined;
  try {
    replacement = (await getRequestImages(await getLocale()))[src];
  } catch {
    // Outside a request — a script, a build-time helper — there is no country
    // and no locale, and the site's own photograph is the right answer.
    replacement = undefined;
  }

  return <Image {...props} src={replacement ?? src} />;
}
