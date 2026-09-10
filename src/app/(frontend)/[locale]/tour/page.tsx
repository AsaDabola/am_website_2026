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
 * The aerial itself ships with the site, so the map is live. Set this to true
 * once the four building photographs are in public/images/tour/:
 *
 *   dormitory.jpg  seminary.jpg  office.jpg  chapel.jpg
 *
 * Until then the four cards and the dialog galleries render as the site's
 * gradient placeholder, so the page is complete and navigable rather than a
 * grid of broken images.
 */
const HAS_CAMPUS_PHOTOS = false;

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
