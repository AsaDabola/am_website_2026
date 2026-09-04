import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Link } from "@/i18n/navigation";
import NetworkGlobe from "@/components/network/NetworkGlobe";
import OurNetwork from "@/components/sections/OurNetwork";
import { regions } from "@/lib/regions";
import { CHAPTERS } from "@/lib/chapters";
import {
  getCountryDirectory,
  groupByContinent,
  type DirectoryCountry,
} from "@/lib/countryDirectory";
import { flagSrc } from "@/lib/countryFlags";
import withPageLayout from "@/components/pages/BuiltInPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Network | AM International",
  description: "Find AM's presence around the world, from campus chapters to country sites.",
};


/**
 * One country in the directory: flag, name, and the chapter city where the
 * sheet names one. Linked only where the site actually resolves — see
 * getCountryDirectory.
 */
function CountryRow({ country }: { country: DirectoryCountry }) {
  const inner = (
    <>
      {country.flag ? (
        // Static SVG at a fixed 20px; the image optimiser has nothing to do.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={flagSrc(country.flag)}
          alt=""
          width={20}
          height={14}
          className="mt-0.5 h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10"
        />
      ) : (
        <span className="mt-0.5 h-3.5 w-5 shrink-0 rounded-[2px] bg-mist ring-1 ring-black/10" />
      )}
      <span>
        {country.country}
        {country.city ? <span className="text-ink-muted">, {country.city}</span> : null}
      </span>
    </>
  );

  const className = "flex items-start gap-2.5 py-1 text-sm leading-relaxed";

  return country.live ? (
    <Link href={`/${country.key}`} className={`${className} text-ink hover:text-brand-blue`}>
      {inner}
    </Link>
  ) : (
    <span className={`${className} text-ink-muted`}>{inner}</span>
  );
}

async function NetworkPage() {
  const [t, countries] = await Promise.all([
    getTranslations("Network"),
    getCountryDirectory(),
  ]);
  const countriesByRegion = groupByContinent(countries);
  const regionLabels = Object.fromEntries(
    regions.map((region) => [region.slug, t(`regions.${region.slug}`)]),
  );
  const liveCount = countries.filter((country) => country.live).length;

  return (
    <>
      {/* The globe replaces the flat map, the outlined heading, the breadcrumb
          band and the two buttons that used to sit around it — it carries all
          of them itself, over the sphere. */}
      <NetworkGlobe
        heading={t("heading")}
        subtitle={t("globeSubtitle")}
        searchPlaceholder={t("globeSearchPlaceholder")}
        countries={countries}
        regionLabels={regionLabels}
        primaryCta={{ label: t("joinChapter"), href: "/get-involved/chapter-affiliation" }}
        secondaryCta={{ label: t("partnerWithUs"), href: "/get-involved/donate" }}
        // A zero site count means the database was unreachable, not that no
        // country has a site — better to drop the row than publish a wrong
        // number.
        stats={[
          { label: "Countries", value: String(countries.length) },
          ...(liveCount > 0 ? [{ label: "Country sites", value: String(liveCount) }] : []),
          { label: "Continents", value: String(regions.length) },
          { label: "Languages", value: "48" },
        ]}
      />

      {/* The full country list, from the static sheet rather than the CMS, so
          every one of the sixty is here whatever the database holds. A country
          links to its site once a tenant exists for it; the rest are listed
          but not linked, so the directory is never a page of 404s.
 */}
      <section className="bg-white py-24">
        <Container>
          <div className="flex justify-center">
            <Eyebrow>{t("countriesEyebrow")}</Eyebrow>
          </div>
          <h2 className="text-center font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {t("countriesHeading")}
          </h2>
          <p className="mt-3 text-center text-base text-ink-muted">
            {t("countriesSubheading", { count: countries.length })}
          </p>

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => {
              const list = countriesByRegion[region.slug];
              if (list.length === 0) return null;
              return (
                <div key={region.slug} className="border-t-2 border-black/10 pt-6">
                  <h3 className="font-display text-base font-bold text-ink">
                    {t(`regions.${region.slug}`)}
                  </h3>
                  <ul className="mt-4 space-y-1">
                    {list.map((country) => (
                      <li key={country.key}>
                        <CountryRow country={country} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-mist py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{t("communityEyebrow")}</Eyebrow>
          </div>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {t("chaptersHeading")}
          </h2>

          {/* Every chapter, from the same sheet the globe plots. This used to
              be a hand-written list of North American cities beside the
              country sites of the other regions — two different things in one
              row, and the cities were not the chapters AM actually runs. */}
          <div className="mt-14 grid gap-x-10 gap-y-12 text-start sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((region) => {
              const list = CHAPTERS.filter((chapter) => chapter.region === region.slug);
              return (
                <div key={region.slug} className="border-t-2 border-black/10 pt-6">
                  <h3 className="font-display text-base font-bold text-ink">
                    {t(`regions.${region.slug}`)}
                  </h3>
                  {list.length > 0 ? (
                    <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-muted">
                      {list.map((chapter) => (
                        <li key={`${chapter.country}-${chapter.city}`}>
                          {chapter.country}, {chapter.city}
                          {chapter.role === "global" ? " (HQ)" : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted/70">
                      {t("chaptersSoon")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <OurNetwork />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/network", NetworkPage);
