import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

export default async function Hero() {
  const t = await getTranslations("Home.Hero");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
  ];

  return (
    <section className="relative overflow-hidden bg-night">
      <Image
        src="/images/hero-campus.png"
        alt=""
        fill
        priority
        className="object-cover opacity-90"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-transparent" />

      <Container className="relative flex min-h-[720px] flex-col justify-center py-24">
        <Eyebrow tone="light">{t("eyebrow")}</Eyebrow>

        <h1 className="max-w-2xl font-display text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white [text-shadow:0px_4px_14px_rgba(0,0,0,0.4)] sm:text-6xl lg:text-[80px]">
          {t("headingLine1")} <span className="text-[#c5ddff]">{t("headingWhere")}</span>
          <br />
          <span className="text-[#c5ddff]">{t("headingWeAre")}</span>.
        </h1>

        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="/bible-study" variant="solidNavy">
            {t("joinBibleStudy")}
          </Button>
          <Button href="/about" variant="outlineLight" icon={false}>
            {t("whoWeAre")}
          </Button>
        </div>

        <div className="mt-16 flex max-w-xl divide-x divide-white/30 border-t border-white/30 pt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 first:pl-0">
              <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[13px] text-on-dark">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>

      <p className="absolute bottom-8 right-6 hidden text-[11px] uppercase tracking-[0.15em] text-on-dark/45 lg:right-10 lg:block">
        {t("dragToExplore")}
      </p>
    </section>
  );
}
