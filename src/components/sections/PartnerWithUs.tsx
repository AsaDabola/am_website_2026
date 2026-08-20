import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { PartnerWithUsData } from "@/lib/homeBlockTypes";

export default async function PartnerWithUs({ data }: { data?: PartnerWithUsData } = {}) {
  const t = await getTranslations("Home.PartnerWithUs");

  return (
    <section
      className="py-24"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(120% 70% at 85% 0%, rgba(20, 73, 198, 0.18) 0%, rgba(20, 73, 198, 0.00) 60%), radial-gradient(100% 60% at 5% 100%, rgba(77, 141, 246, 0.14) 0%, rgba(77, 141, 246, 0.00) 60%)",
      }}
    >
      <Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <Eyebrow>{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          <h2 className="max-w-lg font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            {data?.heading ?? t("heading")}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            {data?.description ?? t("description")}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-4">
          <Button href="/get-involved/donate" variant="solid">
            {data?.giveTodayLabel ?? t("giveToday")}
          </Button>
          <Button href="/contact" variant="outlineBlue" icon={false}>
            {data?.talkToUsLabel ?? t("talkToUs")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
