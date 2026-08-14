import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

export default async function BibleStudyProgram() {
  const t = await getTranslations("Home.BibleStudyProgram");

  return (
    <section className="bg-mist py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[416px_1fr] lg:gap-20">
        <PlaceholderPhoto
          className="aspect-[416/520] w-full rounded-[18px] shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]"
          from="#3a6cd8"
          to="#0d1f52"
          label="Bible Study group photo"
        />

        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            {t("heading")}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            {t("description")}
          </p>
          <Button href="/bible-study" variant="solid" className="mt-9">
            {t("cta")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
