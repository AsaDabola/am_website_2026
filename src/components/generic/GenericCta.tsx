import Container from "@/components/ui/Container";
import TenantLink from "@/components/layout/TenantLink";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericCta({
  heading,
  body,
  button,
  background,
}: {
  heading: string;
  body?: string;
  button: { label: string; href: string };
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-20 text-center lg:py-24`}>
      <Container>
        <h2 className={`font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl ${bg.heading}`}>
          {heading}
        </h2>
        {body ? <p className={`mx-auto mt-5 max-w-[640px] leading-relaxed ${bg.body}`}>{body}</p> : null}
        <TenantLink
          href={button.href}
          className="mt-9 inline-block rounded-full bg-brand-blue px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform duration-200 hover:scale-[1.02]"
        >
          {button.label}
        </TenantLink>
      </Container>
    </section>
  );
}
