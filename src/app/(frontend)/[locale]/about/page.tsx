import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
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
        title="As the Father sent me, I send you."
        subtitle="An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord."
      />
      <AboutSubNav active="/about" />

      <section className="bg-white pt-16">
        <Container>
          <WhatWeDoInPractice />
        </Container>
      </section>

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
              <Link
                href="/about/statement-of-faith"
                className="text-brand-navy underline underline-offset-2"
              >
                Read our statement of faith
              </Link>{" "}
              or{" "}
              <Link
                href="/about/history"
                className="text-brand-navy underline underline-offset-2"
              >
                trace the history
              </Link>
              .
            </p>
          </div>
        </Container>
      </article>

      <section className="bg-white pb-24">
        <Container className="max-w-[720px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/about/statement-of-faith"
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/bible-study-faith.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-lg font-bold text-white">
                Read our statement of Faith
              </span>
              <Button
                href="/about/statement-of-faith"
                variant="solid"
                className="pointer-events-none absolute bottom-6 left-6 !px-5 !py-2.5 !text-xs"
              >
                Learn more
              </Button>
            </Link>
            <Link
              href="/about/mission"
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/network-hero.jpg"
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-lg font-bold text-white">
                Mission Statement
              </span>
              <Button
                href="/about/mission"
                variant="solid"
                className="pointer-events-none absolute bottom-6 left-6 !px-5 !py-2.5 !text-xs"
              >
                Learn more
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
