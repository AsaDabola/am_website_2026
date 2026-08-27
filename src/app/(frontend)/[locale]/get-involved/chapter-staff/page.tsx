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
  title: "Chapter Staff | AM International",
  description:
    "Serve as a Chapter leader or staff member and help lead local programs and gatherings.",
};

export default async function ChapterStaffPage() {
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
          { label: "Chapter Staff" },
        ]}
        title="Get Involved"
        subtitle={t("tagline")}
        // The same night sky the Testimony banner uses — the design puts it
        // behind both, which is why the file is named for the photograph
        // rather than for either page.
        backgroundImage="/images/hero-night-sky.webp"
      />
      <GetInvolvedSubNav active="/get-involved/chapter-staff" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>Get involved</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Chapter Staff
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "/images/chapter-volunteer-1.webp",
              "/images/chapter-volunteer-2.webp",
              "/images/chapter-volunteer-3.webp",
            ].map((src) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-[733px] text-base leading-relaxed text-ink-muted">
            Being a Chapter leader and a staff throughout college life is one of the most
            rewarding experiences that students can have as followers of Christ. It is
            spirit-filled roles and positions that help and guide many other students who wish to
            know Jesus. Our Chapter leaders and staff go through resourceful and empowering
            training at the onsite venues where they can learn how to lead local programs and
            hold gatherings and meetings. Chapter leaders and staff share unforgettable memories
            of participating in the Gospel mission in their college years. We invite you to join
            our Chapter Staff team.
          </p>

          <Button href="/get-involved/volunteer#apply" className="mt-8">
            Apply here
          </Button>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <div className="relative aspect-[1375/687] w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/chapter-volunteer-group.webp"
              alt="AM chapter staff and students"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
