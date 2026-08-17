import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AboutHero from "@/components/about/AboutHero";
import NewsSubNav from "@/components/news/NewsSubNav";
import PartnerWithUs from "@/components/sections/PartnerWithUs";
import Newsletter from "@/components/sections/Newsletter";
import { getEventsList } from "@/lib/events";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events | AM International",
  description: "Upcoming AM retreats, conferences, and chapter events.",
};

export default async function EventsPage() {
  const events = await getEventsList();

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }, { label: "Events" }]}
        title="News"
        subtitle="What students are seeing, where AM is going next, and how to pray."
      />
      <NewsSubNav active="/events" />

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>News</Eyebrow>
          </div>
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Events
          </h1>

          {events.length > 0 ? (
            <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0px_10px_30px_0px_rgba(27,29,52,0.06)]"
                >
                  <div className="relative aspect-[300/212] w-full overflow-hidden bg-mist">
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, 100vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundImage: "linear-gradient(135deg, #2a5eec, #0d1f52)" }}
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue">
                      {event.dateLabel}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">
                      {event.title}
                    </h3>
                    {event.excerpt && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                        {event.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-14 max-w-md text-base leading-relaxed text-ink-muted">
              No upcoming events yet — check back soon.
            </p>
          )}
        </Container>
      </section>

      <PartnerWithUs />
      <Newsletter />
    </>
  );
}
