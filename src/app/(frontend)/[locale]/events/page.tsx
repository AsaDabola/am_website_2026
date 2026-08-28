import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import NewsSubNav from "@/components/news/NewsSubNav";
import ArticleCard from "@/components/news/ArticleCard";
import FeatureCard from "@/components/news/FeatureCard";
import { ListingControls, Pagination } from "@/components/news/ListingControls";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getEventsPage, type EventSort } from "@/lib/events";
import { getTranslations } from "@/i18n/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events | AM International",
  description: "AM retreats, conferences, and chapter events.",
};

/** Search params arrive as strings or arrays; this reads one safely. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Events read as one of the news listings, because that is what they are: the
 * same sub-nav, the same count and sort line, the same card. The date sits
 * where a story's section sits, which is the line the design puts there.
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const sort: EventSort = first(params.sort) === "oldest" ? "oldest" : "newest";
  const perPage = [12, 24, 48].includes(Number(first(params.per)))
    ? Number(first(params.per))
    : 12;
  const requested = Math.max(1, Number(first(params.page)) || 1);

  const { events, page, totalPages, total } = await getEventsPage({
    sort,
    page: requested,
    perPage,
  });

  // Every word below is read through the country-aware translator, so a
  // country site shows its own language here rather than the English the page
  // used to carry in its markup.
  const t = await getTranslations("NewsListings");
  const tabs = await getTranslations("NewsSubNav");

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: tabs("news") }, { label: tabs("events") }]}
        // The line the design puts over the dune banner. No subtitle beneath
        // it there — the three words carry the section on their own.
        title={t("events.heroTitle")}
        backgroundImage="/images/events-hero.webp"
      />
      <NewsSubNav active="/events" />

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
          </div>
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {t("events.title")}
          </h1>

          {total > 0 && (
            <ListingControls
              base="/events"
              sort={sort}
              perPage={perPage}
              labels={{
                count: t("eventCount", { count: total }),
                sort: t("sort"),
                newest: t("newest"),
                oldest: t("oldest"),
                show: t("show"),
                previous: t("previous"),
                next: t("next"),
              }}
            />
          )}

          {events.length > 0 ? (
            <>
              <div className="mt-10 grid gap-10 text-start sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event, index) => {
                  // An event has no page of its own, so the date takes the
                  // line a story's section would hold and the cards do not
                  // pretend to open anything.
                  const tag = event.location
                    ? `${event.dateLabel} · ${event.location}`
                    : event.dateLabel;

                  // The design opens the listing with one wide card. It is
                  // whichever event the order puts first, and only on the
                  // first page — a later page opening with a feature would
                  // give a middling event the front of the section.
                  return index === 0 && page === 1 ? (
                    <FeatureCard key={event.id} image={event.coverImage} tag={tag} title={event.title} />
                  ) : (
                    <ArticleCard key={event.id} image={event.coverImage} tag={tag} title={event.title} />
                  );
                })}
              </div>

              <Pagination
                base="/events"
                sort={sort}
                perPage={perPage}
                page={page}
                totalPages={totalPages}
                labels={{ previous: t("previous"), next: t("next") }}
              />
            </>
          ) : (
            <p className="mx-auto mt-14 max-w-md text-base leading-relaxed text-ink-muted">
              {t("emptyEvents")}
            </p>
          )}
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
