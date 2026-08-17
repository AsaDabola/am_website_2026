import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import BibleStudySignupForm from "@/components/bible-study/BibleStudySignupForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Join our Bible Studies | AM International",
  description:
    "Fill out the form below and one of our teachers will reach out with more information.",
};

export default async function JoinBibleStudyPage() {
  const t = await getTranslations("Common");

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
        subtitle={t("tagline")}
      />

      <section className="bg-mist py-20">
        <Container className="max-w-[720px] text-center">
          <div className="flex justify-center">
            <Eyebrow>What we do</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Join our Bible Studies
          </h1>
        </Container>

        <Container className="mt-12 max-w-[847px]">
          <BibleStudySignupForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
