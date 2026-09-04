import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import HistoryTimeline from "@/components/about/HistoryTimeline";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "History | AM International",
  description:
    "From a small group of students in Los Angeles to a worldwide sending community.",
};

const sections = [
  {
    heading: "The vision behind the movement",
    paragraph:
      "Apostolos Campus Ministries (ACM) developed with the focus of reaching out to university students who are thirsty for the Word of God and desiring to continue God's mission. The early pioneers believed strongly that today's universities shape tomorrow's leaders, and their dream was to transform the world by helping to guide students on their spiritual journey to pursue goals that closely resemble the Kingdom of God. What started as a grassroots campus effort quickly grew into a deep discipleship movement committed to reaching nations.",
  },
  {
    heading: "A new name, a key mentor",
    paragraph:
      "ACM officially became Apostolos Missions International (AMI) in December 2003. Missiologist Dr. Ralph Winter served as the first honorary chairman of AMI. Dr. Winter and the staff of the U.S. Center for World Missions graciously advised the AMI student board on how to develop mission around the world. Winter was known for his creative approach to missions and his strategies to overcome cultural and societal barriers to delivering the Gospel of Jesus Christ. AMI sought to continue that legacy to reach the unreached youth of today.",
  },
  {
    heading: "Growing beyond campus",
    paragraph:
      "AMI's tradition of Word, fellowship, and service spread to numerous prestigious U.S. schools over the years, including Harvard University, Columbia University, UC Berkeley, UCLA, Wesleyan University, Northwestern University, and many more. As students graduated and went out as missionaries, the network developed globally, establishing ministries in Canada, Cambodia, South Korea, India, Laos, Kenya, Vietnam, Japan, Uganda, Zimbabwe, Rwanda, Tanzania, Egypt, and beyond.",
  },
  {
    heading: "Setting up a home base",
    paragraph:
      "To support this rapidly expanding global network, AMI moved its headquarters from the West Coast to Dover, New York in 2015. This allowed the scope of the mission to expand, including not only university students but also young adults in urban societies and developing countries. In 2020, AMI relocated its headquarters office to Trenton, New Jersey, serving as a vital resource hub and training ground for young missionaries to evangelize, teach the Bible, and develop localized mission strategies.",
  },
  {
    heading: "Where AMI stands today",
    paragraph:
      "Today, Apostolos Missions International is a vibrant worldwide sending community. It continues to expand its reach, steadfast in its commitment to the great commission. AMI is presently an active member of both the World Olivet Assembly and the World Evangelical Alliance, collaborating globally to testify to the eternal love of Jesus Christ.",
  },
];

const timeline = [
  {
    tag: "Founding",
    title: "Apostolos Campus Ministries begins",
    description:
      "ACM starts as a grassroots campus effort reaching university students, dedicated to guiding them on their spiritual journey toward the Kingdom of God.",
  },
  {
    tag: "Early years",
    title: "Guided by Dr. Ralph Winter",
    description:
      "Renowned missiologist Dr. Ralph Winter of the U.S. Center for World Missions serves as the first honorary chairman, advising on global mission strategy.",
  },
  {
    tag: "December 2003",
    title: "ACM becomes AMI",
    description:
      "Apostolos Campus Ministries is officially renamed to Apostolos Missions International to reflect its expanding global calling and vision.",
  },
  {
    tag: "Expansion",
    title: "Campus and global growth",
    description:
      "AMI spreads to top U.S. campuses including Harvard, Columbia, Berkeley, and UCLA, while establishing networks across 14+ nations globally.",
  },
  {
    tag: "2015",
    title: "Headquarters moves to Dover, NY",
    description:
      "AMI relocates its main office to Dover, NY, broadening its focus to serve young adults in urban societies and developing countries.",
  },
  {
    tag: "2020",
    title: "Headquarters moves to Trenton, NJ",
    description:
      "AMI moves its hub to Trenton, NJ, establishing a centralized resource center and training ground for active field missionaries.",
  },
  {
    tag: "Today",
    title: "A global network",
    description:
      "AMI operates as a worldwide sending community and is an active member of both the World Olivet Assembly and the World Evangelical Alliance.",
  },
];

function HistoryPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "History" },
        ]}
        title="Our History"
        subtitle="From a small group of students in Los Angeles to a worldwide sending community."
        backgroundImage="/images/history-hero.webp"
      />
      <AboutSubNav active="/about/history" />

      <article className="bg-white py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>History</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            A Brief History of Apostolos Missions International
          </h1>
          <p className="mx-auto mt-4 max-w-[600px] text-base leading-relaxed text-ink-muted">
            From a grassroots campus effort to a global mission organization.
          </p>
        </Container>

        <Container className="mt-16 max-w-[720px]">
          <div className="space-y-14">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
                  {section.heading}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-muted">
                  {section.paragraph}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </article>

      <section className="bg-mist py-24">
        <Container className="max-w-[720px]">
          <div className="text-center">
            <div className="flex justify-center">
              <Eyebrow>Timeline</Eyebrow>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Our History at a Glance
            </h2>
          </div>

          <div className="mt-16">
            <HistoryTimeline milestones={timeline} />
          </div>
        </Container>
      </section>

      <section className="bg-white py-8">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
            Preach the gospel · Make disciples · Equip leaders · Send them out
          </p>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/about/history", HistoryPage);
