import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericStats({
  eyebrow,
  heading,
  stats,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  stats: { value: string; label: string }[];
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 lg:py-20`}>
      <Container>
        {eyebrow ? (
          <div className="flex justify-center">
            <Eyebrow tone={bg.eyebrowTone}>{eyebrow}</Eyebrow>
          </div>
        ) : null}
        {heading ? (
          <h2 className={`text-center font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl ${bg.heading}`}>
            {heading}
          </h2>
        ) : null}
        <div
          className={`grid grid-cols-2 gap-x-8 gap-y-10 text-center sm:grid-cols-4 ${heading || eyebrow ? "mt-12" : ""}`}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className={`font-display text-4xl font-bold sm:text-5xl ${bg.dark ? "text-white" : "text-brand-blue"}`}>
                {stat.value}
              </p>
              <p className={`mt-2 text-sm font-medium ${bg.body}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
