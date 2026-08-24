import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { OurMissionData } from "@/lib/homeBlockTypes";

export default async function OurMission({ data }: { data?: OurMissionData } = {}) {
  const t = await getTranslations("Home.OurMission");

  return (
    <section className="bg-mist py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          <p className="font-display text-3xl font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-4xl">
            {data?.statementPrefix ?? t("statementPrefix")}{" "}
            <span className="text-brand-blue">
              {data?.statementEmphasis ?? t("statementEmphasis")}
            </span>{" "}
            {data?.statementSuffix ?? t("statementSuffix")}
          </p>
          <Button href="/about/mission" variant="ghostDark" className="mt-8">
            {data?.readFullStatementLabel ?? t("readFullStatement")}
          </Button>
        </div>

        <div className="space-y-8 lg:pt-2">
          <p className="text-lg leading-relaxed text-ink-muted">
            {data?.nameOrigin ?? t("nameOrigin")}
          </p>
          <p className="text-lg leading-relaxed text-ink-muted">
            {data?.history ?? t("history")}
          </p>
          <Button href="/about/history" variant="ghostDark">
            {data?.ourHistoryLabel ?? t("ourHistory")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
