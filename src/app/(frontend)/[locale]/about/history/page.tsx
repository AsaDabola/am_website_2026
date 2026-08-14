import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "History | AM International",
  description:
    "From a small group of students in Los Angeles to a worldwide sending community.",
};

export default function HistoryPage() {
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
      />
      <AboutSubNav active="/about/history" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            Our Story
          </h2>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-ink">
            <p>
              Preach the gospel, make disciples, equip leaders, and send them
              out. ACM developed with the focus of reaching out to university
              students who are thirsty for the Word of God and desiring to
              continue God&rsquo;s mission. The early pioneers of ACM
              believed strongly that today&rsquo;s universities shape
              tomorrow&rsquo;s leaders, and their dream was to transform the
              world by helping to guide students on their spiritual journey
              to pursue goals that more closely resemble the Kingdom of God.
            </p>
            <p>
              ACM officially became Apostolos Missions International (AMI)
              in December 2003. Missiologist Dr. Ralph Winter served as the
              first honorary chairman of AMI. Winter and the staff of the
              U.S. Center for World Missions graciously advised the AMI
              student board on how to develop mission around the world.
              Winter was known for his creative approach to missions and his
              strategies to overcome cultural and societal barriers to
              delivering the Gospel of Jesus Christ. AMI sought to continue
              that legacy to reach the unreached youth of today.
            </p>
            <p>
              AMI moved its headquarters from the West Coast to Dover, New
              York in 2015. The scope of mission expanded to include not
              only students, but also young adults in urban societies and
              developing countries. In 2020, AMI relocated its headquarters
              office to Trenton, New Jersey. The headquarter center serves
              as a hub of resources and training grounds for young
              missionaries to evangelize, teach the Bible, and develop
              mission strategies more effectively in their city.
            </p>
            <p>
              AMI&rsquo;s tradition of Word, fellowship, and service has
              spread to numerous U.S. schools over the years including
              Harvard University, Columbia University, UC Berkeley, UCLA,
              Wesleyan University, Northwestern University, and more. The
              network has developed in various countries around the world
              including Canada, Cambodia, South Korea, India, Laos, Kenya,
              Vietnam, Japan, Uganda, Zimbabwe, Rwanda, Tanzania, Egypt, and
              more. Apostolos Missions International is presently a member
              of World Olivet Assembly and the World Evangelical Alliance.
            </p>
          </div>

          <div className="mt-10">
            <PullQuote>
              We are currently preparing the AM History Gallery. If you are
              an AM alumnus or have participated in AM during your college
              years, you are welcome to send us photos you wish to include
              in our history gallery. Please email photos@amintl.org.
            </PullQuote>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
