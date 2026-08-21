import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import { getEventsList } from "@/lib/events";
import { getPostsList } from "@/lib/posts";

type Card = {
  key: string;
  kind: "event" | "testimony";
  label: string;
  title: string;
  href: string;
  image?: string;
};

/**
 * The design fills this row with stock travel articles; the real section shows
 * AM's own events and testimonies. Two of each where both exist, otherwise
 * whatever is available — and nothing at all rather than empty frames.
 */
export default async function EventsAndTestimonials() {
  const [events, testimonies] = await Promise.all([
    getEventsList(),
    getPostsList("testimony"),
  ]);

  const eventCards: Card[] = events.slice(0, 2).map((event) => ({
    key: `event-${event.id}`,
    kind: "event",
    label: "Event",
    title: event.title,
    href: "/events",
    image: event.coverImage,
  }));

  const testimonyCards: Card[] = testimonies.slice(0, 2).map((post) => ({
    key: `testimony-${post.id}`,
    kind: "testimony",
    label: "Testimony",
    title: post.title,
    href: `/news/${post.slug}`,
    image: post.coverImage,
  }));

  // Interleave so the row reads event / testimony / event / testimony, then
  // top up from whichever list still has entries.
  const paired = eventCards.flatMap((event, index) =>
    testimonyCards[index] ? [event, testimonyCards[index]] : [event],
  );
  const cards = [...paired, ...testimonyCards.slice(eventCards.length)].slice(0, 4);

  if (cards.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <Container>
        <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Events &amp; Testimonials
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.key} href={card.href} className="group block">
              <div className="relative aspect-[296/212] overflow-hidden rounded-xl bg-mist">
                {card.image && (
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                )}
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {card.label}
              </p>
              <p className="mt-2 font-display text-base font-bold leading-snug text-ink group-hover:text-brand-blue">
                {card.title}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
                <svg viewBox="0 0 18 18" fill="none" aria-hidden className="size-4">
                  <path
                    d="M3 3.5h8.5a2 2 0 0 1 2 2V15H5a2 2 0 0 1-2-2V3.5Z"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                  />
                  <path d="M6 7h6M6 10h6" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
                </svg>
                Read
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
