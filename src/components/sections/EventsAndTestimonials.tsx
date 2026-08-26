import Container from "@/components/ui/Container";
import ArticleCard from "@/components/news/ArticleCard";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";
import { tenantContentWhere } from "@/lib/tenantContentWhere";
import { mediaUrl } from "@/lib/homeBlockTypes";
import { getPostsList } from "@/lib/posts";

type Card = {
  key: string;
  href: string;
  image?: string;
  tag: string;
  title: string;
  date?: string;
};

/**
 * The four-card row the design closes Online Bible Study with. Its cards are
 * template filler in Figma — national parks tagged "Travel" — so what fills
 * them here is the two things the heading names: the events feed, and the
 * testimony posts. Events have no detail page of their own, so those cards
 * land on the events listing; testimonies go to the story.
 */
export default async function EventsAndTestimonials({
  tenantId,
}: { tenantId?: string } = {}) {
  const [eventDocs, testimonies] = await Promise.all([
    fetchCollectionSafely(async (payload) => {
      const result = await payload.find({
        collection: "events",
        sort: "startDate",
        limit: 4,
        where: tenantContentWhere(tenantId),
      });
      return result.docs;
    }),
    getPostsList("testimony"),
  ]);

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const eventCards: Card[] = (eventDocs ?? []).map((doc) => {
    // Via unknown: once payload-types.ts has been generated, `doc` is the
    // typed Event, which has no index signature and so is not directly
    // assertable to a record.
    const event = doc as unknown as Record<string, unknown>;
    return {
      key: `event-${String(event.id)}`,
      href: "/events",
      image: mediaUrl(event.coverImage as { url?: string } | string | undefined),
      tag: "Event",
      title: event.title as string,
      date: (event.dateLabel as string) || undefined,
    };
  });

  const testimonyCards: Card[] = testimonies.map((post) => ({
    key: `post-${post.id}`,
    href: `/news/${post.slug}`,
    image: post.coverImage,
    tag: "Testimony",
    title: post.title,
    date: dateFormatter.format(new Date(post.publishedDate)),
  }));

  // Interleaved so the row reads event / testimony / event / testimony, then
  // topped up from whichever list still has entries. Both halves of the
  // heading show even when one of them has far more to offer than the other —
  // four events and no testimony would otherwise render a row that contradicts
  // its own title.
  const paired = eventCards
    .slice(0, 2)
    .flatMap((event, index) =>
      testimonyCards[index] ? [event, testimonyCards[index]] : [event],
    );
  const cards = [
    ...paired,
    ...eventCards.slice(2),
    ...testimonyCards.slice(Math.min(eventCards.length, 2)),
  ].slice(0, 4);

  // Nothing scheduled and nothing written yet — the design has no empty state
  // for this row, and a lone heading over a gap reads worse than no section.
  if (cards.length === 0) return null;

  return (
    <section className="bg-white py-24">
      <Container>
        <h2 className="font-display text-[34px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[45px]">
          Events &amp; Testimonials
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <ArticleCard
              key={card.key}
              href={card.href}
              image={card.image}
              tag={card.tag}
              title={card.title}
              date={card.date}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
