import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";

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
      href: "/bible-study",
      from: "#2a5eec",
      to: "#0d1f52",
    },
    {
      tag: t("growTag"),
      title: t("growTitle"),
      description: t("growDescription"),
      href: "/ministries",
      from: "#3a6cd8",
      to: "#0d1f52",
    },
    {
      tag: t("leadTag"),
      title: t("leadTitle"),
      description: t("leadDescription"),
      href: "/get-involved",
      from: "#4d8df6",
      to: "#0d1f52",
      imageUrl: "/images/ministry-lead.png",
    },
    {
      tag: t("sentTag"),
      title: t("sentTitle"),
      description: t("sentDescription"),
      href: "/get-involved",
      from: "#1449c6",
      to: "#050a2e",
      imageUrl: "/images/ministry-sent.png",
    },
  ];
}

async function getSteps(): Promise<Step[]> {
  const defaultSteps = await getDefaultSteps();

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
    const image =
      doc.image && typeof doc.image === "object" ? doc.image.url ?? undefined : undefined;

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

export default async function Ministries() {
  const [steps, t] = await Promise.all([getSteps(), getTranslations("Home.Ministries")]);

  return (
    <section className="bg-white py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="max-w-xl font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
              {t("heading")}
            </h2>
          </div>
          <Button href="/get-involved" variant="ghostDark" className="shrink-0">
            {t("getInvolved")}
          </Button>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.tag} className="flex flex-col">
              <div className="relative aspect-[256/160] overflow-hidden rounded-2xl">
                {step.imageUrl ? (
                  <Image
                    src={step.imageUrl}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <PlaceholderPhoto className="absolute inset-0" from={step.from} to={step.to} />
                )}
                <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {step.tag}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {step.description}
              </p>
              <Button href={step.href} variant="ghostDark" className="mt-5">
                {t("learnMore")}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
