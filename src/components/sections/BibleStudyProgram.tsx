import SiteImage from "@/components/ui/SiteImage";
import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { BibleStudyProgramData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

export default async function BibleStudyProgram({ data }: { data?: BibleStudyProgramData } = {}) {
  const t = await getTranslations("Home.BibleStudyProgram");
  const image = mediaUrl(data?.image) ?? "/images/bible-study-group.webp";

  return (
    <section className="bg-mist py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[416px_1fr] lg:gap-20">
        <div className="relative aspect-[416/520] w-full overflow-hidden rounded-[18px] shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]">
          <SiteImage
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 416px, 100vw"
          />
        </div>

        <div>
          <Eyebrow>{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            {data?.heading ?? t("heading")}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            {data?.description ?? t("description")}
          </p>
          <Button href="/bible-study" variant="solid" className="mt-9">
            {data?.ctaLabel ?? t("cta")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
