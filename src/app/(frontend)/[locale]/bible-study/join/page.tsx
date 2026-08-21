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
        backgroundImage="/images/hero-slide-bible-study.jpg"
        size="large"
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
