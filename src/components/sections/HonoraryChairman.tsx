import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import type { HonoraryChairmanData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

export default async function HonoraryChairman({ data }: { data?: HonoraryChairmanData } = {}) {
  const t = await getTranslations("Home.HonoraryChairman");
  const name = data?.name ?? t("name");
  const image = mediaUrl(data?.image) ?? "/images/honorary-chairman.png";

  return (
    <section className="bg-night-deep py-24">
      <Container className="grid items-start gap-6 lg:grid-cols-[1fr_300px] lg:gap-10">
        <div>
          <Eyebrow tone="light">{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          <p className="font-display text-xl italic text-white/70">
            {data?.followingLegacy ?? t("followingLegacy")}
          </p>
          <h2 className="mt-1 font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            {name}
          </h2>
        </div>

        <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl justify-self-start lg:justify-self-end">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="300px"
          />
        </div>

        <div className="mt-2 inline-flex flex-col items-start font-display text-xl font-bold uppercase leading-[1.5] tracking-[-0.01em] text-white sm:text-2xl lg:col-span-2">
          <span className="bg-brand-blue px-2 py-0.5">{data?.quoteLine1 ?? t("quoteLine1")}</span>
          <span className="mt-1 bg-brand-blue px-2 py-0.5">
            {data?.quoteLine2 ?? t("quoteLine2")}
          </span>
          <span className="mt-1 bg-brand-blue px-2 py-0.5">
            {data?.quoteLine3 ?? t("quoteLine3")}{" "}
            <span className="text-sm">{data?.quoteReference ?? t("quoteReference")}</span>
          </span>
        </div>
      </Container>
    </section>
  );
}
