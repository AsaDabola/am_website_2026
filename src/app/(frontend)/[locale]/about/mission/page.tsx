import type { Metadata } from "next";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import withPageLayout from "@/components/pages/BuiltInPage";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy. Without it the page is fully static and the authored layout would be
// whatever it was at build time — see components/pages/BuiltInPage.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mission Statement | AM International",
  description:
    "The convictions AM holds in common across every campus, chapter and country.",
};

/**
 * Section heading — Archivo SemiBold 28px in the design, a step down from the
 * page title rather than the 3xl the page used before.
 */
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-[28px] font-semibold tracking-[-0.028em] text-ink">
      {children}
    </h2>
  );
}

/** The standfirst under each heading: Inter 21px, muted, 1.6 line height. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[21px] leading-[1.6] text-ink-muted">{children}</p>;
}

/**
 * The "Our Mission / Our Identity / Our Response" summary that closes each
 * section. A description list rather than paragraphs, because that is what it
 * is — a term and its definition — and the design sets the terms in bold with
 * no gap between the pairs.
 */
function SummaryList({ items }: { items: { term: string; detail: ReactNode }[] }) {
  return (
    <dl className="mt-6 text-base leading-[1.65] text-ink">
      {items.map(({ term, detail }) => (
        <div key={term}>
          <dt className="font-bold">{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

function MissionStatementPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Mission statement" },
        ]}
        title="Mission statement"
        subtitle="The convictions AM holds in common across every campus, chapter and country."
        backgroundImage="/images/mission-hero.webp"
      />
      <AboutSubNav active="/about/mission" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px] space-y-20">
          <section>
            <SectionHeading>Our Mission</SectionHeading>
            <Lead>
              Preach the gospel, make disciples, equip leaders, and send them out.
              <br />
              Called to Be Sent
            </Lead>

            <div className="mt-8 space-y-6 text-base leading-[1.65] text-ink">
              <p>
                The mission of Apostolos Missions begins with a simple but
                powerful truth: we are called to be sent.
              </p>
              <p>
                The name <em className="italic">Apostolos</em> (ἀπόστολος) is a
                Greek word meaning &ldquo;one who is sent&rdquo; or
                &ldquo;messenger.&rdquo; An apostle was someone sent with a
                specific purpose and mission, just as a representative is sent to
                carry out the will of the one who sends them.
              </p>
              <p>
                Jesus said, &ldquo;You did not choose me, but I chose you and
                appointed you&rdquo; (John 15:16). He also said, &ldquo;As you
                sent me into the world, I have sent them into the world&rdquo;
                (John 17:18).
              </p>
              <p>
                These words reveal the foundation of our mission. Following
                Christ is not only about receiving salvation; it is also about
                receiving His calling to go and make Him known. At AM, we believe
                that every believer is called to participate in God&rsquo;s
                mission. We seek to live according to the identity of{" "}
                <em className="italic">apostolos</em>&mdash;people who have been
                chosen, called, and sent by Christ.
              </p>
            </div>

            <div className="mt-8">
              <PullQuote>
                John 20:21 says, &ldquo;Again Jesus said, &lsquo;Peace be with
                you! As the Father has sent me, I am sending you.&rsquo;&rdquo;
                (NIV)
              </PullQuote>
            </div>

            <p className="mt-8 text-base leading-[1.65] text-ink">
              Our mission is to proclaim Jesus Christ and make God known to the
              ends of the earth through evangelism, discipleship, Bible study,
              prayer, fellowship, and ministry.
            </p>

            <SummaryList
              items={[
                {
                  term: "Our Mission",
                  detail:
                    "To proclaim Jesus Christ and make God known to the ends of the earth.",
                },
                {
                  term: "Our Identity",
                  detail: "Chosen by Christ. Called by Christ. Sent by Christ.",
                },
                {
                  term: "Our Response",
                  detail: "Go. Make disciples. Share the Gospel. Make God known.",
                },
              ]}
            />
          </section>

          <section>
            <SectionHeading>Our Vision</SectionHeading>
            <Lead>
              A Generation Sent by Christ
              <br />
              Preach Jesus All Over the World!
            </Lead>

            <p className="mt-8 text-base leading-[1.65] text-ink">
              At the heart of our vision is Jesus Christ Himself. Our message, our
              mission, and our ministry are not centered on ourselves, but on
              knowing Christ and making Him known.
            </p>

            <div className="mt-8">
              <PullQuote>
                &ldquo;For I resolved to know nothing while I was with you except
                Jesus Christ and him crucified.&rdquo;
                <br />- 1 Corinthians 2:2
              </PullQuote>
            </div>

            <div className="mt-8 space-y-6 text-base leading-[1.65] text-ink">
              <p>
                Apostolos Missions envisions a generation of students and young
                people who encounter Jesus Christ, grow in God&rsquo;s Word,
                discover their identity and calling in Him, and faithfully live as
                those who have been sent.
              </p>
              <p>
                We desire to see young people become deeply rooted in Christ
                through Bible study, prayer, fellowship, discipleship, and
                mission, growing not only as followers of Jesus but also as
                faithful messengers of the Gospel.
              </p>
              <p>
                Our vision is especially focused on reaching college campuses and
                the next generation. We desire to see students encounter Jesus,
                experience the truth of God&rsquo;s Word, discover their God-given
                identity and purpose, and become equipped to make Him known
                wherever He sends them.
              </p>
              <p>
                We believe the mission does not end when someone receives the
                Gospel. Those who have been sent by Christ are called to send
                others. Through this multiplication, Apostolos Mission hopes to
                see the Gospel carried from campuses to communities and from one
                generation to the next.
              </p>
            </div>

            <SummaryList
              items={[
                {
                  term: "Our Vision",
                  detail:
                    "To see a generation that knows Christ, lives in His truth, and is sent to make Him known.",
                },
                {
                  term: "Our Hope",
                  detail: (
                    <>
                      Students transformed by Christ.
                      <br />
                      Believers rooted in His Word.
                      <br />A generation sent with the Gospel.
                    </>
                  ),
                },
              ]}
            />
          </section>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}

// Lets this page be added to or replaced from /admin — see BuiltInPage.
export default withPageLayout("/about/mission", MissionStatementPage);
