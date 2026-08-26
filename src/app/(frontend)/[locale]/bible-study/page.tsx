import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

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
    image: "/images/bible-study-sola-fide.jpg",
    from: "#2a5eec",
    to: "#0d1f52",
    description:
      "Sola Fide — \"faith alone\" — lays the foundation of the gospel: who Jesus is, what He did on the cross, and what it means to trust in Him alone for salvation.",
  },
  {
    title: "Phase 2 — Bible Core: the Four Spiritual Laws",
    image: "/images/bible-study-bible-core.jpg",
    from: "#3a6cd8",
    to: "#0d1f52",
    description:
      "Bible Core builds a working foundation in Scripture — how the Bible fits together as one story, and how to read and study it for yourself.",
  },
  {
    title: "Phase 3(1) — The Ancestors of Faith",
    image: "/images/bible-study-faith.jpg",
    from: "#4d8df6",
    to: "#0d1f52",
    description:
      "Traces the faith of the Old Testament patriarchs and prophets, showing how God's promises to His people carried forward to Christ.",
  },
  {
    title: "Phase 3(2) — Basics of Christian Life",
    image: "/images/bible-study-christian-life.jpg",
    from: "#1449c6",
    to: "#050a2e",
    description:
      "A practical study of prayer, community, and discipleship — the everyday habits and disciplines of following Jesus.",
  },
  {
    title: "Phase 4 — Only Jesus: Gospel Studies",
    image: "/images/bible-study-only-jesus.jpg",
    from: "#2a5eec",
    to: "#0d1f52",
    description:
      "A deeper look at the person and work of Christ, preparing students to understand and articulate what they believe, and why.",
  },
  {
    title: "Phase 5 — Discipleship Track",
    image: "/images/bible-study-discipleship-track.jpg",
    from: "#0d1f52",
    to: "#050a2e",
    description:
      "For students ready to disciple others — equipping them to pass on what they've learned to the next generation of leaders.",
  },
];

export default function BibleStudyPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved", href: "/get-involved" },
          { label: "Bible Studies" },
        ]}
        title="Bible Studies"
        backgroundImage="/images/bible-study-hero.jpg"
        size="large"
        titleVariant="ghost"
        align="center"
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
                  <Image
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

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
