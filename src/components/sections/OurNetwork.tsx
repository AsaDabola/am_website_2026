import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import CampusSearch from "@/components/sections/CampusSearch";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";

type Campus = { name: string; location: string };

// PLACEHOLDER campus list — shown until real chapters are added in /admin.
const defaultCampuses: Campus[] = [
  { name: "AM Harvard", location: "Cambridge, Massachusetts" },
  { name: "AM @ UCLA", location: "Los Angeles, California" },
  { name: "AM Rutgers", location: "New Brunswick, New Jersey" },
  { name: "AM Columbia", location: "New York, New York" },
  { name: "AM NYU", location: "New York, New York" },
  { name: "AM Princeton", location: "Princeton, New Jersey" },
  { name: "AM Berkeley", location: "Berkeley, California" },
  { name: "AM Michigan", location: "Ann Arbor, Michigan" },
  { name: "AM Illinois", location: "Champaign, Illinois" },
  { name: "AM Texas", location: "Austin, Texas" },
  { name: "AM Georgia Tech", location: "Atlanta, Georgia" },
  { name: "AM Washington", location: "Seattle, Washington" },
];

async function getCampuses(): Promise<Campus[]> {
  const docs = await fetchCollectionSafely(async (payload) => {
    const result = await payload.find({
      collection: "campuses",
      where: { active: { equals: true } },
      sort: "name",
      limit: 200,
    });
    return result.docs;
  });

  if (!docs) return defaultCampuses;
  return docs.map((doc) => ({ name: doc.name, location: doc.location }));
}

export default async function OurNetwork() {
  const campuses = await getCampuses();

  return (
    <section
      className="py-24"
      style={{ backgroundImage: "linear-gradient(120deg, #1449c6, #007aff)" }}
    >
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="lg:pt-2">
          <Eyebrow tone="light">Our network</Eyebrow>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            There may already be a fellowship on your campus.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75">
            Search by school or city. If nothing comes up near you, that is
            an invitation &mdash; we will help you start one.
          </p>
          <Button href="/get-involved/chapter-affiliation" variant="outlineLight" className="mt-9">
            Start a chapter
          </Button>
        </div>

        <CampusSearch campuses={campuses} />
      </Container>
    </section>
  );
}
