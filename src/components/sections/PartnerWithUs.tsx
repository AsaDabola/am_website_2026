import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

export default function PartnerWithUs() {
  return (
    <section className="bg-gradient-to-br from-mist to-[#dbe6f9] py-24">
      <Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <Eyebrow>Partner with us</Eyebrow>
          <h2 className="max-w-lg font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            Send someone you will never meet.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Every gift puts Bible study, training and a sending community
            within reach of students who are ready to go.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-4">
          <Button href="/give" variant="solid">
            Give today
          </Button>
          <Button href="/contact" variant="outlineBlue" icon={false}>
            Talk to us
          </Button>
        </div>
      </Container>
    </section>
  );
}
