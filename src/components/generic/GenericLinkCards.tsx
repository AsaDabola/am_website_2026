import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import TenantLink from "@/components/layout/TenantLink";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericLinkCards({
  eyebrow,
  heading,
  cards,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  cards: { image: string; imageAlt?: string; title: string; body?: string; href: string }[];
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 lg:py-20`}>
      <Container>
        {eyebrow ? <Eyebrow tone={bg.eyebrowTone}>{eyebrow}</Eyebrow> : null}
        {heading ? (
          <h2 className={`font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl ${bg.heading}`}>
            {heading}
          </h2>
        ) : null}
        <div className={`grid grid-cols-1 gap-6 sm:grid-cols-3 ${heading || eyebrow ? "mt-10" : ""}`}>
          {cards.map((card) => (
            <TenantLink key={card.title} href={card.href} className="group block">
              <div className="relative aspect-[431/242] w-full overflow-hidden rounded-2xl">
                <Image
                  src={card.image}
                  alt={card.imageAlt || ""}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className={`mt-6 text-xl font-semibold leading-snug ${bg.heading}`}>{card.title}</h3>
              {card.body ? <p className={`mt-2 text-sm leading-relaxed ${bg.body}`}>{card.body}</p> : null}
            </TenantLink>
          ))}
        </div>
      </Container>
    </section>
  );
}
