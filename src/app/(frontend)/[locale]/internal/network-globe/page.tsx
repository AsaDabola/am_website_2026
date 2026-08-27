import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NetworkGlobe from "@/components/network/NetworkGlobe";
import { getCountryDirectory } from "@/lib/countryDirectory";
import { regions } from "@/lib/regions";

/**
 * A staging route for the proposed globe, so it can be looked at without
 * touching /network. Not linked from anywhere and kept out of search; delete
 * this file when the globe either replaces the flat map or is dropped.
 */
export const metadata: Metadata = {
  title: "Network globe preview",
  robots: { index: false, follow: false },
};

export default async function NetworkGlobePreviewPage() {
  const [t, countries] = await Promise.all([getTranslations("Network"), getCountryDirectory()]);

  const regionLabels = Object.fromEntries(
    regions.map((region) => [region.slug, t(`regions.${region.slug}`)]),
  );
  const live = countries.filter((country) => country.live).length;

  return (
    <NetworkGlobe
      heading={t("heading")}
      subtitle="AM is a sending community across six continents — find the country nearest you, or the one you are being sent to."
      searchPlaceholder="Search for a country, region or chapter"
      countries={countries}
      regionLabels={regionLabels}
      primaryCta={{ label: t("joinChapter"), href: "/get-involved/chapter-affiliation" }}
      secondaryCta={{ label: t("partnerWithUs"), href: "/get-involved/donate" }}
      // A zero here means the database was unreachable, not that no country
      // has a site — better to drop the row than to publish a wrong number.
      stats={[
        { label: "Countries", value: String(countries.length) },
        ...(live > 0 ? [{ label: "Country sites", value: String(live) }] : []),
        { label: "Continents", value: "6" },
        { label: "Languages", value: "48" },
      ]}
    />
  );
}
