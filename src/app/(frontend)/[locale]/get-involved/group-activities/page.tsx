import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import SiteImage from "@/components/ui/SiteImage";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import WeekendPhotoStrip from "@/components/get-involved/WeekendPhotoStrip";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Group Activities | AM International",
  description:
    "Morning QT, Group Bible Study, Large Group Fellowship, Friday Prayer Meeting, and weekend activities across AM chapters.",
};

/**
 * Each heading is two-tone in the design: the lead-in stays ink and the thing
 * being named turns blue. Splitting it in the data rather than marking it up
 * per section keeps the five consistent, and a translation can move the break
 * without touching the markup.
 */
const activities = [
  {
    eyebrow: "Campus Daily Devotional",
    title: "Sustain Your Spirit with ",
    highlight: "Morning QT",
    image: "/images/group-activities-morning-qt.webp",
    imageSide: "right" as const,
    paragraphs: [
      "Campus life is often drawn to night culture, losing the freshness of the morning. God called His people to seek His truth and pray in the morning. Just as Israelites collected manna (bread) in the morning and quail (meat) in the evening, Jesus provides profound grace and renewing strength when we come to him in the morning, hear His Word, and pray in the evening.",
      "Morning QT (Quiet Time) of the Word and prayer sustains our spiritual life on campus, full of His power and truth.",
    ],
  },
  {
    eyebrow: "Deeper Understanding",
    title: "Gather and Share at ",
    highlight: "Group Bible Study",
    image: "/images/group-activities-bible-study.webp",
    imageSide: "left" as const,
    paragraphs: [
      "Group Bible Study allows students to gather and share the Word and prayer. Each study session is comprised of a series of bible studies according to the theme continuing for a set period of time.",
      "Stay tuned for the news and announcement from your chapter about upcoming Group Bible Study programs.",
    ],
  },
  {
    eyebrow: "Weekly Gatherings",
    title: "Experience Power in ",
    highlight: "Large Group Fellowship",
    image: "/images/group-activities-fellowship.webp",
    imageSide: "right" as const,
    paragraphs: [
      "When the chapter grows increasingly in number AM local chapters start to host a Large Group Fellowship every week with worship music, Bible messages, prayer, and fellowship.",
    ],
  },
  {
    eyebrow: "Friday Gatherings",
    title: "Sincere Hearts at ",
    highlight: "Friday Prayer Meeting",
    image: "/images/group-activities-prayer.webp",
    imageSide: "left" as const,
    paragraphs: [
      "We all have many topics to pray for. AM holds a prayer gathering every Friday. We pray for the world mission, our countries and cities, our campus, and our personal topics.",
      "“The prayer of a righteous person is powerful and effective” (James 5:16). Praying in a group is more impactful and strengthening!",
    ],
  },
];

async function GroupActivitiesPage() {
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
          { label: "Group Activities" },
        ]}
        // The section's name, solid and left-aligned with the tagline under
        // it — the same hero every other Get Involved page carries, and what
        // the design draws. This page was the only one setting a ghost,
        // centred title of its own name, which both broke the row and left
        // nothing for the page title below the tabs to say.
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
        backgroundImage="/images/group-activities-hero.webp"
      />
      <GetInvolvedSubNav active="/get-involved/group-activities" />

      {/* The page's own name, below the tabs rather than in the hero. Archivo
          SemiBold at the design's 45px — the same setting the Events &
          Testimonials heading uses. */}
      <section className="bg-white pt-20">
        <Container>
          <h1 className="font-display text-[34px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[45px]">
            Group Activities
          </h1>
        </Container>
      </section>

      {activities.map((item, index) => (
        <section
          key={item.highlight}
          className={index % 2 === 0 ? "bg-white py-20" : "bg-paper py-20"}
        >
          <Container>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                item.imageSide === "left" ? "" : "lg:[&>*:first-child]:order-2"
              }`}
            >
              <div className="relative aspect-[520/400] overflow-hidden rounded-xl">
                <SiteImage
                  src={item.image}
                  alt={`${item.title}${item.highlight}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[1.5px] text-brand-navy-deep">
                  {item.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-[32px] font-bold leading-[1.15] text-ink sm:text-[44px]">
                  {item.title}
                  <span className="text-brand-navy-deep">{item.highlight}</span>
                </h2>
                <div className="mt-6 space-y-6 text-base leading-[1.65] text-ink-muted">
                  {item.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      ))}

      {/* Tinted like the section above it rather than alternating back to
          white — the design closes the page on one band, and this section's
          own layout is different enough to read as a break without one. */}
      <section className="bg-paper py-20">
        <Container>
          <WeekendPhotoStrip
            photos={[
              { src: "/images/group-activities-weekend-1.webp", wide: false },
              { src: "/images/group-activities-weekend-2.webp", wide: true },
              { src: "/images/group-activities-weekend-3.webp", wide: true },
              { src: "/images/group-activities-weekend-4.webp", wide: false },
            ]}
          >
            <p className="text-sm font-semibold uppercase tracking-[1.5px] text-brand-navy-deep">
              Campus Life &amp; Fun
            </p>
            <h2 className="mt-4 font-display text-[32px] font-bold leading-[1.15] text-ink sm:text-[44px]">
              Building Community with{" "}
              <span className="text-brand-navy-deep">Weekend Activities</span>
            </h2>
            <p className="mt-6 text-base leading-[1.65] text-ink-muted">
              AM Campus chapters hold fun weekend activities that include Group Fellowship
              gatherings, Sports Activities, Picnics, Brunch Book Club, Barbecues, and many
              others. Check out our local chapter news to find the program!
            </p>
          </WeekendPhotoStrip>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/get-involved/group-activities", GroupActivitiesPage);
