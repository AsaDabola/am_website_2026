import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Online Bible Study | AM International",
  description:
    "Apostolos Mission chapters offer online Bible studies for those who are unable to connect with our physical campus or local ministry locations.",
};

export default async function OnlineBibleStudyPage() {
  const [t, tHeader] = await Promise.all([
    getTranslations("Common"),
    getTranslations("Header"),
  ]);

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: tHeader("getInvolved"), href: "/get-involved" },
          { label: "Online Bible Study" },
        ]}
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
        backgroundImage="/images/group-activities-hero.jpg"
      />
      <GetInvolvedSubNav active="/get-involved/online-bible-study" />

      <section className="bg-mist py-20">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>What we do</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Online Bible Study
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <PlaceholderPhoto
              className="aspect-square rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              from="#2a5eec"
              to="#0d1f52"
              label="Online Bible Study"
            />
            <PlaceholderPhoto
              className="aspect-square rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              from="#3a6cd8"
              to="#0d1f52"
              label="Online Bible Study"
            />
            <PlaceholderPhoto
              className="aspect-square rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              from="#4d8df6"
              to="#0d1f52"
              label="Online Bible Study"
            />
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="max-w-[720px] text-center">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
            In-depth Bible study for anyone, anywhere.
          </h2>
          <p className="mx-auto mt-6 text-base leading-relaxed text-ink-muted">
            Apostolos Mission chapters offer online Bible studies for those who are unable to
            connect with our physical campus or local ministry locations. If you are not near
            one of our physical chapters, we would love to help you get connected with an online
            Bible study in your area or time zone. Fill out the form below, and our team will
            contact you with more information.
          </p>
          <Button href="/contact" className="mt-8">
            Click here
          </Button>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
