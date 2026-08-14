import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Statement of Faith | AM International",
  description:
    "The convictions AM holds in common across every campus, chapter and country.",
};

export default function StatementOfFaithPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Statement of faith" },
        ]}
        title="Statement of Faith"
        subtitle="The convictions AM holds in common across every campus, chapter and country."
      />
      <AboutSubNav active="/about/statement-of-faith" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            What We Believe
          </h2>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-ink">
            <p>
              We believe that the Bible, consisting of Old and New Testaments
              only, is verbally inspired by the Holy Spirit, is inerrant in
              the original manuscripts, and is the infallible and
              authoritative words from the Lord. We believe that there is one
              God, eternally existent in three Persons: Father, Son, and Holy
              Spirit. We believe that Adam, created in the image of God, was
              tempted by Satan, the devil, and fell. Because of Adam&rsquo;s
              sin, all men have guilt imputed.
            </p>
            <p>
              We believe in the deity of our Lord Jesus Christ, in His virgin
              birth, in His sinless life, in His miracles, in His vicarious
              and atoning death through His shed blood, in His bodily
              resurrection, in His ascension to the right hand of the Father,
              and in His personal return in power and glory.
            </p>
            <p>
              We believe that for the salvation of lost and sinful man,
              regeneration by the Holy Spirit is absolutely essential. We
              believe that salvation consists in the remission of sins, the
              imputation of Christ&rsquo;s righteousness, and the gift of
              eternal life received by faith alone, apart from works.
            </p>
            <p>
              We believe in the present ministry of the Holy Spirit by whose
              indwelling the Christian is enabled to live a godly life. We
              believe that the Church, the body of Christ, consists only of
              those who are born again, who are baptized by the Holy Spirit
              into Christ at the time of regeneration, for whom He now makes
              intercession in heaven and for whom He will come again. We
              believe in the spiritual unity of believers in our Lord Jesus
              Christ.
            </p>
            <p>
              We believe that Christ instructed the Church to go into the
              entire world and preach the Gospel to every person, baptizing
              and teaching those who believe. We believe that the return of
              Jesus Christ is imminent, and that it will be visible and
              personal.
            </p>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
