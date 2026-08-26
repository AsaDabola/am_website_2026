import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import InternshipApplicationForm from "@/components/get-involved/InternshipApplicationForm";
import EventsAndTestimonials from "@/components/sections/EventsAndTestimonials";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Internship | AM International",
  description:
    "AM offers several internship opportunities. If you have passion for serving in mission using your gifts and talents and would like to be part of our internship programs, apply today!",
};

const tracks = [
  {
    title: "Summer Internship",
    paragraphs: [
      "Our summer internship program runs all summer long, beginning on the last week of June and ending on the last week of August. The internship could range from anywhere between 2-6 weeks. It is designed to help the participant grow more in the Word and as a leader. It will cover diverse areas of mission which will help interns better serve their local or overseas mission.",
      "This includes, but is not limited to, being exposed to an abundance of the Word, learning how to run a local chapter, being involved in media and content creation, evangelism (online & onsite), and participating in administrative works. Yes, we will have trips and fun activities too! Those interested in our summer internship must fill out an application and have an interview with one of our staff.",
    ],
  },
  {
    title: "Short-term Internship",
    paragraphs: [
      "Our short-term internship is for 3 months at our headquarters. This internship is designed for those who are ready to serve mission full-time or part-time. Through these 3 months, you will be involved in mission works that will aid towards becoming a chapter leader. This internship program includes various lectures on chapter planting, shepherding and counseling, and teaching and preaching as well as mission works that will be carried out on a day-to-day basis in the mission field.",
    ],
  },
  {
    title: "Long-term Internship",
    paragraphs: [
      "AM's long-term internship was created for those who have the desire to become an HQ staff or regional leader. The internship can last anywhere between 6 months to 1 year and the program will involve administrative works such as network development, creating mission resources and content on biblical material. The participant will gain experience and knowledge to further their future ministry calling in AM and beyond.",
    ],
  },
];

export default async function InternshipPage() {
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
          { label: "Internship" },
        ]}
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
        backgroundImage="/images/internship-hero.jpg"
      />
      <GetInvolvedSubNav active="/get-involved/internship" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>Get involved</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Internship
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["/images/internship-1.jpg", "/images/internship-2.jpg", "/images/internship-3.jpg"].map(
              (src) => (
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
              ),
            )}
          </div>

          <p className="mx-auto mt-10 max-w-[733px] text-base leading-relaxed text-ink-muted">
            AM offers several internship opportunities. If you have passion for serving in
            mission using your gifts and talents and would like to be part of our internship
            programs, apply today!
          </p>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="max-w-[1116px] space-y-16">
          {tracks.map((track) => (
            <div key={track.title} className="grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-16">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">
                  {track.title}
                </h2>
                <span className="mt-8 block h-1 w-14 rounded-full bg-brand-blue" />
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-ink-muted">
                {track.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}

        </Container>
      </section>

      {/* The application itself, rather than a link off to the old site. It
          writes into the internship-applications collection, so a submission
          arrives in /admin instead of wherever apply-now used to send it. */}
      <section id="apply" className="bg-paper py-24">
        <Container className="max-w-[1200px]">
          <InternshipApplicationForm />
        </Container>
      </section>

      <EventsAndTestimonials />

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
