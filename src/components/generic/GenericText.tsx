import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericText({
  eyebrow,
  heading,
  paragraphs,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  paragraphs: string[];
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
        <div className={`space-y-6 text-lg leading-relaxed ${bg.body} ${heading || eyebrow ? "mt-8" : ""}`}>
          {paragraphs.map((body) => (
            <p key={body}>{body}</p>
          ))}
        </div>
      </Container>
    </section>
  );
}
