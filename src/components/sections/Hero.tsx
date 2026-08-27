import { getTranslations } from "@/i18n/content";
import HeroSlides, { type HeroSlide } from "@/components/sections/HeroSlides";
import type { HeroData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

/**
 * Default rotation for the hero: four photographs, each with the line the
 * design pairs it with. The boardwalk leads — it is the one the team named as
 * the main banner.
 *
 * An editor who sets a background image on the Hero block in the CMS gets that
 * single photograph with the heading they typed, rather than having their
 * choice cycle away.
 */
const DEFAULT_SLIDE_IMAGES = [
  "/images/hero-boardwalk.webp",
  "/images/hero-campus.webp",
  "/images/hero-slide-bible-study.webp",
  "/images/hero-slide-campus.webp",
];

export default async function Hero({ data }: { data?: HeroData } = {}) {
  const t = await getTranslations("Home.Hero");

  const stats = [
    { value: data?.stat1?.value ?? t("stat1Value"), label: data?.stat1?.label ?? t("stat1Label") },
    { value: data?.stat2?.value ?? t("stat2Value"), label: data?.stat2?.label ?? t("stat2Label") },
    { value: data?.stat3?.value ?? t("stat3Value"), label: data?.stat3?.label ?? t("stat3Label") },
  ];

  const cmsBackground = mediaUrl(data?.backgroundImage);
  const slides: HeroSlide[] = cmsBackground
    ? [
        {
          image: cmsBackground,
          line1: data?.headingLine1 ?? t("slide1Line1"),
          line2: data?.headingHighlight1 ?? t("slide1Line2"),
        },
      ]
    : DEFAULT_SLIDE_IMAGES.map((image, i) => ({
        image,
        line1: t(`slide${i + 1}Line1`),
        line2: t(`slide${i + 1}Line2`),
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
