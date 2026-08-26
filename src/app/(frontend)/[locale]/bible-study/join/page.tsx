import type { Metadata } from "next";
import Container from "@/components/ui/Container";
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
      />

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
