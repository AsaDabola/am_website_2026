import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericList({
  eyebrow,
  heading,
  items,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  items: string[];
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
        <ul className={`list-disc space-y-3 pl-6 leading-relaxed ${bg.body} ${heading || eyebrow ? "mt-8" : ""}`}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
