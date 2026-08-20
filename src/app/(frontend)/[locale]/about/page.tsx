import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Who We Are | AM International",
  description:
    "Apostolos Missions International (AM) is an interdenominational ministry committed to spreading the gospel to the ends of the earth.",
};

const practiceTags = [
  "bibleStudyTag",
  "leadershipTrainingTag",
  "onlineEducationTag",
  "internshipsTripsTag",
] as const;

export default async function WhoWeArePage() {
  const [t, tCommon, tPractice] = await Promise.all([
    getTranslations("AboutPage"),
    getTranslations("Common"),
    getTranslations("InPractice"),
  ]);

  return (
    <>
      <AboutHero
        crumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
        title={t("heroTitle")}
        subtitle={tCommon("tagline")}
        backgroundImage="/images/about-hero-cross.jpg"
      >
        <div className="mt-10 flex flex-wrap gap-3">
          {practiceTags.map((key) => (
            <span
              key={key}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm"
            >
              {tPractice(key)}
            </span>
          ))}
        </div>
      </AboutHero>
      <AboutSubNav active="/about" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <div className="space-y-6 text-base leading-relaxed text-ink">
            <p>{t("paragraph1")}</p>
            <p>
              {t("paragraph2Prefix")} <em className="italic">apostolos</em> {t("paragraph2")}
            </p>
            <p>{t("paragraph3")}</p>
          </div>

          <div className="my-10">
            <PullQuote>{t("blockquote")}</PullQuote>
          </div>

          <div className="space-y-6 text-base leading-relaxed text-ink">
            <p>{t("paragraph4")}</p>
            <p>{t("paragraph5")}</p>
            <p>
              <TenantLink
                href="/about/statement-of-faith"
                className="text-brand-navy underline underline-offset-2"
              >
                {t("readStatementOfFaith")}
              </TenantLink>{" "}
              {t("or")}{" "}
              <TenantLink
                href="/about/history"
                className="text-brand-navy underline underline-offset-2"
              >
                {t("traceHistory")}
              </TenantLink>
              .
            </p>
          </div>
        </Container>
      </article>

      <section className="bg-white pb-24">
        <Container className="max-w-[720px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <TenantLink
              href="/about/statement-of-faith"
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/about-statement-faith-card.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-lg font-bold text-white">
                {t("cardStatementOfFaithTitle")}
              </span>
              <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </TenantLink>
            <TenantLink
              href="/about/mission"
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/about-mission-card.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-lg font-bold text-white">
                {t("cardMissionStatementTitle")}
              </span>
              <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </TenantLink>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
