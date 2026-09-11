import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import CampusTourMap from "@/components/tour/CampusTourMap";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import PageBody from "@/components/pages/PageBody";

// Sixty seconds, so a section added to this page in /admin appears without a
// deploy — the same arrangement every other converted page uses.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Campus Tour | AM International",
  description:
    "Take a virtual tour of the Apostolos Missions International campus in Trenton, New Jersey — the chapel, general office, Immanuel Theological Seminary building and student dormitory.",
};

/**
 * All five images are in public/images/tour/, so the page runs on the real
 * artwork. Dropping this back to false returns every frame to the site's
 * gradient placeholder, which is how the page shipped before the images
 * arrived — worth keeping for whoever swaps the campus rendering next.
 *
 * The dialog galleries are the one thing still drawn as placeholders: those
 * are three interior views per building, and only the exteriors exist.
 */
const HAS_CAMPUS_PHOTOS = true;

export default function CampusTourPage() {
  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Campus Tour" }]}
        title="Campus Tour"
        subtitle="A walk around the AM campus in Trenton, New Jersey — select a marker, or a building below, to see photos and learn what happens inside."
      />

      <PageBody route="/tour">
        <CampusTourMap hasPhotos={HAS_CAMPUS_PHOTOS} />
      </PageBody>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
