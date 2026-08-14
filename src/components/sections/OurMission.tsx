import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

export default function OurMission() {
  return (
    <section className="bg-mist py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>Our mission</Eyebrow>
          <p className="font-display text-3xl font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-4xl">
            Apostolos Missions&rsquo; mission is to{" "}
            <span className="text-brand-blue">
              preach Jesus and Him crucified
            </span>{" "}
            &mdash; fostering a Christ-centred network of young Christians for
            the mobilisation of campus mission.
          </p>
          <Button href="/about/mission" variant="ghostDark" className="mt-8">
            Read the full mission statement
          </Button>
        </div>

        <div className="space-y-8 lg:pt-2">
          <p className="text-lg leading-relaxed text-ink-muted">
            The name <em className="italic">apostolos</em> is the Greek word
            for apostle. It means &ldquo;one who is sent on a mission.&rdquo;
          </p>
          <p className="text-lg leading-relaxed text-ink-muted">
            What began as a small group of passionate young students in Los
            Angeles, California, eager to spread the gospel and make Jesus
            known, has become a global organisation working across university
            campuses around the world.
          </p>
          <Button href="/about/history" variant="ghostDark">
            Our history
          </Button>
        </div>
      </Container>
    </section>
  );
}
