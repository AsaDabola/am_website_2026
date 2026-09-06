import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericIconCards({
  eyebrow,
  heading,
  cards,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  cards: { icon?: string; title: string; body: string }[];
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
        <div className={`flex gap-6 overflow-x-auto pb-4 ${heading || eyebrow ? "mt-10" : ""}`}>
          {cards.map((card) => (
            <div key={card.title} className="w-[240px] shrink-0 rounded-2xl border border-mist bg-white p-6">
              {card.icon ? <Image src={card.icon} alt="" width={32} height={32} aria-hidden="true" /> : null}
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
