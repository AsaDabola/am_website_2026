import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import ChapterAffiliationForm from "@/components/get-involved/ChapterAffiliationForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Chapter Affiliation | AM International",
  description:
    "Apply for annual chapter reaffirmation or start a new AM chapter on your campus.",
};

export default async function ChapterAffiliationPage() {
  const [t, tHeader] = await Promise.all([
    getTranslations("Common"),
    getTranslations("Header"),
  ]);

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: tHeader("getInvolved"), href: "/get-involved" },
          { label: "Chapter Affiliation" },
        ]}
        title="Chapter Affiliation"
        subtitle={t("tagline")}
      />
      <GetInvolvedSubNav active="/get-involved/chapter-affiliation" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>Get involved</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Chapter Affiliation
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-base leading-relaxed text-ink-muted">
            Whether you&rsquo;re reaffirming an existing chapter or starting a new one, this
            application walks you through everything AM needs — chapter details, charter status,
            student leadership, and your current members.
          </p>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="max-w-[1100px]">
          <ChapterAffiliationForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
