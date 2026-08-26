"use client";

import { usePathname } from "@/i18n/navigation";
import { countryFromPath } from "@/lib/currentCountry";
import type { FooterCountry } from "./FooterOrg";

/**
 * The copyright line, naming the country site you are on.
 *
 * The template arrives already translated, with `{org}` where the name goes,
 * and is substituted here rather than through `useTranslations` on purpose:
 * the server translator is the tenant-aware one, so a country that has
 * rewritten this line in its own Country copy still gets its own wording.
 */
export default function FooterCopyright({
  template,
  countries,
  defaultOrgName,
}: {
  template: string;
  countries: FooterCountry[];
  defaultOrgName: string;
}) {
  const here = countryFromPath(usePathname());
  const current = here ? countries.find((c) => c.key === here.key) : undefined;

  return <p>{template.replace("{org}", current?.orgName || defaultOrgName)}</p>;
}
