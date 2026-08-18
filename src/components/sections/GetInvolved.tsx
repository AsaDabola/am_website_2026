import Image from "next/image";
import { getTranslations } from "next-intl/server";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { GetInvolvedData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

export default async function GetInvolved({ data }: { data?: GetInvolvedData } = {}) {
  const t = await getTranslations("Home.GetInvolved");

  const cards = data?.cards?.length
    ? data.cards.map((card) => ({
        title: card.title ?? "",
        href: card.href ?? "/get-involved",
        image: mediaUrl(card.image) ?? "/images/get-involved-volunteer.png",
      }))
    : [
        { title: t("bibleStudies"), href: "/bible-study", image: "/images/get-involved-bible-studies.png" },
        { title: t("volunteer"), href: "/get-involved/volunteer", image: "/images/get-involved-volunteer.png" },
        { title: t("internship"), href: "/get-involved/internship", image: "/images/get-involved-internship.png" },
      ];

  return (
    <section className="bg-white py-24">
      <Container>
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            {data?.heading ?? t("heading")}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <TenantLink
              key={card.title}
              href={card.href}
              className="group relative block aspect-[416/520] overflow-hidden rounded-2xl"
            >
              <Image
                src={card.image}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-6 left-6 font-display text-2xl font-bold text-white">
                {card.title}
              </span>
              <span className="absolute bottom-6 right-6 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
                <ArrowRightIcon />
              </span>
            </TenantLink>
          ))}
        </div>
      </Container>
    </section>
  );
}
