import Image from "next/image";
import Container from "@/components/ui/Container";

/**
 * The four pillars as they appear on the hero band. Each card is a two-tone
 * block — a saturated header over a deep-tinted body — and the pairs are
 * bespoke to this design rather than theme tokens, so they stay literal.
 */
const PILLAR_CARDS = [
  {
    title: "Evangelism",
    description: "Active outreach and events with the youth in universities.",
    header: "#2abfbf",
    body: "#1a4040",
    text: "#e0f7f7",
  },
  {
    title: "Education",
    description: "Teach and raise students in the Word of God.",
    header: "#3b82f6",
    body: "#1a2a4a",
    text: "#dbeafe",
  },
  {
    title: "Discipleship",
    description: "Offering students the opportunity to apply the Word of God in practical life.",
    header: "#4b7aae",
    body: "#1a2535",
    text: "#d1e4f5",
  },
  {
    title: "Mission",
    description:
      "Innovate ways to pioneer new chapters and serve God according to your gifts and talents.",
    header: "#1e3a5f",
    body: "#0f1f35",
    text: "#c8d8ec",
  },
] as const;

export default function PillarsHero({ title }: { title: string }) {
  return (
    <section className="relative overflow-hidden bg-night">
      <Image
        src="/images/pillars-hero.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/*
        The design's own gradient, taken from its inspect panel rather than
        approximated: clear for the top three quarters, then a blue that comes
        up to 0.85 at the foot. It is a blue wash over the photograph, not the
        near-black scrim this carried before, so the grass and the sea keep
        their colour all the way down.

        Spelled out inline because it is four stops of one specific colour —
        as a Tailwind arbitrary value it would be a single unreadable token,
        and the point of copying it verbatim is that it stays comparable to
        the design.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(89, 140, 209, 0), rgba(89, 140, 209, 0) 75%, rgba(89, 140, 209, 0.5) 90%, rgba(89, 140, 209, 0.85))",
        }}
      />

      {/* The design carries no breadcrumb here — the header's What We Do menu
          does the wayfinding — and gives the frame a 2:3 crop, 1280px on its
          1920 canvas. */}
      <Container className="relative flex min-h-[720px] flex-col py-14 lg:min-h-[960px]">
        {/* Archivo Black 96px in sentence case, outlined in the brand blue
            rather than the white the About-family ghost titles use — against
            this hero's bright sky a white rule would barely register. It is
            centred inside a block anchored to the content edge, not across
            the page, which is what sets it left of centre in the design. */}
        <h1 className="max-w-[896px] text-center font-display text-[52px] font-black leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_var(--color-brand-blue)] sm:text-[72px] lg:text-[96px]">
          {title}
        </h1>

        <div className="mt-auto pt-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-20">
            <div className="lg:w-[380px] lg:shrink-0">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-blue">
                What we do
              </p>
              <p className="mt-4 font-display text-[32px] font-extrabold leading-[1.1] text-[#f3f4f6] sm:text-[40px]">
                Pillars of Mission
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-8 sm:flex-row sm:gap-10">
              <p className="flex-1 text-base leading-[1.5] text-[#f3f4f6]">
                AM International is a world-wide community of believers dedicated towards the
                spreading of the Gospel across university campuses. We aim to foster a
                Christ-centered network of young Christians for the mobilization of campus
                mission.
              </p>

              <div className="flex flex-1 flex-col items-start gap-6">
                <p className="text-sm leading-relaxed text-white">
                  We do this through 4 pillars of mission which aim to fulfill the dream of Jesus
                  and the vision of the Gospel across the world.
                  <br />
                  <br />
                  Want to find out where you fit?
                </p>
                <a
                  href="#evangelism"
                  className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-ink"
                >
                  See more
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLAR_CARDS.map((card) => (
              <a
                key={card.title}
                href={`#${card.title.toLowerCase()}`}
                // A column filling the grid row, so all four end level however
                // long the sentence inside them runs. The card stretched to
                // the tallest of them before, but its coloured body stopped
                // where its own text did and left the rest transparent.
                className="flex h-full flex-col overflow-hidden rounded-lg transition-transform hover:-translate-y-1"
              >
                <div
                  className="flex items-center justify-center p-5"
                  style={{ backgroundColor: card.header }}
                >
                  <span className="font-display text-xl font-extrabold uppercase text-white">
                    {card.title}
                  </span>
                </div>
                <div
                  className="flex flex-1 items-center px-5 py-6"
                  style={{ backgroundColor: card.body }}
                >
                  <p
                    className="w-full text-center text-sm leading-[1.6]"
                    style={{ color: card.text }}
                  >
                    {card.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
