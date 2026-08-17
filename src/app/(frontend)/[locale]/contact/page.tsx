import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Link } from "@/i18n/navigation";
import AboutHero from "@/components/about/AboutHero";
import ContactForm from "@/components/contact/ContactForm";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Contact Us | AM International",
  description: "Get in touch with Apostolos Missions International.",
};

export default async function ContactPage() {
  const t = await getTranslations("Common");

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
        title="Contact Us"
        subtitle={t("tagline")}
        backgroundImage="/images/contact-hero.jpg"
      />

      <section className="bg-mist py-20">
        <Container className="max-w-[720px] text-center">
          <div className="flex justify-center">
            <Eyebrow>We&rsquo;d love to hear from you</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Contact us
          </h1>

          <div className="mt-8 space-y-1 text-base font-semibold text-ink">
            <p>AM International Headquarters</p>
            <p>716 Bellevue Ave., Trenton, NJ 08618</p>
            <p>
              <Link href="mailto:mission@amintl.org" className="underline underline-offset-2">
                mission@amintl.org
              </Link>
            </p>
            <p>+1 (917) 569-9073</p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container className="mx-auto max-w-[600px]">
          <ContactForm />
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
