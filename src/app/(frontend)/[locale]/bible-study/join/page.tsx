import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import AboutHero from "@/components/about/AboutHero";
import BibleStudySignupForm from "@/components/bible-study/BibleStudySignupForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Join our Bible Studies | AM International",
  description:
    "Fill out the form below and one of our teachers will reach out with more information.",
};

export default function JoinBibleStudyPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved", href: "/get-involved" },
          { label: "Bible Studies", href: "/bible-study" },
          { label: "Join our Bible Studies" },
        ]}
        title="Join our Bible Studies"
        backgroundImage="/images/bible-study-join-hero.jpg"
        // The design draws this one at 964px rather than the shorter hero the
        // rest of the section uses — the photograph is the invitation — and
        // centres the title rather than sitting it on the floor of the frame.
        size="tall"
        titlePlacement="middle"
        // The raised hands are lit against a projection screen, so the middle
        // of this photograph is the brightest part of it. A tall hero would
        // normally take the light wash; this one needs the deeper one or the
        // white title washes out exactly where it lands.
        wash="deep"
        titleVariant="ghost"
        align="center"
      >
        {/* Two columns along the floor of the hero: who AM is on the left,
            and where this fits on the right. 700 + 40 + 700 in the design,
            which is two equal columns and a gap — stacked on a phone, where
            side by side would leave neither enough width to read. */}
        <div className="grid gap-10 pt-16 lg:grid-cols-2">
          <p className="text-base leading-[1.5] text-on-dark">
            AM International is a world-wide community of believers dedicated towards the
            spreading of the Gospel across university campuses. We aim to foster a
            Christ-centered network of young Christians for the mobilization of campus
            mission.
          </p>
          <div className="flex flex-col items-start gap-[26px]">
            <p className="text-sm leading-normal text-white">
              We do this through 4 pillars of mission which aim to fulfill the dream of Jesus
              and the vision of the Gospel across the world.
              <span className="mt-4 block">Want to find out where you fit?</span>
            </p>
            <Button href="/what-we-do/pillars-of-mission" variant="outlineWhite" icon={false}>
              See More
            </Button>
          </div>
        </div>
      </AboutHero>

      <GetInvolvedSubNav active="/bible-study" />

      <section className="bg-mist py-20">
        <Container className="max-w-[847px]">
          <BibleStudySignupForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
