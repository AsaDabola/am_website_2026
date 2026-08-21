import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import type { HonoraryChairmanData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

export default async function HonoraryChairman({
  data,
  // On the chairman page this band is the hero, so the name is the page's
  // top-level heading rather than a section heading on the home page.
  headingLevel: Heading = "h2",
}: { data?: HonoraryChairmanData; headingLevel?: "h1" | "h2" } = {}) {
  const t = await getTranslations("Home.HonoraryChairman");
  const name = data?.name ?? t("name");
  const image = mediaUrl(data?.image) ?? "/images/honorary-chairman.jpg";

  const quoteLines = [
    data?.quoteLine1 ?? t("quoteLine1"),
    data?.quoteLine2 ?? t("quoteLine2"),
    data?.quoteLine3 ?? t("quoteLine3"),
  ];
  const quoteReference = data?.quoteReference ?? t("quoteReference");

  // Desktop metrics come from the Figma frame (1920w x 733h): the photo is a
  // 425px square flush with the right edge of the content column and sitting
  // higher than any of the text; the quote is indented past the name and rides
  // up alongside the photo's lower half.
  return (
    <section className="bg-night-deep py-16 lg:pb-[105px] lg:pt-[77px]">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_425px] lg:gap-x-6 lg:gap-y-0">
          <div className="relative aspect-square w-full max-w-[425px] overflow-hidden rounded-2xl lg:col-start-2 lg:row-start-1 lg:max-w-none">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 425px, 100vw"
            />
          </div>

          <div className="lg:col-start-1 lg:row-start-1 lg:pt-[82px]">
            <Eyebrow tone="light">{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
            <p className="font-lato text-lg font-light italic leading-[1.35] tracking-[0.01em] text-white/70 lg:mt-[55px] lg:text-[30px]">
              {data?.followingLegacy ?? t("followingLegacy")}
            </p>
            <Heading className="mt-2 font-display text-4xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl lg:mt-3 lg:text-[79px] lg:leading-[99.3px] lg:tracking-[-0.0563em]">
              {name}
            </Heading>
          </div>

          <div className="flex flex-col items-start gap-1.5 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:-mt-[65px] lg:gap-[10px] lg:ps-[104px]">
            {quoteLines.map((line, index) => (
              <span
                key={line}
                className="bg-brand-blue px-2 py-0.5 font-display text-xl font-extrabold uppercase leading-[1.15] tracking-[-0.02em] text-white sm:text-2xl lg:px-3 lg:py-[2px] lg:text-[46.2px] lg:leading-[53.16px] lg:tracking-[-0.035em]"
              >
                {line}
                {index === quoteLines.length - 1 && (
                  <span className="ms-2 text-[0.5em] font-bold tracking-normal">
                    {quoteReference}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
