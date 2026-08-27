import type { Metadata } from "next";
import { getTranslations } from "@/i18n/content";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import AboutHero from "@/components/about/AboutHero";
import GetInvolvedSubNav from "@/components/get-involved/GetInvolvedSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";

export const metadata: Metadata = {
  title: "Alumni Connect | AM International",
  description: "Stay connected with AM after graduation and keep serving the mission.",
};

export default async function AlumniConnectPage() {
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
          { label: "Alumni Connect" },
        ]}
        title={tHeader("getInvolved")}
        subtitle={t("tagline")}
        backgroundImage="/images/alumni-hero.webp"
      />
      <GetInvolvedSubNav active="/get-involved/alumni-connect" />

      <section className="bg-mist py-20">
        <Container className="max-w-[900px] text-center">
          <div className="flex justify-center">
            <Eyebrow>Get involved</Eyebrow>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Alumni Connect
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["/images/alumni-1.webp", "/images/alumni-2.webp", "/images/alumni-3.webp"].map(
              (src) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-xl shadow-[0px_10px_30px_0px_rgba(27,29,52,0.1)]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                </div>
              ),
            )}
          </div>

          <p className="mx-auto mt-10 max-w-[733px] text-base leading-relaxed text-ink-muted">
            AM is blessed with numerous alumni members who continued to support our mission
            after graduation. If you want to continue to help, support and serve AM, join our
            Alumni Connect to stay connected. No matter where you are or what career you have,
            our Lord Jesus calls you to keep working together to advance the Gospel mission.
            Find the most fitting role in your work schedule and family life to help AM mission
            thrive all across the world.
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
