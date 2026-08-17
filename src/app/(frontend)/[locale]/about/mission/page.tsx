import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Mission Statement | AM International",
  description:
    "A worldwide community of believers dedicated to the spreading of the Gospel across university campuses.",
};

export default function MissionStatementPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Mission statement" },
        ]}
        title="Mission statement"
        subtitle="A worldwide community of believers dedicated to the spreading of the Gospel across university campuses."
        backgroundImage="/images/mission-hero.jpg"
      />
      <AboutSubNav active="/about/mission" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px] space-y-20">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
              Our Mission
            </h2>
            <p className="mt-3 text-xl leading-relaxed text-ink-muted">
              Preach the gospel, make disciples, equip leaders, and send them
              out.
            </p>

            <div className="mt-8 space-y-6 text-base leading-relaxed text-ink">
              <p>
                Apostolos Missions International (AM) is an
                interdenominational ministry committed to spreading the
                gospel to the ends of the earth, testifying to the eternal
                love of the Lord.
              </p>
              <p>
                The name <em className="italic">apostolos</em> (ἀπόστολος) is
                the Greek word for apostle. It means &ldquo;one who is sent
                on a mission&rdquo; or &ldquo;messenger.&rdquo; The title
                &ldquo;apostle&rdquo; often comes out in the New Testament to
                represent the Twelve disciples appointed by Jesus (Matthew
                10:2, Mark 3:14, Luke 6:13, Acts 2:42). Paul, a former
                persecutor of Christianity turning to a great herald of the
                gospel, introduced himself as an &ldquo;apostle&rdquo;
                (Romans 1:1, 1 Corinthians 1:1, 2 Corinthians 1:1, Galatians
                1:1, Colossians 1:1, 1 Timothy 1:1, 2 Timothy 1:1, Titus).
              </p>
              <p>
                Apostles are those who are sent by the Lord Jesus to fulfill
                the mission of &ldquo;preaching Jesus Christ and making God
                known&rdquo; to the whole creation. Biblical foundation of
                apostleship is found in many words of the Lord who selected
                first apostles and sent them out like the ambassadors
                dispatched to represent different nations. Apostles
                understood that their lives were not just their own, but
                they lived to reveal the glory of Christ in this fallen
                world.
              </p>
            </div>

            <div className="mt-8">
              <PullQuote>
                John 20:21 says, &ldquo;Again Jesus said, &lsquo;Peace be
                with you! As the Father has sent me, I am sending
                you.&rsquo;&rdquo; (NIV)
              </PullQuote>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
              Our Vision
            </h2>
            <p className="mt-3 text-xl leading-relaxed text-ink-muted">
              Revitalize Thriving Campus Ministries! Preach Jesus All Over
              the World!
            </p>

            <div className="mt-8 space-y-6 text-base leading-relaxed text-ink">
              <p>
                AM wishes to follow the tradition of the apostles who lived
                as people on a mission to proclaim the Word of God. Each of
                us also receive this calling from God to be sent out into
                the world as his hands and feet. We wish to dedicate our
                lives to follow the footsteps of Jesus and proclaim the
                Gospel until the ends of the earth.
              </p>
              <p>
                Just as our lives have been touched and changed by the Lord,
                we wish to reveal the love of the Lord that was shown to us,
                becoming a beacon for all of His lost children and our
                fellow brothers and sisters.
              </p>
            </div>

            <div className="mt-8">
              <PullQuote>
                &ldquo;For I resolved to know nothing while I was with you
                except Jesus Christ and him crucified.&rdquo;
                <br />- 1 Corinthians 2:2
              </PullQuote>
            </div>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
