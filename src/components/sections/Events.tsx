import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";

const events = [
  { date: "April 4–5", title: "Easter Retreat" },
  { date: "February 18", title: "Lenten 40-Day Walk" },
  { date: "January 16", title: "New Chapter Leaders’ Meeting" },
];

export default function Events() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Events</Eyebrow>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
              Where the network gathers.
            </h2>
          </div>
          <Button href="/events" variant="ghostDark" className="shrink-0">
            All events
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
