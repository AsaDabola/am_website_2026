import Image from "next/image";
import TenantLink from "@/components/layout/TenantLink";
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

type Crumb = { label: string; href?: string };

export default function PillarsHero({
  crumbs,
  title,
}: {
  crumbs: Crumb[];
  title: string;
}) {
  return (
    <section className="relative overflow-hidden bg-night">
      {/* Placeholder photo: the design's own background (AdobeStock_279126842)
          could not be exported from Figma here, so this reuses an existing
          project image until the original is supplied. */}
      <Image
        src="/images/about-hero-banner.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* The band sits over the lower part of the same photo, so the scrim is
          anchored to the bottom rather than covering the whole image. */}
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-night via-night/90 to-transparent" />

      <Container className="relative flex min-h-[720px] flex-col py-14 lg:min-h-[860px]">
        <nav aria-label="Breadcrumb" className="text-[13px] text-on-dark/90">
          <ol className="flex items-center gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span className="opacity-50">/</span>}
                {crumb.href ? (
                  <TenantLink href={crumb.href} className="hover:text-white">
                    {crumb.label}
                  </TenantLink>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="mt-14 text-center font-display text-[52px] font-extrabold uppercase leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.85)] sm:text-[80px] lg:text-[104px]">
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
                className="overflow-hidden rounded-lg transition-transform hover:-translate-y-1"
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
                  className="px-5 py-6"
                  style={{ backgroundColor: card.body }}
                >
                  <p
                    className="text-center text-sm leading-[1.6]"
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
