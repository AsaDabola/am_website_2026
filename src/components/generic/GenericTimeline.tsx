import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericTimeline({
  eyebrow,
  heading,
  items,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  items: { year: string; title?: string; body: string }[];
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 lg:py-20`}>
      <Container className="max-w-[860px]">
        {eyebrow ? <Eyebrow tone={bg.eyebrowTone}>{eyebrow}</Eyebrow> : null}
        {heading ? (
          <h2 className={`font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl ${bg.heading}`}>
            {heading}
          </h2>
        ) : null}
        <div
          className={`space-y-12 border-l-2 pl-8 ${bg.dark ? "border-white/30" : "border-brand-blue/20"} ${heading || eyebrow ? "mt-12" : ""}`}
        >
          {items.map((item) => (
            <div key={`${item.year}-${item.title ?? item.body}`} className="relative">
              <span
                className={`absolute -left-[41px] top-1 size-4 rounded-full border-4 bg-brand-blue ${bg.dark ? "border-night" : "border-white"}`}
              />
              <p className="text-sm font-bold tracking-[0.1em] text-brand-blue">{item.year}</p>
              {item.title ? (
                <p className={`mt-1 font-display text-xl font-semibold ${bg.heading}`}>{item.title}</p>
              ) : null}
              <p className={`mt-2 leading-relaxed ${bg.body}`}>{item.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
