import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import AboutHero from "@/components/about/AboutHero";
import AboutSubNav from "@/components/about/AboutSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Ralph D. Winter | AM International",
  description:
    "AM's first honorary chairman, and the missiology the ministry still carries forward.",
};

export default function ChairmanPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Ralph D. Winter" },
        ]}
        title="Ralph D. Winter"
        subtitle="AM's first honorary chairman, and the missiology the ministry still carries forward."
      />
      <AboutSubNav active="/about/chairman" />

      <article className="bg-white py-20">
        <Container className="max-w-[720px]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            A Life of Mission
          </h2>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-ink">
            <p>
              Apostolos Missions International is proudly continuing the
              legacy of world evangelization as established by American
              missiologist Ralph D. Winter. Ralph D. Winter was an
              accomplished missiologist and missionary who opened a new
              paradigm regarding the role of churches, mission structures,
              and outreach among unreached people groups. His strategies and
              approach to mission were a watershed transition that opened
              the door for the world to know the Gospel.
            </p>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
