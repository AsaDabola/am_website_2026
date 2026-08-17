import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Get Involved | AM International",
  description:
    "An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord.",
};

export default async function GetInvolvedHubPage() {
  const [t, tCommon, tHeader] = await Promise.all([
    getTranslations("GetInvolvedHub"),
    getTranslations("Common"),
    getTranslations("Header"),
  ]);

  const roadmap = [
    { tag: t("connectTag"), items: t.raw("connectItems") as string[] },
    { tag: t("growTag"), items: t.raw("growItems") as string[] },
    { tag: t("leadTag"), items: t.raw("leadItems") as string[] },
    { tag: t("sentTag"), items: t.raw("sentItems") as string[] },
  ];

  return (
    <>
      <AboutHero
        crumbs={[{ label: tCommon("home"), href: "/" }, { label: tHeader("getInvolved") }]}
        title={tHeader("getInvolved")}
        subtitle={tCommon("tagline")}
      />
      <GetInvolvedSubNav active="/get-involved" />

      <section className="bg-mist py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{t("roadmapEyebrow")}</Eyebrow>
          </div>
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {t("roadmapHeading")}
          </h2>

          <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((step) => (
              <div key={step.tag} className="border-t-2 border-black/10 pt-6">
                <h3 className="font-display text-base font-bold text-ink">{step.tag}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {step.items.map((item, i) => (
                    <span key={item}>
                      {item}
                      {i < step.items.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

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
                    <Link href="/contact" className="text-brand-blue underline underline-offset-2">
                      {t("connectStep2SignUp")}
                    </Link>{" "}
                    {t("connectStep2BodySuffix")}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t("connectStep3Title")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t("connectStep3BodyPrefix")}{" "}
                    <Link
                      href="/bible-study/join"
                      className="text-brand-blue underline underline-offset-2"
                    >
                      {t("connectStep3SignUp")}
                    </Link>{" "}
                    {t("connectStep3BodySuffix")}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {t("connectStep4Title")}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t("connectStep4BodyPrefix")}{" "}
                    <Link href="/contact" className="text-brand-blue underline underline-offset-2">
                      {t("connectStep4ContactHere")}
                    </Link>
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
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-brand-blue underline underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
