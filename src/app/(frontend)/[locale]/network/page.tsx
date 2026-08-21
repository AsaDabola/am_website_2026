import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { ArrowRightIcon } from "@/components/ui/icons";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import { Link } from "@/i18n/navigation";
import NetworkMap from "@/components/network/NetworkMap";
import TenantLink from "@/components/layout/TenantLink";
import OurNetwork from "@/components/sections/OurNetwork";
import { regions } from "@/lib/regions";
import { getActiveTenantCountByContinent, getAllActiveTenantsByContinent } from "@/lib/tenants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Network | AM International",
  description: "Find AM's presence around the world, from campus chapters to country sites.",
};

const northAmericaChapters = [
  "USA, Trenton (HQ)",
  "USA, New York",
  "USA, Atlanta",
  "USA, Boston",
  "USA, Burlington",
  "USA, Detroit",
  "USA, Houston",
  "USA, Los Angeles",
  "USA, Nashville",
  "USA, New Haven",
  "USA, Philadelphia",
  "USA, Princeton",
  "USA, Raleigh",
  "USA, San Diego",
  "USA, San Francisco",
  "USA, Seattle",
  "USA, St. Louis",
  "USA, Washington DC",
  "USA, Wichita",
  "Canada, Montreal",
  "Canada, Toronto",
  "Canada, Vancouver",
];

export default async function NetworkPage() {
  const [t, common, counts, tenantsByContinent] = await Promise.all([
    getTranslations("Network"),
    getTranslations("Common"),
    getActiveTenantCountByContinent(),
    getAllActiveTenantsByContinent(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-night py-16">
        <Container className="relative">
          <nav aria-label="Breadcrumb" className="text-[13px] text-on-dark/80">
            <ol className="flex items-center gap-2">
              <li>
                <TenantLink href="/" className="hover:text-white">
                  {common("home")}
                </TenantLink>
              </li>
              <li className="opacity-50">/</li>
              <li>{t("breadcrumb")}</li>
            </ol>
          </nav>

          <NetworkMap />

          <h1 className="mt-10 text-center font-display text-[38px] font-extrabold uppercase leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.9)] sm:text-[58px] lg:text-[72px]">
            {t("heading")}
          </h1>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <TenantLink
              href="/get-involved/chapter-affiliation"
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-brand-navy"
            >
              {t("joinChapter")}
              <ArrowRightIcon />
            </TenantLink>
            <TenantLink
              href="/get-involved/donate"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-ink"
            >
              {t("partnerWithUs")}
            </TenantLink>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{t("exploreEyebrow")}</Eyebrow>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            {t("regionsHeading")}
          </h1>
          <p className="mt-3 text-base text-ink-muted">{t("regionsSubheading")}</p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((region) => {
              const count = counts[region.slug] ?? 0;
              return (
                <Link
                  key={region.slug}
                  href={`/network/${region.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <PlaceholderPhoto
                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                    from={region.from}
                    to={region.to}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute bottom-5 inset-x-0 text-center font-display text-xl font-bold text-white">
                    {t(`regions.${region.slug}`)}
                  </span>
                  {count > 0 && (
                    <span className="absolute end-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {t("siteCount", { count })}
                    </span>
                  )}
                </Link>
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

          <div className="mt-14 grid gap-x-10 gap-y-12 text-start sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t-2 border-black/10 pt-6">
              <h3 className="font-display text-base font-bold text-ink">
                {t("regions.northamerica")}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-muted">
                {northAmericaChapters.map((chapter) => (
                  <li key={chapter}>{chapter}</li>
                ))}
              </ul>
            </div>

            {regions
              .filter((region) => region.slug !== "northamerica")
              .map((region) => {
                const tenants = tenantsByContinent[region.slug];
                return (
                  <div key={region.slug} className="border-t-2 border-black/10 pt-6">
                    <h3 className="font-display text-base font-bold text-ink">
                      {t(`regions.${region.slug}`)}
                    </h3>
                    {tenants.length > 0 ? (
                      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-muted">
                        {tenants.map((tenant) => (
                          <li key={tenant.slug}>
                            {tenant.country}
                            {tenant.city ? `, ${tenant.city}` : ""}
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
