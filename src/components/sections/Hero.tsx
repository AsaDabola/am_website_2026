import { getTranslations } from "@/i18n/content";
import HeroSlides, { type HeroSlide } from "@/components/sections/HeroSlides";
import type { HeroData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

/**
 * Default rotation for the hero: four photographs, each with the line the
 * design pairs it with, in the order the team named.
 *
 * An editor who sets a background image on the Hero block in the CMS gets that
 * single photograph with the heading they typed, rather than having their
 * choice cycle away.
 */
const DEFAULT_SLIDES = [
  // The order named by the team: the embrace, the boardwalk, the chapel from
  // the air, hands on an open Bible.
  //
  // The message keys are held with their photograph rather than derived from
  // position, because the two are no longer in step: the city slide came out
  // and the boardwalk moved up behind it, so slide 2 on the page reads the
  // `slide5` strings. Renumbering the keys instead would orphan the
  // translations already sitting under them in 47 other locales.
  { image: "/images/hero-campus.webp", key: "slide1" },
  { image: "/images/hero-boardwalk.webp", key: "slide5" },
  { image: "/images/hero-slide-campus.webp", key: "slide3" },
  { image: "/images/hero-slide-bible-study.webp", key: "slide4" },
] as const;

export default async function Hero({ data }: { data?: HeroData } = {}) {
  const t = await getTranslations("Home.Hero");

  const stats = [
    { value: data?.stat1?.value ?? t("stat1Value"), label: data?.stat1?.label ?? t("stat1Label") },
    { value: data?.stat2?.value ?? t("stat2Value"), label: data?.stat2?.label ?? t("stat2Label") },
    { value: data?.stat3?.value ?? t("stat3Value"), label: data?.stat3?.label ?? t("stat3Label") },
  ];

  const cmsBackground = mediaUrl(data?.backgroundImage);
  /**
   * The Hero block still holds three heading fields from when the headline was
   * one fixed line over a rotating background. The design draws two lines, so
   * the two highlighted fields join into the second rather than the third
   * being quietly dropped — an editor's words all reach the page.
   */
  const cmsHighlight = [data?.headingHighlight1, data?.headingHighlight2]
    .filter(Boolean)
    .join(" ");
  const slides: HeroSlide[] = cmsBackground
    ? [
        {
          image: cmsBackground,
          line1: data?.headingLine1 || t("slide1Line1"),
          line2: cmsHighlight || t("slide1Line2"),
        },
      ]
    : DEFAULT_SLIDES.map(({ image, key }) => ({
        image,
        line1: t(`${key}Line1`),
        line2: t(`${key}Line2`),
      }));

  return (
    <section className="relative overflow-hidden bg-night">
      <HeroSlides
        slides={slides}
        eyebrow={data?.eyebrow ?? t("eyebrow")}
        joinBibleStudyLabel={data?.joinBibleStudyLabel ?? t("joinBibleStudy")}
        whoWeAreLabel={data?.whoWeAreLabel ?? t("whoWeAre")}
        stats={stats}
      />
    </section>
  );
}
