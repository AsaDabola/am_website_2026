import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

type Stage = { label: string; title: string; body: string; color: string; href?: string };

/**
 * A connected, numbered, color-coded journey — one continuous line running
 * through every stage on desktop/tablet, and the same line turned vertical
 * on mobile.
 */
export default function GenericJourney({
  eyebrow,
  heading,
  stages,
  background,
}: {
  eyebrow?: string;
  heading?: string;
  stages: Stage[];
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  const numbered = stages.map((stage, index) => ({ ...stage, number: String(index + 1).padStart(2, "0") }));

  return (
    <section className={`${bg.section} py-16 lg:py-20`}>
      <Container>
        <div className={`rounded-2xl border p-8 sm:p-10 ${bg.dark ? "border-white/15 bg-white/5" : "border-mist bg-paper"}`}>
          {eyebrow || heading ? (
            <div className="mb-2">
              {eyebrow ? <Eyebrow tone={bg.eyebrowTone}>{eyebrow}</Eyebrow> : null}
              {heading ? (
                <h2 className={`mt-2 font-display text-3xl font-bold tracking-[-0.02em] ${bg.heading}`}>{heading}</h2>
              ) : null}
            </div>
          ) : null}

          {/* Desktop/tablet: one connected horizontal line through every stage. */}
          <div className={`hidden md:flex md:items-start ${eyebrow || heading ? "mt-10" : ""}`}>
            {numbered.map((stage, index) => {
              const Tag = stage.href ? "a" : "div";
              return (
                <Tag
                  key={stage.label}
                  {...(stage.href ? { href: stage.href } : {})}
                  className={`flex flex-1 flex-col items-center text-center ${stage.href ? "group transition-opacity hover:opacity-80" : ""}`}
                >
                  <div className="flex w-full items-center">
                    <div
                      className="h-[2px] flex-1"
                      style={{ background: index === 0 ? "transparent" : numbered[index - 1].color }}
                    />
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white lg:size-14 lg:text-base"
                      style={{ background: stage.color }}
                    >
                      {stage.number}
                    </div>
                    <div
                      className="h-[2px] flex-1"
                      style={{ background: index === numbered.length - 1 ? "transparent" : stage.color }}
                    />
                  </div>

                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: stage.color }}>
                    {stage.label}
                  </p>
                  <h3 className={`mt-1 font-display text-base font-bold ${bg.heading}`}>{stage.title}</h3>
                  <p className={`mt-2 max-w-[210px] text-[13px] leading-[18px] ${bg.body}`}>{stage.body}</p>
                </Tag>
              );
            })}
          </div>

          {/* Mobile: the same journey as a vertical connected timeline. */}
          <div className={`flex flex-col md:hidden ${eyebrow || heading ? "mt-10" : ""}`}>
            {numbered.map((stage, index) => {
              const Tag = stage.href ? "a" : "div";
              return (
                <div key={stage.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                      style={{ background: stage.color }}
                    >
                      {stage.number}
                    </div>
                    {index < numbered.length - 1 ? (
                      <div className="my-1 w-[2px] flex-1" style={{ background: stage.color, minHeight: "28px" }} />
                    ) : null}
                  </div>
                  <Tag {...(stage.href ? { href: stage.href } : {})} className={index < numbered.length - 1 ? "pb-7" : undefined}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: stage.color }}>
                      {stage.label}
                    </p>
                    <h3 className={`mt-1 font-display text-base font-bold ${bg.heading}`}>{stage.title}</h3>
                    <p className={`mt-1.5 max-w-[420px] text-sm leading-[21px] ${bg.body}`}>{stage.body}</p>
                  </Tag>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
