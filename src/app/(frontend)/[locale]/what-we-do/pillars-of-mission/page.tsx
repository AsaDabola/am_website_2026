import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import WhatWeDoSubNav from "@/components/what-we-do/WhatWeDoSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Our Pillars of Mission | AM International",
  description:
    "AM International is a world-wide community of believers dedicated towards the spreading of the Gospel across university campuses, through 4 pillars of mission.",
};

const pillars = [
  {
    title: "Evangelism",
    image: "/images/pillars-evangelism.jpg",
    paragraphs: [
      "Evangelism is at the core of everything AM is and does. We wish to go and make disciples of every campus in every nation. We are not only consumers of the grace of God, but we wish to share it in accordance with Biblical instruction.",
      "Dr. Ralph D. Winter, our First Chairman, divided Evangelism into four categories: E0, E1, E2, and E3. His perspective on Evangelism gave an eye-opening realization that Christians are still far from reaching every people group beyond diverse cultural gaps. “E3” indicates the Evangelism that requires cultural crossing to a radically different people group.",
      "Following his legacy, AM endeavors to create numerous evangelism tools to reach all nations, peoples, and languages to embrace every individual regardless of their geographical and cultural gaps.",
    ],
  },
  {
    title: "Education",
    image: "/images/pillars-education.jpg",
    paragraphs: [
      "Hosea 4:6 says, “…my people perish because of a lack of knowledge.” Paul says again in Romans 10:2 that the Israelites have a zeal for God, but not based on knowledge.",
      "In a world full of knowledge, AM International wishes to reaffirm the authority of the Word and uphold it as the center of our lives. The true knowledge is that which comes from God’s Word by knowing Him and living according to that.",
      "Thus, AM has created Bible study materials divided in 5 phases, resources, and activities all with the focus of understanding the truth of the Bible and making Jesus Christ known. Our Online Bible School, AM Academy (amacademy.org), provides a variety of educational tracks to support AM education.",
    ],
  },
  {
    title: "Discipleship",
    image: "/images/pillars-discipleship.jpg",
    paragraphs: [
      "Being a disciple may feel difficult at times. A true disciple is the one who follows the life of Jesus — the life of the cross. For this, apart from spreading the love of Christ to others actively and guiding the youth with Biblical truth, our ministry walks alongside students to help them live a godly life for Christ in this era. As disciples of Jesus we wish to impact the world and influence people through the power of the gospel.",
      "“Cheap grace is the preaching of forgiveness without requiring repentance, baptism without church discipline, Communion without confession, absolution without personal confession. Cheap grace is grace without discipleship, grace without the cross, grace without Jesus Christ, living and incarnate,” wrote Dietrich Bonhoeffer in his famous book, “The Cost of Discipleship”.",
      "AM’s central vision is to raise and make true disciples who experience the power of the Cross and Resurrection. We continue to formulate various programs that aim to equip and raise young disciples of Jesus that will bring a powerful transformation of the world.",
    ],
  },
  {
    title: "Mission",
    image: "/images/pillars-mission.jpg",
    paragraphs: [
      "Thriving campus mission powerfully advances our world mission. AM is highly dedicated to the work of spreading the Gospel and fulfilling the Great Commission by going into all nations. Through AM, numerous youth are taking the distinctive role of participating in local mission while in school or long-term mission after graduation.",
      "AM staff, volunteers, and members use their talents and gifts to participate in God’s mission of teaching the Gospel and making disciples among the youth of the world. Our small/large group Bible studies, leadership training, online education, Internships and short-term mission trips provide countless opportunities for young people to participate in God’s mission.",
      "In line with campus mission, AM continues to build channels that reinforce our World Mission effort to keep expanding, so join our endeavor to reach the unreached groups!",
    ],
  },
];

export default async function PillarsOfMissionPage() {
  const [t, tPractice, tHeader] = await Promise.all([
    getTranslations("Common"),
    getTranslations("InPractice"),
    getTranslations("Header"),
  ]);

  const overview = [
    { tag: tPractice("bibleStudyTag"), description: tPractice("bibleStudyDescription") },
    { tag: tPractice("leadershipTrainingTag"), description: tPractice("leadershipTrainingDescription") },
    { tag: tPractice("onlineEducationTag"), description: tPractice("onlineEducationDescription") },
    { tag: tPractice("internshipsTripsTag"), description: tPractice("internshipsTripsDescription") },
  ];

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: tHeader("whatWeDo") },
          { label: tHeader("whatWeDoMenu.pillarsOfMission") },
        ]}
        title={tHeader("whatWeDo")}
        subtitle={t("tagline")}
      />
      <WhatWeDoSubNav active="/what-we-do/pillars-of-mission" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>What we do</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Empowering Future Leaders
          </h1>
          <p className="mx-auto mt-4 max-w-[733px] text-base leading-relaxed text-ink-muted">
            Raising today&rsquo;s youth to impact tomorrow.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["/images/pillars-intro-1.jpg", "/images/pillars-intro-2.jpg", "/images/pillars-intro-3.jpg"].map(
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
            AM International is a world-wide community of believers dedicated towards the
            spreading of the Gospel across university campuses. We aim to foster a
            Christ-centered network of young Christians for the mobilization of campus mission.
            The youth are the leaders of today, therefore, AM seeks to empower today&rsquo;s
            youth with the Word of God, leadership skills, and Christian values so that they may
            lead with the power of truth. We do this through 4 pillars of mission which aim to
            fulfill the dream of Jesus and the vision of the Gospel across the world.
          </p>
        </Container>
      </section>

      {pillars.map((pillar, index) => (
        <section key={pillar.title} className={index % 2 === 0 ? "bg-white py-20" : "bg-mist py-20"}>
          <Container>
            <div className="grid items-start gap-10 lg:grid-cols-[386px_1fr] lg:gap-16">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 386px, 100vw"
                />
              </div>
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
                  {pillar.title}
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-muted">
                  {pillar.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{tPractice("eyebrow")}</Eyebrow>
          </div>
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {tPractice("heading")}
          </h2>

          <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
            {overview.map((item) => (
              <div key={item.tag} className="border-t-2 border-black/10 pt-6">
                <h3 className="font-display text-base font-bold text-ink">{item.tag}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
