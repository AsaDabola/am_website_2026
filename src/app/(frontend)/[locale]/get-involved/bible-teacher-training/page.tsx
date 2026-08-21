import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Bible Teacher Training | AM International",
  description:
    "Are you interested in becoming a Bible Teacher? AM offers diverse training courses for you to be equipped to teach Bible to different age groups.",
};

const steps = [
  {
    number: "1",
    title: "Finish 5-Phase Bible Study Curriculum.",
    description:
      "(You will receive the proof account when you have completed our Bible Study course.)",
    action: { label: "Click Here", href: "/bible-study/join" },
    caption: "Click the button below to sign up for Bible Study Curriculum.",
  },
  {
    number: "2",
    title: "Apply for Bible Teacher Training",
    description:
      "(You will receive the Bible Teacher Certificate when you have finished the course.) Find more information about our Bible Teacher Certificate in our online bible school website.",
    action: { label: "Read More", href: "https://www.amacademy.org" },
  },
  {
    number: "3",
    title: "Activate Your Bible Teacher Account",
    description: "in AM Academy to share the Gospel with many souls.",
  },
  {
    number: "4",
    title: "Continue to join resourceful, educational biblical programs to fulfill your calling!",
  },
];

export default async function BibleTeacherTrainingPage() {
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
          { label: "Bible Teacher Training" },
        ]}
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
      />
      <GetInvolvedSubNav active="/get-involved/bible-teacher-training" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>AM Academy</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            How To Become A Bible Teacher
          </h1>

          <div className="relative mx-auto mt-10 aspect-[1176/588] max-w-[900px] overflow-hidden rounded-2xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]">
            <Image
              src="/images/bible-teacher-called-to-serve.jpg"
              alt="Called to serve? Become AM Bible Teachers & Missionaries — www.amacademy.org"
              fill
              className="object-cover"
              sizes="(min-width: 900px) 900px, 100vw"
            />
          </div>

          <p className="mx-auto mt-10 max-w-[779px] text-base leading-relaxed text-ink-muted">
            Are you interested in becoming a Bible Teacher? AM offers diverse training courses
            for you to be equipped to teach Bible to different age groups. Contact us with your
            story. We will help you find the most fitting track to share the Gospel. You can also
            visit AM Academy website (www.amacademy.org), our Online Bible School.
          </p>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="max-w-[1200px] text-center">
          <Eyebrow>Join our Bible studies!</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Steps to Become Bible Teacher
          </h2>

          <div className="mt-14 grid gap-10 text-start sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative border-t-2 border-black/10 pt-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute end-0 top-2 select-none font-display text-6xl font-bold text-ink/5"
                >
                  {step.number}
                </span>
                <h3 className="relative max-w-[85%] font-display text-base font-bold text-ink">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="relative mt-3 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                )}
                {step.action && (
                  <Button href={step.action.href} variant="solid" className="relative mt-5 !px-5 !py-2.5 !text-xs">
                    {step.action.label}
                  </Button>
                )}
                {step.caption && (
                  <p className="relative mt-3 text-xs leading-relaxed text-ink-muted">
                    {step.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white pb-24">
        <Container className="max-w-[1200px]">
          <div className="relative aspect-[1249/375] w-full overflow-hidden rounded-2xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]">
            <Image
              src="/images/bible-teacher-called-to-be.jpg"
              alt="Called to be Bible Teachers — AM Academy, www.amacademy.org"
              fill
              className="object-cover"
              sizes="(min-width: 1200px) 1200px, 100vw"
            />
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
