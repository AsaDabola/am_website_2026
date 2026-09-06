import Container from "@/components/ui/Container";
import { backgroundClasses, type BackgroundValue } from "@/components/generic/background";

export default function GenericQuote({
  quote,
  reference,
  background,
}: {
  quote: string;
  reference?: string;
  background?: BackgroundValue;
}) {
  const bg = backgroundClasses(background);
  return (
    <section className={`${bg.section} py-16 text-center lg:py-20`}>
      <Container className="max-w-[760px]">
        <p className="font-display text-2xl font-semibold italic leading-tight tracking-[-0.02em] text-brand-navy-light lg:text-[32px]">
          {quote}
        </p>
        {reference ? <p className={`mt-4 text-sm font-medium ${bg.body}`}>{reference}</p> : null}
      </Container>
    </section>
  );
}
