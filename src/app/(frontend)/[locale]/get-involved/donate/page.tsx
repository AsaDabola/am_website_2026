import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import DonateForm from "@/components/get-involved/DonateForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Donate | AM International",
  description:
    "AM International is a non-profit organization supported by our loving staff, and by the contributions of the Christian community.",
};

export default async function DonatePage() {
  const t = await getTranslations("Common");

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Get Involved", href: "/get-involved" },
          { label: "Donate" },
        ]}
        title="Donate"
        subtitle={t("tagline")}
        backgroundImage="/images/donate-hero.webp"
      />
      <GetInvolvedSubNav active="/get-involved/donate" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>Get involved</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Donate
          </h1>

          <div className="relative mx-auto mt-10 aspect-[825/473] max-w-[825px] overflow-hidden rounded-2xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.12)]">
            <Image
              src="/images/donate-offering.webp"
              alt="Your offering helps us spread the Gospel!"
              fill
              className="object-cover"
              sizes="(min-width: 900px) 825px, 100vw"
            />
          </div>

          <p className="mx-auto mt-10 max-w-[779px] text-base leading-relaxed text-ink-muted">
            AM International is a non-profit organization supported by our loving staff, and by
            the contributions of the Christian community. With your ongoing support, we can
            continue to keep AM International going on strong, reaching out to the communities,
            the nation, and the world. Your donations, your participation, and your prayers
            allow us to be more effective in spreading the good news of Jesus Christ,
            establishing centers for students to gather and rejoice in Christ, setting up
            programs for those less fortunate, and strengthen the Christian leaders of tomorrow.
            By supporting AM International, you will not only be showing your support for one
            organization. But you will be showing your support for the expansion of
            God&rsquo;s Kingdom. Any support that you can offer is greatly appreciated.
          </p>

          <Button href="#donate-form" variant="solid" className="mt-9">
            Click here
          </Button>
        </Container>
      </section>

      <section id="donate-form" className="bg-white py-24">
        <Container className="mx-auto max-w-[868px]">
          <DonateForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
