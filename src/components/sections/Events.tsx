import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { fetchCollectionSafely } from "@/lib/getPayloadSafely";

type EventItem = { date: string; title: string };

async function getDefaultEvents(): Promise<EventItem[]> {
  const t = await getTranslations("Home.Events");
  return [
    { date: t("event1Date"), title: t("event1Title") },
    { date: t("event2Date"), title: t("event2Title") },
    { date: t("event3Date"), title: t("event3Title") },
  ];
}

async function getEvents(): Promise<EventItem[]> {
  const defaultEvents = await getDefaultEvents();

  const docs = await fetchCollectionSafely(async (payload) => {
    const result = await payload.find({
      collection: "events",
      sort: "startDate",
      limit: 3,
    });
    return result.docs;
  });

  if (!docs) return defaultEvents;
  return docs.map((doc) => ({ date: doc.dateLabel, title: doc.title }));
}

export default async function Events() {
  const [events, t] = await Promise.all([getEvents(), getTranslations("Home.Events")]);

  return (
    <section className="bg-white py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
              {t("heading")}
            </h2>
          </div>
          <Button href="/events" variant="ghostDark" className="shrink-0">
            {t("allEvents")}
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {events.map((event) => (
            <div key={event.title} className="rounded-xl bg-mist p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-blue">
                {event.date}
              </p>
              <p className="mt-3 font-display text-lg font-bold text-ink">
                {event.title}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
