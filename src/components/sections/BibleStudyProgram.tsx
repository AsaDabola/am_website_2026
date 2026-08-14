import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

export default function BibleStudyProgram() {
  return (
    <section className="bg-mist py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[416px_1fr] lg:gap-20">
        <PlaceholderPhoto
          className="aspect-[416/520] w-full rounded-[18px] shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]"
          from="#3a6cd8"
          to="#0d1f52"
          label="Bible Study group photo"
        />

        <div>
          <Eyebrow>Join our Bible Study Program</Eyebrow>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            A 5-phase path from first question to being sent.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            AM&rsquo;s 5-phase Bible Study Program is an online discipleship
            and Bible education program that leads students through a
            systematic flow of learning the Gospel of Jesus Christ and the
            life of faith. The program groups students with Bible teachers
            who will give instruction according to the listener&rsquo;s
            schedule. It culminates with the opportunity to volunteer, train
            as a student missionary, or simply dive deeper into the Word of
            God with AM.
          </p>
          <Button href="/bible-study" variant="solid" className="mt-9">
            Start the program
          </Button>
        </div>
      </Container>
    </section>
  );
}
