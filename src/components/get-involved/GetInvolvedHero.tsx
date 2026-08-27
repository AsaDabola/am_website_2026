import Image from "next/image";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

type Crumb = { label: string; href?: string };

/**
 * Card colours match the pillar cards used elsewhere on the site. They are
 * bespoke to this treatment rather than theme tokens, so they stay literal.
 */
const CARD_COLOURS = [
  { header: "#2abfbf", body: "#1a4040", text: "#e0f7f7" },
  { header: "#3b82f6", body: "#1a2a4a", text: "#dbeafe" },
  { header: "#4b7aae", body: "#1a2535", text: "#d1e4f5" },
  { header: "#1e3a5f", body: "#0f1f35", text: "#c8d8ec" },
] as const;

export default function GetInvolvedHero({
  crumbs,
  title,
  cards,
}: {
  crumbs: Crumb[];
  title: string;
  cards: { label: string; items: string[] }[];
}) {
  return (
    <section className="relative overflow-hidden bg-night">
      <Image
        src="/images/get-involved-hero.webp"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* The sky and sunlit field are both bright, so the outlined title and
          breadcrumbs need scrims at either end to stay readable. */}
      <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-night/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-night via-night/85 to-transparent" />

      <Container className="relative flex min-h-[680px] flex-col py-14 lg:min-h-[820px]">
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

        <h1 className="mt-auto text-center font-display text-[40px] font-extrabold uppercase leading-[1.05] tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.9)] sm:text-[64px] lg:text-[80px]">
          {title}
        </h1>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => {
            const colour = CARD_COLOURS[index % CARD_COLOURS.length];
            return (
              // The four cards carry one, two and three lines between them.
              // The grid already stretches each cell to the tallest, but the
              // colour only reached as far as the text did — so `h-full` and a
              // growing body make the block itself the same height, and the
              // list centres in whatever room that leaves.
              <div
                key={card.label}
                className="flex h-full flex-col overflow-hidden rounded-lg"
              >
                <div
                  className="flex shrink-0 items-center justify-center px-4 py-4"
                  style={{ backgroundColor: colour.header }}
                >
                  <span className="font-display text-base font-extrabold uppercase text-white">
                    {card.label}
                  </span>
                </div>
                <div
                  className="flex flex-1 items-center justify-center px-5 py-6"
                  style={{ backgroundColor: colour.body }}
                >
                  <ul className="space-y-1 text-center text-sm leading-[1.5]" style={{ color: colour.text }}>
                    {card.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
