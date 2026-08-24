import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "@/i18n/content";
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

/**
 * The four ways AM works in practice, shown as two-tone cards overlapping the
 * hero. The colour pairs match the pillar cards elsewhere on the site rather
 * than being theme tokens, so they stay literal.
 */
const practiceCards = [
  { tag: "bibleStudyTag", body: "bibleStudyDescription", header: "#2abfbf", panel: "#1a4040", text: "#e0f7f7" },
  {
    tag: "leadershipTrainingTag",
    body: "leadershipTrainingDescription",
    header: "#3b82f6",
    panel: "#1a2a4a",
    text: "#dbeafe",
  },
  {
    tag: "onlineEducationTag",
    body: "onlineEducationDescription",
    header: "#4b7aae",
    panel: "#1a2535",
    text: "#d1e4f5",
  },
  {
    tag: "internshipsTripsTag",
    body: "internshipsTripsDescription",
    header: "#1e3a5f",
    panel: "#0f1f35",
    text: "#c8d8ec",
  },
] as const;

export default async function WhoWeArePage() {
  const [t, tCommon, tPractice] = await Promise.all([
    getTranslations("AboutPage"),
    getTranslations("Common"),
    getTranslations("InPractice"),
  ]);

  return (
    <>
      {/* The design puts the section tabs directly under the site header,
          above the hero image, rather than below it. */}
      <AboutSubNav active="/about" />
      <AboutHero
        crumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
        title={t("heroTitle")}
        backgroundImage="/images/about-hero-cross.jpg"
        size="large"
        titleVariant="ghost"
        titleCase="sentence"
        align="center"
      >
        {/* The design's card row is 1140px — a little wider than the 1120px
            text column it sits under — which is what gives each card the
            273px that keeps "Leadership training" on one line. Subgrid then
            pins every header to the same height, so a language that does wrap
            the header still leaves the four card bodies aligned. */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:-mx-[10px] lg:grid-cols-4 lg:grid-rows-[auto_1fr]">
          {practiceCards.map((card) => (
            <div
              key={card.tag}
              className="grid grid-rows-[auto_1fr] overflow-hidden rounded-lg lg:row-span-2 lg:grid-rows-subgrid"
            >
              {/* Inter rather than the display face, at the design's 20px —
                  the header is set in the body font here. No `nowrap`: the
                  design can assume one line for English, but a longer
                  translation should grow the card rather than spill out. */}
              <div
                className="flex items-center justify-center p-5"
                style={{ backgroundColor: card.header }}
              >
                <span className="text-center text-xl font-extrabold uppercase text-white">
                  {tPractice(card.tag)}
                </span>
              </div>
              <div className="px-5 py-6" style={{ backgroundColor: card.panel }}>
                <p className="text-center text-sm leading-[1.6]" style={{ color: card.text }}>
                  {tPractice(card.body)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AboutHero>

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
        <Container>
          <div className="grid gap-6 lg:grid-cols-[802fr_448fr]">
            <TenantLink
              href="/about/statement-of-faith"
              className="group relative block h-[320px] overflow-hidden rounded-2xl lg:h-[400px]"
            >
              <Image
                src="/images/about-statement-faith-card.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-[#0d328a]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute start-6 top-6 font-display text-lg font-bold text-white">
                {t("cardStatementOfFaithTitle")}
              </span>
              <span className="absolute bottom-6 start-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
                {tCommon("learnMore")}
                <ArrowRightIcon />
              </span>
            </TenantLink>
            <TenantLink
              href="/about/mission"
              className="group relative block h-[320px] overflow-hidden rounded-2xl lg:h-[400px]"
            >
              <Image
                src="/images/about-mission-card.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-[#0d328a]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute start-6 top-6 font-display text-lg font-bold text-white">
                {t("cardMissionStatementTitle")}
              </span>
              <span className="absolute bottom-6 start-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
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
