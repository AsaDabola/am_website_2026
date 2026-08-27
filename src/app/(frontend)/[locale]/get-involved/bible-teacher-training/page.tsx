import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
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

/**
 * The four steps as the design lays them out. `body` is a list because the
 * design breaks the second step's copy into two paragraphs with a gap, and
 * running them together loses the pause it was written with.
 *
 * Step one's call to action is the blue pill; step two's is a plain bold link.
 * They are different things in the design and the difference is the point —
 * one starts the course, the other reads about it.
 */
const steps = [
  {
    number: "1",
    title: "Finish 5-Phase Bible Study Curriculum.",
    body: ["(You will receive the proof account when you have completed our Bible Study course.)"],
    button: { label: "Click Here", href: "/bible-study/join" },
    caption: "Click the button below to sign up for Bible Study Curriculum.",
  },
  {
    number: "2",
    title: "Apply for Bible Teacher Training",
    body: [
      "(You will receive the Bible Teacher Certificate when you have finished the course.)",
      "Find more information about our Bible Teacher Certificate in our online bible school website.",
    ],
    link: { label: "Read More", href: "https://www.amacademy.org" },
  },
  {
    number: "3",
    title: "Activate Your Bible Teacher Account",
    body: ["in AM Academy to share the Gospel with many souls."],
  },
  {
    number: "4",
    title: "Continue to join resourceful, educational biblical programs to fulfill your calling!",
    body: [],
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
              src="/images/bible-teacher-called-to-serve.webp"
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

      {/* The design gives this band its own grey, a shade off both `mist` above
          it and `paper`; it is the one colour here with no token, so it stays
          literal rather than being rounded to a near neighbour. */}
      <section className="bg-[#f1f3f7] py-24">
        <Container className="max-w-[1200px]">
          {/* No rule before this one, unlike the site's other eyebrows — the
              design sets it as plain centred text. */}
          <p className="text-center text-sm font-medium uppercase tracking-[2px] text-brand-blue">
            Join our Bible Studies!
          </p>
          {/* 48px in the design, held to two lines by the width rather than a
              hard break, so a translation longer than the English wraps
              instead of overflowing. */}
          <h2 className="mx-auto mt-4 max-w-[460px] text-center font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[48px] sm:leading-[52.8px]">
            Steps to Become Bible Teacher
          </h2>

          <div className="mt-16 grid gap-x-6 gap-y-12 text-start sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative border-t-2 border-[rgba(16,24,40,0.12)] pt-6"
              >
                {/* Big, light, and overlapping the rule — the design draws it
                    as part of the column's furniture rather than a label, so
                    it is hidden from assistive tech and the title carries the
                    meaning. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute end-0 -top-1 select-none font-display text-[72px] font-normal leading-none text-[#bfbfbf] lg:text-[92px]"
                >
                  {step.number}
                </span>

                <h3 className="relative max-w-[65%] font-display text-[19px] font-bold leading-[1.15] text-ink">
                  {step.title}
                </h3>

                {step.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="relative mt-4 text-[15px] leading-[21px] text-ink-muted"
                  >
                    {paragraph}
                  </p>
                ))}

                {step.button && (
                  <Button
                    href={step.button.href}
                    variant="solid"
                    className="relative mt-5 !px-6 !py-2.5 !text-sm"
                  >
                    {step.button.label}
                  </Button>
                )}

                {step.link && (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener"
                    className="relative mt-4 inline-block text-[15px] font-bold text-brand-blue hover:underline"
                  >
                    {step.link.label}
                  </a>
                )}

                {step.caption && (
                  <p className="relative mt-4 text-[15px] leading-[21px] text-ink-muted">
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
              src="/images/bible-teacher-called-to-be.webp"
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
