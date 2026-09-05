import SiteImage from "@/components/ui/SiteImage";
import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import { SentSwooshIcon } from "@/components/ui/icons";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";
import type { MinistriesData } from "@/lib/homeBlockTypes";
import { mediaUrl } from "@/lib/homeBlockTypes";

type Step = {
  tag: string;
  title: string;
  description: string;
  href: string;
  from: string;
  to: string;
  imageUrl?: string;
};

async function getDefaultSteps(): Promise<Step[]> {
  const t = await getTranslations("Home.Ministries");
  return [
    {
      tag: t("connectTag"),
      title: t("connectTitle"),
      description: t("connectDescription"),
      href: "/get-involved",
      from: "#2a5eec",
      to: "#0d1f52",
      imageUrl: "/images/ministry-connect.webp",
    },
    {
      tag: t("growTag"),
      title: t("growTitle"),
      description: t("growDescription"),
      href: "/get-involved",
      from: "#3a6cd8",
      to: "#0d1f52",
      imageUrl: "/images/ministry-grow.webp",
    },
    {
      tag: t("leadTag"),
      title: t("leadTitle"),
      description: t("leadDescription"),
      href: "/get-involved",
      from: "#4d8df6",
      to: "#0d1f52",
      imageUrl: "/images/ministry-lead.webp",
    },
    {
      tag: t("sentTag"),
      title: t("sentTitle"),
      description: t("sentDescription"),
      href: "/get-involved",
      from: "#1449c6",
      to: "#050a2e",
    },
  ];
}

async function getSteps(data?: MinistriesData): Promise<Step[]> {
  const defaultSteps = await getDefaultSteps();

  if (data?.steps?.length) {
    return data.steps.map((step, index) => {
      const fallback = defaultSteps[index % defaultSteps.length];
      return {
        tag: step.tag ?? fallback.tag,
        title: step.title ?? fallback.title,
        description: step.description ?? fallback.description,
        href: step.href ?? fallback.href,
        from: fallback.from,
        to: fallback.to,
        imageUrl: mediaUrl(step.image) ?? fallback.imageUrl,
      };
    });
  }

  const docs = await fetchCollectionSafely(async (payload) => {
    const result = await payload.find({
      collection: "ministries",
      sort: "order",
      limit: 4,
      depth: 1,
    });
    return result.docs;
  });

  if (!docs) return defaultSteps;

  return docs.map((doc, index) => {
    const fallback = defaultSteps[index % defaultSteps.length];
    const image = mediaUrl(doc.image);

    return {
      tag: doc.tag,
      title: doc.title,
      description: doc.description,
      href: doc.href || fallback.href,
      from: fallback.from,
      to: fallback.to,
      imageUrl: image,
    };
  });
}

export default async function Ministries({ data }: { data?: MinistriesData } = {}) {
  const [steps, t] = await Promise.all([getSteps(data), getTranslations("Home.Ministries")]);

  return (
    <section className="bg-white py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Eyebrow>{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
            <h2 className="max-w-xl font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
              {data?.heading ?? t("heading")}
            </h2>
          </div>
          <Button href="/get-involved" variant="ghostDark" className="shrink-0">
            {data?.getInvolvedLabel ?? t("getInvolved")}
          </Button>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            // 1px hairline border with a 12px radius, per the design spec —
            // the photo sits inside the border rather than above it.
            <div
              key={step.tag}
              className="flex flex-col overflow-hidden rounded-xl border border-black/10"
            >
              <div className="relative aspect-[256/160]">
                {step.imageUrl ? (
                  <>
                    <SiteImage
                      src={step.imageUrl}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <span className="absolute start-3 top-3 rounded-md bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {step.tag}
                    </span>
                  </>
                ) : (
                  <>
                    <PlaceholderPhoto className="absolute inset-0" from={step.from} to={step.to} />
                    <span className="absolute start-3 top-3 rounded-md bg-black/25 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {step.tag}
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 flex items-center justify-center text-white"
                    >
                      <SentSwooshIcon className="h-[70px] w-[128px]" />
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{step.description}</p>
                <Button href={step.href} variant="ghostDark" className="mt-5 self-start">
                  {t("learnMore")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
