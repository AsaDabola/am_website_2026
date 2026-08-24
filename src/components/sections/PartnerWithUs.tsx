import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { PartnerWithUsData } from "@/lib/homeBlockTypes";

export default async function PartnerWithUs({ data }: { data?: PartnerWithUsData } = {}) {
  const t = await getTranslations("Home.PartnerWithUs");

  return (
    // The band is a saturated blue field, not a white one. The two radial
    // tints were already the design's — they were just being laid over white,
    // which turned the section into a pale panel and left the heading in ink
    // where the design has it near-white.
    <section
      className="py-28"
      style={{
        backgroundColor: "#1449c6",
        backgroundImage:
          "radial-gradient(120% 70% at 85% 0%, rgba(20, 73, 198, 0.18) 0%, rgba(20, 73, 198, 0.00) 60%), radial-gradient(100% 60% at 5% 100%, rgba(77, 141, 246, 0.14) 0%, rgba(77, 141, 246, 0.00) 60%)",
      }}
    >
      <Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <Eyebrow tone="onBlue">{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          {/* Widths are the design's, and they are what set the line breaks:
              432px turns the heading into "Send someone you / will never
              meet." rather than carrying "will" up to the first line. */}
          <h2 className="max-w-[432px] font-display text-4xl font-semibold leading-[1.1] tracking-[-0.028em] text-[#f2f5fa] sm:text-5xl">
            {data?.heading ?? t("heading")}
          </h2>
          <p className="mt-4 max-w-[607px] text-[21px] leading-[1.6] text-white">
            {data?.description ?? t("description")}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-4">
          <Button href="/get-involved/donate" variant="solid">
            {data?.giveTodayLabel ?? t("giveToday")}
          </Button>
          {/* Translucent white over the blue, not a blue outline — that one
              was drawn for the white background this section used to have. */}
          <Button href="/contact" variant="outlineLight" icon={false}>
            {data?.talkToUsLabel ?? t("talkToUs")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
