import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import GetInvolvedHero from "@/components/get-involved/GetInvolvedHero";
import EventsAndTestimonials from "@/components/get-involved/EventsAndTestimonials";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import TenantLink from "@/components/layout/TenantLink";

export const metadata: Metadata = {
  title: "Get Involved | AM International",
  description:
    "An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord.",
};

export default async function GetInvolvedHubPage() {
  const [t, tCommon, tHeader, tPractice] = await Promise.all([
    getTranslations("GetInvolvedHub"),
    getTranslations("Common"),
    getTranslations("Header"),
    getTranslations("InPractice"),
  ]);

  // The design labels these cards Connect / Leadership training / Online
  // education / Internships & trips, while their contents follow the
  // Connect-Grow-Lead-Sent stages the page is built around. Labels come from
  // existing translated keys so the row stays localised.
  const heroCards = [
    { label: t("connectTag"), items: t.raw("connectItems") as string[] },
    { label: tPractice("leadershipTrainingTag"), items: t.raw("growItems") as string[] },
    { label: tPractice("onlineEducationTag"), items: t.raw("leadItems") as string[] },
    { label: tPractice("internshipsTripsTag"), items: t.raw("sentItems") as string[] },
  ];

  return (
    <>
      <GetInvolvedHero
        crumbs={[{ label: tCommon("home"), href: "/" }, { label: tHeader("getInvolved") }]}
        title={t("roadmapHeroTitle")}
        cards={heroCards}
      />
      <GetInvolvedSubNav active="/get-involved" />

      <section className="bg-white py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-connect.jpg"
                alt="AM students connecting at a campus outreach table"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                {t("connectHeading")}
              </h2>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t("connectStep1Title")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t("connectStep1Body")}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t("connectStep2Title")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t("connectStep2BodyPrefix")}{" "}
                    <TenantLink href="/contact" className="text-brand-blue underline underline-offset-2">
                      {t("connectStep2SignUp")}
                    </TenantLink>{" "}
                    {t("connectStep2BodySuffix")}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t("connectStep3Title")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t("connectStep3BodyPrefix")}{" "}
                    <TenantLink
                      href="/bible-study/join"
                      className="text-brand-blue underline underline-offset-2"
                    >
                      {t("connectStep3SignUp")}
                    </TenantLink>{" "}
                    {t("connectStep3BodySuffix")}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t("connectStep4Title")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t("connectStep4BodyPrefix")}{" "}
                    <TenantLink href="/contact" className="text-brand-blue underline underline-offset-2">
                      {t("connectStep4ContactHere")}
                    </TenantLink>
                    {t("connectStep4BodySuffix")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-mist py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-grow.jpg"
                alt="AM students growing together in fellowship"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                {t("growHeading")}
              </h2>
              <p className="mt-8 text-sm leading-relaxed text-ink-muted">{t("growIntro")}</p>

              <div className="mt-8 space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-ink">{t("rebornTitle")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("rebornBody")}</p>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">{t("matureTitle")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("matureBody")}</p>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">{t("fruitfulTitle")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("fruitfulBody")}</p>
                </div>
              </div>

              <h3 className="mt-8 font-display text-lg font-bold text-ink">{t("navigatingTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("navigatingBody")}</p>

              <h3 className="mt-8 font-display text-lg font-bold text-ink">{t("nextStepsTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("nextStepsBody")}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-lead.jpg"
                alt="AM leadership retreat"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                {t("leadHeading")}
              </h2>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{t("leadStep1Title")}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("leadStep1Body")}</p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{t("leadStep2Title")}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("leadStep2Body")}</p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{t("leadStep3Title")}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("leadStep3Body")}</p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{t("leadStep4Title")}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t("leadStep4Body")}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-mist py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[570px_1fr] lg:gap-16">
            <div className="relative aspect-[570/577] overflow-hidden rounded-2xl">
              <Image
                src="/images/get-involved-sent.jpg"
                alt="AM missionaries meeting together"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 570px, 100vw"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                {t("sentHeading")}
              </h2>

              <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink-muted">
                <p>{t("sentParagraph1")}</p>
                <p>{t("sentParagraph2")}</p>
                <p>{t("sentParagraph3")}</p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  { label: t("sentLinkAlumniConnect"), href: "/get-involved/alumni-connect" },
                  { label: t("sentLinkBibleTeachers"), href: "/get-involved/bible-teacher-training" },
                  { label: t("sentLinkMissionaries"), href: "/get-involved/internship" },
                  { label: t("sentLinkStaff"), href: "/contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <TenantLink
                      href={link.href}
                      className="text-sm font-medium text-brand-blue underline underline-offset-2"
                    >
                      {link.label}
                    </TenantLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <EventsAndTestimonials />

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
