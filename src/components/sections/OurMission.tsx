import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

export default async function OurMission() {
  const t = await getTranslations("Home.OurMission");

  return (
    <section className="bg-mist py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <p className="font-display text-3xl font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-4xl">
            {t("statementPrefix")}{" "}
            <span className="text-brand-blue">{t("statementEmphasis")}</span>{" "}
            {t("statementSuffix")}
          </p>
          <Button href="/about/mission" variant="ghostDark" className="mt-8">
            {t("readFullStatement")}
          </Button>
        </div>

        <div className="space-y-8 lg:pt-2">
          <p className="text-lg leading-relaxed text-ink-muted">
            {t("nameOrigin")}
          </p>
          <p className="text-lg leading-relaxed text-ink-muted">
            {t("history")}
          </p>
          <Button href="/about/history" variant="ghostDark">
            {t("ourHistory")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
