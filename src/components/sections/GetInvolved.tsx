import Image from "next/image";
import { getTranslations } from "@/i18n/content";
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
        description: card.description ?? "",
        href: card.href ?? "/get-involved",
        image: mediaUrl(card.image) ?? "/images/get-involved-volunteer.jpg",
      }))
    : [
        {
          title: t("missionTrip"),
          description: t("missionTripDescription"),
          href: "/get-involved",
          image: "/images/get-involved-mission-trip.jpg",
        },
        {
          title: t("shortTermMission"),
          description: t("shortTermMissionDescription"),
          href: "/get-involved/internship",
          image: "/images/get-involved-short-term-mission.jpg",
        },
        {
          title: t("discipleshipTraining"),
          description: t("discipleshipTrainingDescription"),
          href: "/bible-study",
          image: "/images/get-involved-discipleship-training.jpg",
        },
        {
          title: t("volunteering"),
          description: t("volunteeringDescription"),
          href: "/get-involved/volunteer",
          image: "/images/get-involved-volunteering.jpg",
        },
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

        {/* Photograph, then the name, then the body — the design sets the
            title below the frame rather than over it, so the portrait crop
            stays uncovered and the four bodies line up on a shared baseline. */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <TenantLink key={card.title} href={card.href} className="group block text-start">
              <div className="relative aspect-[416/520] overflow-hidden rounded-2xl">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h3 className="mt-5 flex items-center gap-2 font-display text-xl font-bold tracking-[-0.02em] text-ink">
                {card.title}
                <ArrowRightIcon className="size-4 shrink-0 text-brand-blue opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              {card.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{card.description}</p>
              )}
            </TenantLink>
          ))}
        </div>
      </Container>
    </section>
  );
}
