import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericCards({
  eyebrow,
  heading,
  cards,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  cards: { title: string; body: string; quote?: string }[];
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
        <div
          className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${heading || eyebrow ? "mt-10" : ""}`}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border p-8 ${bg.dark ? "border-white/15 bg-white/5" : "border-mist bg-white"}`}
            >
              <h3 className={`font-display text-xl font-semibold ${bg.heading}`}>{card.title}</h3>
              <p className={`mt-3 leading-relaxed ${bg.body}`}>{card.body}</p>
              {card.quote ? (
                <p className={`mt-4 italic ${bg.dark ? "text-white/70" : "text-ink-muted/80"}`}>
                  {card.quote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
