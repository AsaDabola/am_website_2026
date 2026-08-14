import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PullQuote from "@/components/about/PullQuote";
import WhatWeDoInPractice from "@/components/about/WhatWeDoInPractice";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Who We Are | AM International",
  description:
    "Apostolos Missions International (AM) is an interdenominational ministry committed to spreading the gospel to the ends of the earth.",
};

export default function WhoWeArePage() {
  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title="Who we are"
        subtitle="An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord."
      />
      <AboutSubNav active="/about" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <div className="space-y-6 text-base leading-relaxed text-ink">
            <p>
              Apostolos Missions International (AM) is an interdenominational
              ministry committed to spreading the gospel to the ends of the
              earth, testifying to the eternal love of the Lord.
            </p>
            <p>
              The name <em className="italic">apostolos</em> (ἀπόστολος) is
              the Greek word for apostle. It means &ldquo;one who is sent on
              a mission&rdquo; or &ldquo;messenger.&rdquo; The title
              &ldquo;apostle&rdquo; often comes out in the New Testament to
              represent the Twelve disciples appointed by Jesus (Matthew
              10:2, Mark 3:14, Luke 6:13, Acts 2:42). Paul, a former
              persecutor of Christianity turning to a great herald of the
              gospel, introduced himself as an &ldquo;apostle&rdquo; (Romans
              1:1, 1 Corinthians 1:1, 2 Corinthians 1:1, Galatians 1:1,
              Colossians 1:1, 1 Timothy 1:1, 2 Timothy 1:1, Titus).
            </p>
            <p>
              Apostles are those who are sent by the Lord to fulfill the
              mission of &ldquo;preaching Jesus Christ and making God
              known&rdquo; to the whole creation. Biblical foundation of
              apostleship is found in many words of the Lord who selected
              first apostles and sent them out like the ambassadors
              dispatched to represent different nations. Apostles understood
              that their lives were not just their own, but they lived to
              reveal the glory of Christ in this fallen world.
            </p>
          </div>

          <div className="my-10">
            <PullQuote>
              John 20:21 says, &ldquo;Again Jesus said, &lsquo;Peace be with
              you! As the Father has sent me, I am sending you.&rsquo;&rdquo;
              (NIV)
            </PullQuote>
          </div>

          <div className="space-y-6 text-base leading-relaxed text-ink">
            <p>
              AM wishes to follow the tradition of the apostles who lived as
              people on a mission to proclaim the Word of God. Each of us
              also receive this calling from God to be sent out into the
              world as His hands and feet. We wish to dedicate our lives to
              follow the footsteps of Jesus and proclaim the Gospel until the
              ends of the earth.
            </p>
            <p>
              Just as our lives have been touched and changed by the Lord, we
              wish to reveal the love of the Lord that was shown to us,
              becoming a beacon for all of His lost children and our fellow
              brothers and sisters.
            </p>
            <p>
              <a
                href="/about/statement-of-faith"
                className="text-brand-navy underline underline-offset-2"
              >
                Read our statement of faith
              </a>{" "}
              or{" "}
              <a
                href="/about/history"
                className="text-brand-navy underline underline-offset-2"
              >
                trace the history
              </a>
              .
            </p>
          </div>
        </Container>
      </article>

      <WhatWeDoInPractice />
      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
