import Image from "next/image";
import Container from "@/components/ui/Container";
import TenantLink from "@/components/layout/TenantLink";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericFeature({
  heading,
  intro,
  image,
  imageAlt,
  items,
  button,
  background,
}: {
  heading: string;
  intro: string;
  image: string;
  imageAlt?: string;
  items: { icon?: string; title: string; body: string }[];
  button?: { label: string; href: string };
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 lg:py-20`}>
      <Container>
        <div className="rounded-3xl bg-paper px-8 py-12 sm:px-12 sm:py-16 lg:px-12 lg:py-20">
          <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mt-6 max-w-[720px] leading-relaxed text-ink-muted">{intro}</p>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            <div className="relative aspect-[640/492] w-full min-w-0 overflow-hidden rounded-2xl">
              <Image src={image} alt={imageAlt || ""} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>

            <div className="min-w-0">
              <div className="space-y-8">
                {items.map((item) => (
                  <div key={item.title} className="flex gap-6">
                    {item.icon ? (
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white">
                        <Image src={item.icon} alt="" width={22} height={22} aria-hidden="true" />
                      </div>
                    ) : null}
                    <p className="leading-relaxed text-ink-muted">
                      <span className="font-semibold text-ink">{item.title}</span>
                      <br />
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              {button ? (
                <TenantLink
                  href={button.href}
                  className="mt-10 inline-flex items-center gap-2 font-semibold text-brand-navy-deep transition-opacity hover:opacity-80"
                >
                  {button.label}
                </TenantLink>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
