import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
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
  const tHeader = await getTranslations("Header");

  return (
    <>
      {/* Section tabs sit above the hero, matching the other pages. */}
      <GetInvolvedSubNav active="/get-involved/chapter-affiliation" />
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: tHeader("getInvolved"), href: "/get-involved" },
          { label: "Chapter Affiliation" },
        ]}
        title="Chapter Affiliation"
        backgroundImage="/images/chapter-affiliation-hero.webp"
        size="large"
        titleVariant="ghost"
        align="center"
      />

      <section className="bg-white py-20">
        <Container className="max-w-[1100px]">
          <p className="text-base leading-relaxed text-ink-muted">
            Qualifications for membership includes being over the age of 18 and regularly
            attending Bible programs for at least one month at your local AM chapter. Membership
            is open primarily to current students of the university, but also to university
            alumni, faculty, and staff. Becoming a member indicates that you share and agree with
            the AM Statement of Faith and Mission Statement. A member is also one who wishes to
            uphold the values of the Christian faith in their lives and support the work of
            God&rsquo;s Kingdom here on earth. Current students must be registered to their
            university chapter by filling out the application and having it signed by their
            chapter leader. AM members benefit from full access to the AM resources and
            facilities. They can also join AM leadership meetings, conventions, and retreats.
            Members of AM are recommended to give a monthly offering to their chapters. The
            amount of the offering is of their choice. 100% of the donations go towards
            supporting the local chapter&rsquo;s operations and activities.
          </p>

          <div className="mt-10 flex gap-3 rounded-lg border-s-4 border-[#f0a90a] bg-[#fdf6e7] px-5 py-4">
            <span
              aria-hidden
              className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#f0a90a] text-[10px] font-bold text-white"
            >
              !
            </span>
            <p className="text-sm leading-relaxed text-ink">
              Existing chapters must reaffirm their affiliation{" "}
              <strong className="font-semibold">annually by September 1</strong>. Chapters that
              miss the deadline may have their membership revoked. New chapters may apply anytime
              between <strong className="font-semibold">June and December</strong> of the current
              calendar year.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-mist py-20">
        <Container className="max-w-[1240px]">
          <ChapterAffiliationForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
