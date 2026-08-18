import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Group Activities | AM International",
  description:
    "Morning QT, Group Bible Study, Large Group Fellowship, Friday Prayer Meeting, and weekend activities across AM chapters.",
};

const activities = [
  {
    eyebrow: "Campus Daily Devotional",
    title: "Sustain Your Spirit with Morning QT",
    image: "/images/group-activities-morning-qt.jpg",
    imageSide: "right" as const,
    paragraphs: [
      "Campus life is often drawn to night culture, losing the freshness of the morning. God called His people to seek His truth and pray in the morning. Just as Israelites collected manna (bread) in the morning and quail (meat) in the evening, Jesus provides profound grace and renewing strength when we come to him in the morning, hear His Word, and pray in the evening.",
      "Morning QT (Quiet Time) of the Word and prayer sustains our spiritual life on campus, full of His power and truth.",
    ],
  },
  {
    eyebrow: "Deeper Understanding",
    title: "Gather and Share at Group Bible Study",
    image: "/images/group-activities-bible-study.jpg",
    imageSide: "left" as const,
    paragraphs: [
      "Group Bible Study allows students to gather and share the Word and prayer. Each study session is comprised of a series of bible studies according to the theme continuing for a set period of time.",
      "Stay tuned for the news and announcement from your chapter about upcoming Group Bible Study programs.",
    ],
  },
  {
    eyebrow: "Weekly Gatherings",
    title: "Experience Power in Large Group Fellowship",
    image: "/images/group-activities-fellowship.jpg",
    imageSide: "right" as const,
    paragraphs: [
      "When the chapter grows number to more than fifty student members, AM local chapter hosts a Large Group Fellowship every week with worship music, Bible messages, prayer, and fellowship.",
    ],
  },
  {
    eyebrow: "Friday Gatherings",
    title: "Sincere Hearts at Friday Prayer Meeting",
    image: "/images/group-activities-prayer.jpg",
    imageSide: "left" as const,
    paragraphs: [
      "We all have many topics to pray for. AM holds a prayer gathering every Friday. We pray for the world mission, our countries and cities, our campus, and our personal topics.",
      "“The prayer of a righteous person is powerful and effective” (James 5:16). Praying in a group is more impactful and strengthening!",
    ],
  },
];

export default async function GroupActivitiesPage() {
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
        title="Group Activities"
        subtitle={t("tagline")}
        backgroundImage="/images/group-activities-hero.jpg"
      />
      <GetInvolvedSubNav active="/get-involved/group-activities" />

      {activities.map((item, index) => (
        <section
          key={item.title}
          className={index % 2 === 0 ? "bg-white py-20" : "bg-mist py-20"}
        >
          <Container>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                item.imageSide === "left" ? "" : "lg:[&>*:first-child]:order-2"
              }`}
            >
              <div className="relative aspect-[520/400] overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
                  {item.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
                  {item.title}
                </h2>
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-muted">
                  {item.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="bg-white py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[480px_1fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
                Campus Life &amp; Fun
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
                Building Community with Weekend Activities
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-ink-muted">
                AM Campus chapters hold fun weekend activities that include Donut Fellowship,
                Sports Activities, Picnics, Brunch Book Club, Barbecues, and many others. Check
                out our local chapter news to find the program!
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                "/images/group-activities-weekend-1.jpg",
                "/images/group-activities-weekend-2.jpg",
                "/images/group-activities-weekend-3.jpg",
                "/images/group-activities-weekend-4.jpg",
              ].map((src, i) => (
                <div
                  key={src}
                  className={`relative overflow-hidden rounded-xl ${
                    i === 1 || i === 2 ? "col-span-1 aspect-[240/360]" : "aspect-[120/360]"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
