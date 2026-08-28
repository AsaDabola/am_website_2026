import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import CampusSearch from "@/components/sections/CampusSearch";
import { CHAPTER_LIST, chapterLocation, chapterName } from "@/lib/chapters";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";
import type { OurNetworkData } from "@/lib/homeBlockTypes";

type Campus = { name: string; location: string };

/**
 * The chapters, shown until they have been added in /admin.
 *
 * These are the real ones, read from the same list the network map is drawn
 * from. What stood here before was a dozen invented names — AM Harvard, AM
 * UCLA, AM Rutgers — put in as placeholders and never replaced, so the live
 * site listed chapters that do not exist.
 */
const defaultCampuses: Campus[] = CHAPTER_LIST.map((chapter) => ({
  name: chapterName(chapter),
  location: chapterLocation(chapter),
}));

async function getCampuses(tenantId?: string): Promise<Campus[]> {
  const docs = await fetchCollectionSafely(async (payload) => {
    const result = await payload.find({
      collection: "campuses",
      where: {
        and: [
          { active: { equals: true } },
          // A country site lists its own chapters. The international site
          // lists the whole network, including the ones that belong to a
          // country — it is the network, and a chapter filed under Germany is
          // still part of it. Filtering to the ones with no country at all
          // hid every chapter that had been placed properly.
          ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
        ],
      },
      sort: "name",
      limit: 200,
    });
    return result.docs;
  });

  if (!docs) return tenantId ? [] : defaultCampuses;
  return docs.map((doc) => ({ name: doc.name, location: doc.location }));
}

export default async function OurNetwork({
  data,
  tenantId,
}: { data?: OurNetworkData; tenantId?: string } = {}) {
  const [campuses, t] = await Promise.all([
    getCampuses(tenantId),
    getTranslations("Home.OurNetwork"),
  ]);

  return (
    <section
      className="py-24"
      style={{ backgroundImage: "linear-gradient(120deg, #1449c6, #007aff)" }}
    >
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="lg:pt-2">
          <Eyebrow tone="light">{data?.eyebrow ?? t("eyebrow")}</Eyebrow>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            {data?.heading ?? t("heading")}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75">
            {data?.description ?? t("description")}
          </p>
          <Button href="/get-involved/chapter-affiliation" variant="outlineLight" className="mt-9">
            {data?.startChapterLabel ?? t("startChapter")}
          </Button>
        </div>

        <CampusSearch
          campuses={campuses}
          searchPlaceholder={data?.searchPlaceholder ?? t("searchPlaceholder")}
          noMatchesLabel={data?.noMatchesLabel ?? t("noMatches")}
        />
      </Container>
    </section>
  );
}
