import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import AboutSubNav from "@/components/about/AboutSubNav";
import HonoraryChairman from "@/components/sections/HonoraryChairman";
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
      {/* The design leads this page with the same dark legacy band the home
          page uses, rather than a photo hero. The section tabs sit above it,
          matching the other About pages. */}
      <AboutSubNav active="/about/chairman" />
      <HonoraryChairman headingLevel="h1" />

      <article className="bg-white py-24">
        {/* 640px of text beside a 420px photograph with a 44px gutter, in a
            1104px column — the design's own measurements. Body at 21px on
            33.6px, which is what makes it read as an essay rather than as
            page furniture; it is the only long-form prose in the About
            section. */}
        <Container className="max-w-[1104px]">
          <h2 className="font-display text-[28px] font-semibold leading-[30.8px] tracking-[-0.028em] text-ink">
            Our First Chairman
          </h2>

          {/*
            Two rows rather than one, because the design pairs each
            photograph with a particular part of the argument: the portrait
            beside the opening, the second picture beside the closing. Laid
            out absolutely — as the design exports it — those pairings hold
            only for the English text; in rows they hold in all 48 locales
            however long the paragraphs run.
          */}
          <div className="mt-[38px] grid gap-10 lg:grid-cols-[640px_420px] lg:gap-[44px]">
            <div className="space-y-[26px] text-[21px] leading-[33.6px] text-ink-muted">
              <p>
                Apostolos Mission International is proudly continuing the legacy of world
                evangelization as established by American missiologist, Ralph D. Winter. Ralph
                D. Winter was an accomplished missiologist and missionary who opened a new
                paradigm regarding the role of churches, mission structures, and outreach among
                unreached people groups. His strategies and approach to mission were a
                watershed transition that opened the door for the world to know the Gospel.
              </p>
              <p>
                Dr. Winter aimed to overcome cultural and linguistic hurdles in world mission so
                that all people could hear the truth. Dr. Winter was recognized by many because
                of his influence in world mission strategies. He was even acknowledged by Time
                magazine in 2005 as being one of the 25 Most Influential Evangelicals in
                America.
              </p>
            </div>

            <div className="relative aspect-[420/302] overflow-hidden rounded-[12px]">
              <Image
                src="/images/chairman-photo-1.webp"
                alt="Dr. Ralph D. Winter teaching at Seoul '73"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 420px, 100vw"
              />
            </div>
          </div>

          <div className="mt-[26px] grid gap-10 lg:grid-cols-[640px_420px] lg:gap-[44px]">
            <div className="space-y-[26px] text-[21px] leading-[33.6px] text-ink-muted">
              <p>
                Overall, Dr. Winter was a man who was praised for his creative approach in
                mission according to the world they were in. He was a revolutionary thinker who
                continually worked hard to foresee the best strategy that best fit the scene.
              </p>
              <p>
                AM International was blessed to have Dr. Winter serve as the organization&rsquo;s
                first chairman and received his blessing to embody the same heart, creativity,
                and passion for world missions. As the ones who are &ldquo;sent,&rdquo; AM
                desires to fuel the heart of the youth with a drive for sharing the Word. Their
                dream is to give hope to those who are weary and burdened. May AM deliver the
                Gospel, sharing the freedom that only the truth can bring.
              </p>
            </div>

            <div className="relative aspect-[420/250] overflow-hidden rounded-[12px]">
              <Image
                src="/images/chairman-photo-2.webp"
                alt="AM chapter graduates in Guatemala"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 420px, 100vw"
              />
            </div>
          </div>
        </Container>
      </article>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
