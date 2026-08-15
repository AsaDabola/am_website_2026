import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import AboutHero from "@/components/about/AboutHero";
import WhatWeDoSubNav from "@/components/what-we-do/WhatWeDoSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Our Pillars of Mission | AM International",
  description:
    "Thursday Bible Study — a weekly online gathering open to every student in every phase of the program.",
};

export default function PillarsOfMissionPage() {
  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "What We Do" },
          { label: "Our Pillars of Mission" },
        ]}
        title="What We Do"
        subtitle="An interdenominational ministry committed to spreading the gospel to the ends of the earth, testifying to the eternal love of the Lord."
      />
      <WhatWeDoSubNav active="/what-we-do/pillars-of-mission" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>What we do</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Thursday Bible Study
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { from: "#2a5eec", to: "#0d1f52" },
              { from: "#3a6cd8", to: "#0d1f52" },
              { from: "#4d8df6", to: "#0d1f52" },
            ].map((tone, index) => (
              <PlaceholderPhoto
                key={index}
                className="aspect-square rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
                from={tone.from}
                to={tone.to}
              />
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-[733px] text-base leading-relaxed text-ink-muted">
            We hold Online Weekly Bible Study via Zoom every Thursday at 7 PM Eastern Time.
            Thursday Bible Study covers a variety of biblical themes to help our students gain
            basic insights into the Bible. Themes include Genesis stories, Salvation, Gospel
            messages, Pastoral letters, and many other topics. The study is resourceful for truth
            seekers and empowering for those who walk the path of faith! Every student in all
            levels of Bible Studies and Faith journeys is invited!
          </p>
          <p className="mx-auto mt-4 max-w-[733px] text-base leading-relaxed text-ink-muted">
            Click the link below and join us every Thursday!
          </p>

          <Button href="/contact" variant="solid" className="mt-9">
            Click here
          </Button>
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
