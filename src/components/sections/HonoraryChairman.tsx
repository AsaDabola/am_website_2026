import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export default async function HonoraryChairman() {
  const t = await getTranslations("Home.HonoraryChairman");

  return (
    <section className="bg-night-deep py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div>
          <Eyebrow tone="light">{t("eyebrow")}</Eyebrow>
          <p className="font-display text-xl italic text-white/70">
            {t("followingLegacy")}
          </p>
          <h2 className="mt-1 font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            {t("name")}
          </h2>

          <div className="mt-6 inline-flex flex-col items-start font-display text-xl font-bold uppercase leading-[1.5] tracking-[-0.01em] text-white sm:text-2xl">
            <span className="bg-brand-blue px-2 py-0.5">{t("quoteLine1")}</span>
            <span className="mt-1 bg-brand-blue px-2 py-0.5">{t("quoteLine2")}</span>
            <span className="mt-1 bg-brand-blue px-2 py-0.5">
              {t("quoteLine3")}{" "}
              <span className="text-sm normal-case">{t("quoteReference")}</span>
            </span>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl">
          <Image
            src="/images/honorary-chairman.png"
            alt={t("name")}
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      </Container>
    </section>
  );
}
