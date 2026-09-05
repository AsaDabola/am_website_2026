import type { Metadata } from "next";
import SiteImage from "@/components/ui/SiteImage";
import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import EventsAndTestimonials from "@/components/sections/EventsAndTestimonials";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Online Bible Study | AM International",
  description:
    "Apostolos Mission chapters offer online Bible studies for those who are unable to connect with our physical campus or local ministry locations.",
};

async function OnlineBibleStudyPage() {
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
        backgroundImage="/images/online-bible-study-hero.webp"
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
            {[
              "/images/online-bible-study-1.webp",
              "/images/online-bible-study-2.webp",
              "/images/online-bible-study-3.webp",
            ].map((src) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              >
                <SiteImage
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
            ))}
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

      <EventsAndTestimonials />

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/get-involved/online-bible-study", OnlineBibleStudyPage);
