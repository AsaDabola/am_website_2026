import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "@/i18n/content";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
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
  {
    tag: "bibleStudyTag",
    body: "bibleStudyDescription",
    header: "#2abfbf",
    panel: "#1a4040",
    text: "#e0f7f7",
  },
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

/**
 * One of the two picture cards that close the page. The button is not a real
 * button — the whole card is the link — so it is a span styled as one, which
 * keeps a single focus stop and avoids a nested interactive element.
 */
function CardLink({
  href,
  image,
  base,
  wash,
  title,
  action,
  titleClassName = "",
}: {
  href: string;
  image: string;
  base: string;
  wash: string;
  title: string;
  action: string;
  titleClassName?: string;
}) {
  return (
    <TenantLink
      href={href}
      className="group relative block h-[320px] overflow-hidden rounded-[20px] lg:h-[400px]"
      style={{ backgroundColor: base }}
    >
      <Image
        src={image}
        alt=""
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(min-width: 1024px) 640px, 100vw"
      />
      <div className="absolute inset-0" style={{ backgroundColor: wash }} />
      <span
        className={`absolute start-6 top-6 font-display text-2xl font-extrabold text-[#f3f4f6] lg:start-12 lg:top-12 lg:text-[32px] ${titleClassName}`}
      >
        {title}
      </span>
      {/* Design pins the button 300px from the card top; on the shorter
          mobile card that would fall off the bottom, so it is anchored to the
          bottom edge at the distance those two work out to. */}
      <span className="absolute bottom-6 start-6 inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold uppercase text-[#f3f4f6] lg:bottom-[59px] lg:start-12">
        {action}
      </span>
    </TenantLink>
  );
}

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
        title={t("heroTitle")}
        backgroundImage="/images/about-hero-cross.jpg"
        size="tall"
        titleVariant="ghost"
        titleCase="sentence"
        align="center"
      >
        {/* The design's card row is 1140px — a little wider than the 1120px
            text column it sits under — which is what gives each card the
            273px that keeps "Leadership training" on one line. Subgrid then
            pins every header to the same height, so a language that does wrap
            the header still leaves the four card bodies aligned.

            The row gap is zeroed at that width and only there. Once a card is
            a subgrid spanning both rows, the row gap is no longer space
            between cards — it is space inside one, and it was splitting each
            header off its own description with a stripe of the photograph
            showing through. Below lg the cards are ordinary grid items again
            and the same gap is doing the job it looks like it is doing. */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:-mx-[10px] lg:grid-cols-4 lg:grid-rows-[auto_1fr] lg:gap-y-0">
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
              <div
                className="px-5 py-6"
                style={{ backgroundColor: card.panel }}
              >
                <p
                  className="text-center text-sm leading-[1.6]"
                  style={{ color: card.text }}
                >
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
              {t("paragraph2Prefix")} <em className="italic">apostolos</em>{" "}
              {t("paragraph2")}
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

      {/* Two cards on white. The design lays these out 1280px wide — wider
          than the 1104px text column above them — so they get their own
          wrapper rather than the standard Container. A negative margin would
          have been shorter but overflows the viewport between lg and 1360. */}
      <section className="bg-white pb-24">
        <div className="mx-auto w-full max-w-[1360px] px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[802fr_454fr]">
            <CardLink
              href="/about/statement-of-faith"
              image="/images/about-statement-faith-card.jpg"
              // Each card washes its photo in a different blue: the wide one
              // in #0d328a at 60%, as the design specifies, the narrow one in
              // the darker night.
              //
              // That wash is the only blue here now. The file this used to
              // point at had the wash already baked into it, so the card was
              // being tinted twice and came out a flat blue with the mountains
              // barely readable — the same trap the mission card fell into,
              // noted below. The photograph is now the untinted original.
              base="#0d328a"
              wash="rgba(13,50,138,0.6)"
              title={t("cardStatementOfFaithTitle")}
              action={tCommon("learnMore")}
            />
            <CardLink
              href="/about/mission"
              image="/images/about-mission-card.jpg"
              base="#0d328a"
              // Night at 60%, as the design draws it. The stand-in this held
              // before was a dark worship scene with a wash already baked into
              // the file, so 60% darkened it twice and the picture disappeared;
              // it ran at 35% until the design's own photo arrived. That photo
              // is here now and is lit from behind, so it takes the full wash.
              wash="rgba(5,10,46,0.6)"
              title={t("cardMissionStatementTitle")}
              action={tCommon("learnMore")}
              // The design holds this title to 252px so it breaks over two
              // lines; a longer translation simply takes a third.
              titleClassName="max-w-[252px]"
            />
          </div>
        </div>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
