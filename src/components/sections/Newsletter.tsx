import SiteImage from "@/components/ui/SiteImage";
import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import type { NewsletterData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

export default async function Newsletter({ data }: { data?: NewsletterData } = {}) {
  const t = await getTranslations("Home.Newsletter");
  const backgroundImage = mediaUrl(data?.backgroundImage) ?? "/images/bible-study-collage.webp";

  return (
    <section className="relative min-h-[195px] overflow-hidden">
      <SiteImage
        src={backgroundImage}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-night/40 to-transparent" />

      <Container className="relative flex min-h-[195px] flex-col items-start justify-center gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            {data?.heading ?? t("heading")}
          </h2>
          <p className="mt-1 max-w-lg text-sm text-white/75">
            {data?.description ?? t("description")}
          </p>
        </div>
        <Button href="https://www.amacademy.org" variant="solidNavy" className="shrink-0">
          {data?.ctaLabel ?? t("cta")}
        </Button>
      </Container>
    </section>
  );
}
