import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import WhatWeDoInPractice from "@/components/about/WhatWeDoInPractice";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Who We Are | AM International",
  description:
    "Apostolos Missions International (AM) is an interdenominational ministry committed to spreading the gospel to the ends of the earth.",
};

export default async function WhoWeArePage() {
  const [t, tCommon] = await Promise.all([
    getTranslations("AboutPage"),
    getTranslations("Common"),
  ]);

  return (
    <>
      <AboutHero
        crumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
        title={t("heroTitle")}
        subtitle={tCommon("tagline")}
        backgroundImage="/images/about-hero-cross.jpg"
      />
      <AboutSubNav active="/about" />

      <section className="bg-white pt-16">
        <Container>
          <WhatWeDoInPractice />
        </Container>
      </section>

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
              <Link
                href="/about/statement-of-faith"
                className="text-brand-navy underline underline-offset-2"
              >
                {t("readStatementOfFaith")}
              </Link>{" "}
              {t("or")}{" "}
              <Link
                href="/about/history"
                className="text-brand-navy underline underline-offset-2"
              >
                {t("traceHistory")}
              </Link>
              .
            </p>
          </div>
        </Container>
      </article>

      <section className="bg-white pb-24">
        <Container className="max-w-[720px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
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
              <Button
                href="/about/statement-of-faith"
                variant="solid"
                className="pointer-events-none absolute bottom-6 left-6 !px-5 !py-2.5 !text-xs"
              >
                {tCommon("learnMore")}
              </Button>
            </Link>
            <Link
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
              <Button
                href="/about/mission"
                variant="solid"
                className="pointer-events-none absolute bottom-6 left-6 !px-5 !py-2.5 !text-xs"
              >
                {tCommon("learnMore")}
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
