import Image from "next/image";
import Container from "@/components/ui/Container";
import TenantLink from "@/components/layout/TenantLink";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericImageText({
  image,
  imageAlt,
  imageSide = "left",
  heading,
  body,
  button,
  secondaryButton,
  background,
}: {
  image: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
  heading: string;
  body: string;
  button?: { label: string; href: string };
  secondaryButton?: { label: string; href: string };
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 lg:py-24`}>
      <Container>
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-mist bg-white lg:grid-cols-2">
          <div
            className={`relative min-h-[320px] w-full lg:min-h-[420px] ${imageSide === "right" ? "lg:order-2" : ""}`}
          >
            <Image src={image} alt={imageAlt || ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-8 py-12 lg:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">{body}</p>
            {button || secondaryButton ? (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {button ? (
                  <TenantLink
                    href={button.href}
                    className="inline-block w-fit rounded-full bg-brand-blue px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform duration-200 hover:scale-[1.02]"
                  >
                    {button.label}
                  </TenantLink>
                ) : null}
                {secondaryButton ? (
                  <TenantLink
                    href={secondaryButton.href}
                    className="inline-block w-fit rounded-full border border-brand-blue px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue transition-transform duration-200 hover:scale-[1.02]"
                  >
                    {secondaryButton.label}
                  </TenantLink>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
