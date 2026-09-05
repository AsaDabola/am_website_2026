import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import SiteImage from "@/components/ui/SiteImage";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
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
  title: "Bible Studies | AM International",
  description:
    "Six tracks of Bible study, from a first look at the gospel through to discipling others.",
};

type Track = {
  title: string;
  image?: string;
  from: string;
  to: string;
  description: string;
};

const tracks: Track[] = [
  {
    title: "Phase 1 — Book of Romans, chapters 1–8",
    image: "/images/bible-study-sola-fide.webp",
    from: "#2a5eec",
    to: "#0d1f52",
    description:
      "Sola Fide — \"faith alone\" — lays the foundation of the gospel: who Jesus is, what He did on the cross, and what it means to trust in Him alone for salvation.",
  },
  {
    title: "Phase 2 — Bible Core: the Four Spiritual Laws",
    image: "/images/bible-study-bible-core.webp",
    from: "#3a6cd8",
    to: "#0d1f52",
    description:
      "Bible Core builds a working foundation in Scripture — how the Bible fits together as one story, and how to read and study it for yourself.",
  },
  {
    title: "Phase 3(1) — The Ancestors of Faith",
    image: "/images/bible-study-faith.webp",
    from: "#4d8df6",
    to: "#0d1f52",
    description:
      "Traces the faith of the Old Testament patriarchs and prophets, showing how God's promises to His people carried forward to Christ.",
  },
  {
    title: "Phase 3(2) — Basics of Christian Life",
    image: "/images/bible-study-christian-life.webp",
    from: "#1449c6",
    to: "#050a2e",
    description:
      "A practical study of prayer, community, and discipleship — the everyday habits and disciplines of following Jesus.",
  },
  {
    title: "Phase 4 — Only Jesus: Gospel Studies",
    image: "/images/bible-study-only-jesus.webp",
    from: "#2a5eec",
    to: "#0d1f52",
    description:
      "A deeper look at the person and work of Christ, preparing students to understand and articulate what they believe, and why.",
  },
  {
    title: "Phase 5 — Discipleship Track",
    image: "/images/bible-study-discipleship-track.webp",
    from: "#0d1f52",
    to: "#050a2e",
    description:
      "For students ready to disciple others — equipping them to pass on what they've learned to the next generation of leaders.",
  },
];

async function BibleStudyPage() {
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
          { label: "Bible Studies" },
        ]}
        // The section's name over the photograph, at the shorter hero height,
        // solid and left-aligned — the same header every other Get Involved
        // page carries and what the design draws here. This page was setting a
        // tall, centred, outlined title of its own name instead, which left
        // the page's own name with nowhere to sit below.
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
        backgroundImage="/images/bible-study-hero.webp"
      />
      {/* Both Bible study pages sit inside Get Involved and the design gives
          each the section's tabs under the hero, with Bible Studies marked —
          the join page is a step within it rather than a tab of its own. */}
      <GetInvolvedSubNav active="/bible-study" />

      <section className="bg-mist py-20">
        <Container className="max-w-[720px] text-center">
          <div className="flex justify-center">
            <Eyebrow>Sign up for our Bible studies today</Eyebrow>
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Bible Studies
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-base leading-relaxed text-ink-muted">
            Apostolos Missions offers various Bible study programs that will nurture your
            spiritual life and relationship with the Lord Jesus. These Bible studies were
            created to guide each person to mature in faith and truth so that everyone can be
            equipped to serve Jesus and His Kingdom. We are currently offering six tracks of
            Bible Study Programs: Phase 1 the Book of Romans, Phase 2 Bible Core, Phase 3(1)
            The Ancestors of Faith, Phase 3(2) Basics of Christian Life, Phase 4 Only Jesus,
            and Phase 5 the Discipleship Track. Sign up for our Bible studies today by filling
            out the request form and our teachers will contact you with further information.
          </p>
          <Button href="/bible-study/join" variant="solid" className="mt-9">
            Click here to Join our Bible Studies Today!
          </Button>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="space-y-20">
          {tracks.map((track) => (
            <div
              key={track.title}
              className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16"
            >
              <div>
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
                  {track.title}
                </h2>
                <span className="mt-4 block h-1 w-10 rounded-full bg-brand-blue" />
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                  {track.description}
                </p>
              </div>
              {track.image ? (
                <div className="relative aspect-[666/520] w-full overflow-hidden rounded-2xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]">
                  <SiteImage
                    src={track.image}
                    alt={track.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              ) : (
                <PlaceholderPhoto
                  className="aspect-[666/520] w-full rounded-2xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]"
                  from={track.from}
                  to={track.to}
                  label={track.title}
                />
              )}
            </div>
          ))}
        </Container>
      </section>

      {/* The design closes this page with the same Events & Testimonials
          row the rest of the Get Involved section uses. */}
      <EventsAndTestimonials />

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/bible-study", BibleStudyPage);
