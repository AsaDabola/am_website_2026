import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Membership | AM International",
  description: "What it means to belong to the AM network as a chapter or an individual.",
};

export default function MembershipPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Membership" },
        ]}
        title="Membership"
        subtitle="What it means to belong to the AM network as a chapter or an individual."
      />
      <AboutSubNav active="/about/membership" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            Becoming Part of AM
          </h2>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-ink">
            <p>
              We&rsquo;re putting together the full details on chapter and individual
              membership with AM. In the meantime, if you&rsquo;d like to know more about
              starting a chapter on your campus or joining an existing one, reach out to
              our team and we&rsquo;ll walk you through it.
            </p>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
