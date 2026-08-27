import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PillarsHero from "@/components/what-we-do/PillarsHero";
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
    image: "/images/pillars-evangelism.webp",
    paragraphs: [
      "Evangelism is at the core of everything AM is and does. We wish to go and make disciples of every campus in every nation. We are not only consumers of the grace of God, but we wish to share it in accordance with Biblical instruction.",
      "Dr. Ralph D. Winter, our First Chairman, divided Evangelism into four categories: E0, E1, E2, and E3. His perspective on Evangelism gave an eye-opening realization that Christians are still far from reaching every people group beyond diverse cultural gaps. “E3” indicates the Evangelism that requires cultural crossing to a radically different people group.",
      "Following his legacy, AM endeavors to create numerous evangelism tools to reach all nations, peoples, and languages to embrace every individual regardless of their geographical and cultural gaps.",
    ],
  },
  {
    title: "Education",
    image: "/images/pillars-education.webp",
    paragraphs: [
      "Hosea 4:6 says, “…my people perish because of a lack of knowledge.” Paul says again in Romans 10:2 that the Israelites have a zeal for God, but not based on knowledge.",
      "In a world full of knowledge, AM International wishes to reaffirm the authority of the Word and uphold it as the center of our lives. The true knowledge is that which comes from God’s Word by knowing Him and living according to that.",
      "Thus, AM has created Bible study materials divided in 5 phases, resources, and activities all with the focus of understanding the truth of the Bible and making Jesus Christ known. Our Online Bible School, AM Academy (amacademy.org), provides a variety of educational tracks to support AM education.",
    ],
  },
  {
    title: "Discipleship",
    image: "/images/pillars-discipleship.webp",
    paragraphs: [
      "Being a disciple may feel difficult at times. A true disciple is the one who follows the life of Jesus — the life of the cross. For this, apart from spreading the love of Christ to others actively and guiding the youth with Biblical truth, our ministry walks alongside students to help them live a godly life for Christ in this era. As disciples of Jesus we wish to impact the world and influence people through the power of the gospel.",
      "“Cheap grace is the preaching of forgiveness without requiring repentance, baptism without church discipline, Communion without confession, absolution without personal confession. Cheap grace is grace without discipleship, grace without the cross, grace without Jesus Christ, living and incarnate,” wrote Dietrich Bonhoeffer in his famous book, “The Cost of Discipleship”.",
      "AM’s central vision is to raise and make true disciples who experience the power of the Cross and Resurrection. We continue to formulate various programs that aim to equip and raise young disciples of Jesus that will bring a powerful transformation of the world.",
    ],
  },
  {
    title: "Mission",
    image: "/images/pillars-mission.webp",
    // Tightened in the design — the same three beats, but half the clauses.
    paragraphs: [
      "Thriving campus mission powerfully advances our world mission. AM is dedicated to spreading the Gospel and fulfilling the Great Commission by going into all nations.",
      "Through AM, young people have opportunities to participate in local mission while in school and pursue long-term mission after graduation. Our Bible studies, leadership training, online education, internships, and short-term mission trips equip young people to use their gifts in God’s mission.",
      "As we strengthen our campus mission, AM continues to build channels that expand our world mission and reach the unreached. Join us in reaching the unreached!",
    ],
  },
];

export default async function PillarsOfMissionPage() {
  const [tPractice, tHeader] = await Promise.all([
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
      <PillarsHero title={tHeader("whatWeDo")} />

      <section className="relative overflow-hidden bg-night-deep py-20">
        {/* The same blue wash the hero above carries, and the same four stops
            from the design's inspect panel: clear for the top three quarters,
            then #598CD1 rising to 0.85 at the foot. It is what lifts this band
            out of flat navy and carries it into the white section beneath. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(89, 140, 209, 0), rgba(89, 140, 209, 0) 75%, rgba(89, 140, 209, 0.5) 90%, rgba(89, 140, 209, 0.85))",
          }}
        />
        <Container className="relative">
          {/* The same ghost treatment as the page title above it: Archivo
              Black, sentence case, outlined in the brand blue. The design
              sets it at 96px, but it draws this page on a 1450px content
              column against the 1120px every other page here uses — at 96px
              the line breaks in two, and the whole point of it is the one
              unbroken sweep, so it is sized to hold that instead. */}
          <h2 className="text-center font-display text-[32px] font-black leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_var(--color-brand-blue)] sm:text-[52px] lg:text-[68px]">
            One Movement, Every Nation
          </h2>

          {/* The photograph is a 3:2 landscape frame with its caption sitting
              under it, not a bare 4:3 tile, and the halves are even. */}
          <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <figure className="m-0">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                <Image
                  src="/images/pillars-intro-1.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <figcaption className="mt-4 text-sm text-white">
                The Gospel The Power of God unto Salvation.
              </figcaption>
            </figure>

            <div>
              <Eyebrow tone="light">Who we are</Eyebrow>
              {/* One heading, both lines at Archivo Bold 32px — the design
                  does not step the label down from the mission under it. */}
              <h3 className="font-display text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-[#f3f4f6] sm:text-[32px]">
                Our Mission
                <br />
                Preach the gospel, make disciples, equip leaders, and send them out.
              </h3>

              <div className="mt-12 grid gap-10 sm:grid-cols-2">
                <p className="text-base leading-[1.6] text-white">
                  Apostolos Missions International (AM) is an interdenominational ministry
                  committed to spreading the gospel to the ends of the earth, testifying to the
                  eternal love of the Lord.
                  <br />
                  <br />
                  The name <em className="italic">apostolos</em> (ἀπόστολος) is the Greek word
                  for apostle. It means &ldquo;one who is sent on a mission&rdquo; or
                  &ldquo;messenger.&rdquo; The title &ldquo;apostle&rdquo; often comes out in the
                  New Testament to represent the Twelve disciples appointed by Jesus. Paul, a
                  former persecutor of Christianity turning to a great herald of the gospel,
                  introduced himself as an &ldquo;apostle.&rdquo;
                </p>
                <p className="text-base leading-[1.6] text-white">
                  Apostles are those who are sent by the Lord Jesus to fulfill the mission of
                  &ldquo;preaching Jesus Christ and making God known&rdquo; to the whole
                  creation. Biblical foundation of apostleship is found in many words of the Lord
                  who selected first apostles and sent them out like the ambassadors dispatched
                  to represent different nations. Apostles understood that their lives were not
                  just their own, but they lived to reveal the glory of Christ in this fallen
                  world.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* All four run on white in the design — the alternating mist band this
          page used to stripe them with is not in it. The columns are an even
          split rather than a narrow image beside a wide text block: the
          photograph is a 386px square held to the left of its half, and the
          prose starts a shade past the midpoint. */}
      {pillars.map((pillar) => (
        <section
          key={pillar.title}
          id={pillar.title.toLowerCase()}
          className="scroll-mt-24 bg-white py-20"
        >
          <Container>
            <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="relative aspect-square w-full max-w-[386px] overflow-hidden rounded-lg">
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 386px, 100vw"
                />
              </div>
              <div>
                {/* Archivo SemiBold 34/40 in the design, and the prose under it
                    is near-black at 17/24 rather than the muted grey this page
                    was setting it in. */}
                <h2 className="font-display text-[34px] font-semibold leading-10 tracking-[-0.02em] text-ink">
                  {pillar.title}
                </h2>
                <div className="mt-6 space-y-6 text-[17px] leading-6 text-ink">
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

          <div className="mt-14 grid gap-8 text-start sm:grid-cols-2 lg:grid-cols-4">
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
