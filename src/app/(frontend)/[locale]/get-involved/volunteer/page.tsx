import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  BookIcon,
  MonitorIcon,
  PaletteIcon,
  HeartIcon,
} from "@/components/ui/icons";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import VolunteerApplicationForm from "@/components/get-involved/VolunteerApplicationForm";
import EventsAndTestimonials from "@/components/sections/EventsAndTestimonials";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Get Involved | AM International",
  description:
    "AM is always happy to welcome family in Christ interested in volunteering in our mission.",
};

/**
 * Four roles, all of them things a volunteer actually does. The fifth tile
 * this page used to carry — "Your Gift", linking to the donate page — is gone
 * with the design: giving money is not volunteering, and sitting it in a row
 * of roles asked the reader to compare the two.
 */
const categories = [
  {
    title: "Mission Volunteer",
    Icon: HeartIcon,
    description:
      "Serve and support local campus chapters by organizing fellowship events, bible study meetings, and coordinating outreach activities to connect students with Christ.",
  },
  {
    title: "Bible Teacher",
    Icon: BookIcon,
    description:
      "Guide others on a transformative spiritual journey. Instruct and mentor seekers and believers through structured curriculum, helping them establish a solid scriptural foundation.",
  },
  {
    title: "Online Content Developers",
    Icon: MonitorIcon,
    description:
      "Utilize your creative design, writing, or web development skills to produce inspiring online media, manage social channels, and expand the digital presence of our ministries.",
  },
  {
    title: "IT & Design",
    Icon: PaletteIcon,
    description:
      "Gospel spreads much faster than before as IT advances rapidly. If you have skills in IT and Web Design, join us now to bring even more excellent outcomes soon in sharing the Good News of Jesus.",
  },
];

async function VolunteerPage() {
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
          { label: "Volunteer" },
        ]}
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
        // Without this the hero falls through to AboutHero's default banner,
        // which is the seabird — a stock shot belonging to no page in
        // particular. The fourth of the supplied photographs is a group
        // setting out with packs, which is what volunteering with AM looks
        // like from the outside.
        backgroundImage="/images/volunteer-hero.webp"
      />
      <GetInvolvedSubNav active="/get-involved/volunteer" />

      <section className="bg-paper py-20">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Get Involved</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Volunteer
          </h1>

          {/* 400 x 348 in the design — landscape, not the squares this was
              cropping to, which cut the tops off the group shots. */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { src: "/images/volunteer-calling.webp", alt: "Students leading worship at an AM chapter gathering" },
              { src: "/images/volunteer-team.webp", alt: "Two volunteers on the welcome desk at an AM event" },
              { src: "/images/volunteer-worship.webp", alt: "An AM chapter worship team after a service" },
            ].map(({ src, alt }) => (
              <div
                key={src}
                className="relative aspect-[400/348] overflow-hidden rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
            ))}
          </div>

          {/* The quotation mark is decorative and sits outside the measure, so
              it is aria-hidden and absolutely placed rather than being read
              out ahead of the sentence it decorates. */}
          <figure className="relative mx-auto mt-16 flex max-w-[1106px] flex-col items-center gap-6 py-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-2 left-0 font-quote text-[96px] font-semibold leading-none text-ink-muted/35 sm:-left-12"
            >
              &ldquo;
            </span>
            <blockquote className="font-quote text-2xl italic leading-[34px] text-ink-muted">
              My concern is not with closed doors; my concern is with the doors that are open
              which we do not enter.
            </blockquote>
            <figcaption className="text-sm font-medium leading-[22px] text-ink-muted/75">
              Dr. Ralph D. Winter, Perspectives on the World Christian Movement
            </figcaption>
            <p className="text-base leading-[26px] text-ink-muted">
              AM is always happy to welcome family in Christ interested in volunteering in our
              mission for a period of time. We believe that God has given unique gifts to each
              person and they can be used preciously for the glory of God.
            </p>
          </figure>
        </Container>
      </section>

      {/* Four across at the design's width, all reading down rather than
          across, so the columns line up under one another. Not links any more
          — each names a way to serve and the one application below covers all
          four, so a link per column would have sent four routes to one form. */}
      <section className="bg-white py-24">
        <Container>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ title, Icon, description }) => (
              <div key={title} className="text-center">
                <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-mist text-brand-navy-deep">
                  <Icon className="size-9" />
                </span>
                <h3 className="mt-6 font-display text-lg font-bold tracking-[-0.02em] text-ink">
                  {title}
                </h3>
                <p className="mt-6 text-sm leading-relaxed text-ink-muted">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="apply" className="bg-mist py-24">
        <Container>
          <div className="text-center">
            <div className="flex justify-center">
              <Eyebrow>Join the Mission</Eyebrow>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Volunteer Application
            </h2>
            <p className="mx-auto mt-8 max-w-[982px] text-base leading-relaxed text-ink-muted">
              AM operates under four main areas generally referred to as education, media,
              public relations, and administration. Volunteer and intern posts can vary from
              leadership roles to shadowing positions. A manual and application for volunteers
              and potential interns can be received upon request. Feel free to contact{" "}
              <a
                href="mailto:mission@amintl.org"
                className="font-medium text-brand-navy-deep underline underline-offset-2"
              >
                mission@amintl.org
              </a>{" "}
              for more information.
            </p>
            {/* The programme description the single-page form used to open
                with. It belongs to the reader deciding whether to apply, not
                to the first step of the application, so it sits here with the
                rest of the introduction rather than inside the wizard. */}
            <p className="mx-auto mt-6 max-w-[982px] text-base leading-relaxed text-ink-muted">
              A mission teammate participates in and plans evangelistic methods that align with the
              chapter&rsquo;s goal for growth, working out how to reach the student body
              effectively and fostering an environment of spiritual growth and discipleship among
              college students. The team is a community of believers centred on the Word and
              fellowship, with a heart to spread the Gospel across university campuses worldwide.
            </p>
          </div>

          {/* 1200px in the design: a 680px form column beside a 360px sidebar,
              with the gutter between them. The old single-column form sat in
              887px, which cannot hold both. */}
          <div className="mx-auto mt-14 max-w-[1200px]">
            <VolunteerApplicationForm />
          </div>
        </Container>
      </section>

      <EventsAndTestimonials />

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/get-involved/volunteer", VolunteerPage);
