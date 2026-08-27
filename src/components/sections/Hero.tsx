import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import HeroSlides from "@/components/sections/HeroSlides";
import HeroStats from "@/components/sections/HeroStats";
import type { HeroData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

/**
 * Default rotation for the hero. An editor who sets a background image on the
 * Hero block in the CMS gets that single image instead, rather than having a
 * chosen photo cycle away.
 */
const DEFAULT_SLIDES = [
  // The boardwalk at sunrise leads: it is the shot the team named as the main
  // banner, and the one the rotation returns to.
  "/images/hero-boardwalk.webp",
  "/images/hero-campus.webp",
  "/images/hero-slide-campus.webp",
  "/images/hero-slide-bible-study.webp",
  "/images/hero-slide-hikers.webp",
];

export default async function Hero({ data }: { data?: HeroData } = {}) {
  const t = await getTranslations("Home.Hero");

  const stats = [
    { value: data?.stat1?.value ?? t("stat1Value"), label: data?.stat1?.label ?? t("stat1Label") },
    { value: data?.stat2?.value ?? t("stat2Value"), label: data?.stat2?.label ?? t("stat2Label") },
    { value: data?.stat3?.value ?? t("stat3Value"), label: data?.stat3?.label ?? t("stat3Label") },
  ];

  const cmsBackground = mediaUrl(data?.backgroundImage);
  const slides = cmsBackground ? [cmsBackground] : DEFAULT_SLIDES;

  return (
    <section className="relative overflow-hidden bg-night">
      <HeroSlides images={slides} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night/70 via-night/20 to-transparent" />

      <Container className="relative flex min-h-[720px] flex-col justify-center py-24">
        <Eyebrow tone="light">{data?.eyebrow ?? t("eyebrow")}</Eyebrow>

        {/* Three deliberate lines, matching the design: the middle line stays
            unbroken however narrow the viewport gets. */}
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white [text-shadow:0px_4px_14px_rgba(0,0,0,0.4)] sm:text-6xl lg:text-[80px]">
          {data?.headingLine1 ?? t("headingLine1")}
          <br />
          <span className="whitespace-nowrap text-[#c5ddff]">
            {data?.headingHighlight1 ?? t("headingWhere")}
          </span>
          <br />
          <span className="text-[#c5ddff]">{data?.headingHighlight2 ?? t("headingWeAre")}</span>
        </h1>

        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="/bible-study" variant="solidNavy">
            {data?.joinBibleStudyLabel ?? t("joinBibleStudy")}
          </Button>
          <Button href="/about" variant="outlineLight" icon={false}>
            {data?.whoWeAreLabel ?? t("whoWeAre")}
          </Button>
        </div>

        <HeroStats stats={stats} />
      </Container>
    </section>
  );
}
