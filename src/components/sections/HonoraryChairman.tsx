import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

export default function HonoraryChairman() {
  return (
    <section className="bg-night-deep py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div>
          <Eyebrow tone="light">Our First Honorary Chairman</Eyebrow>
          <p className="font-display text-xl italic text-white/70">
            Following the Legacy of
          </p>
          <h2 className="mt-1 font-display text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            Dr. Ralph D. Winter
          </h2>

          <div className="mt-6 inline-flex flex-col items-start font-display text-xl font-bold uppercase leading-[1.5] tracking-[-0.01em] text-white sm:text-2xl">
            <span className="bg-brand-blue px-2 py-0.5">Go therefore</span>
            <span className="mt-1 bg-brand-blue px-2 py-0.5">
              and make disciples
            </span>
            <span className="mt-1 bg-brand-blue px-2 py-0.5">
              of all nations&hellip;{" "}
              <span className="text-sm normal-case">&mdash;Matthew 28:19</span>
            </span>
          </div>
        </div>

        <PlaceholderPhoto
          className="aspect-square w-full max-w-[320px] rounded-2xl"
          from="#3a4256"
          to="#14161f"
          label="Dr. Ralph D. Winter portrait"
        />
      </Container>
    </section>
  );
}
