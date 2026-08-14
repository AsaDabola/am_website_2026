import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Leadership | AM International",
  description:
    "The people who steer, teach and serve across AM's campuses and offices.",
};

export default function LeadershipPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Leadership" },
        ]}
        title="Leadership"
        subtitle="The people who steer, teach and serve across AM's campuses and offices."
      />
      <AboutSubNav active="/about/leadership" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            Our Leadership
          </h2>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-ink">
            <p>
              Our mission is possible through God-given servants who join
              our team from all across the world. We collaborate and work
              together in unity with chapter leaders, field missionaries,
              Bible teachers, and many local staff. We are pleased to
              introduce our representative leaders and staff who exert
              gracious leadership for our Gospel movement.
            </p>
            <p>
              Dr. Winter aimed to overcome cultural and linguistic hurdles
              in world mission so that all people could hear the truth. Dr.
              Winter was recognized by many because of his influence in
              world mission strategies. He was even acknowledged by Time
              magazine in 2005 as being one of the 25 Most Influential
              Evangelicals in America.
            </p>
            <p>
              Overall, Dr. Winter was a man who was praised for his creative
              approach to mission according to the world they were in. He
              was a revolutionary thinker who continually worked hard to
              foresee the best strategy that best fit the scene. AM
              International was blessed to have Dr. Winter serve as the
              organization&rsquo;s first chairman and received his blessing
              to embody the same heart, creativity, and passion for world
              missions.
            </p>
            <p>
              As the ones who are &ldquo;sent,&rdquo; AM desires to fuel the
              heart of the youth with a drive for sharing the Word. Their
              dream is to give hope to those who are weary and burdened.
              May AM deliver the Gospel, sharing the freedom that only the
              truth can bring.
            </p>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
