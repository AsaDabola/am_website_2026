import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

type Crumb = { label: string; href?: string };

/**
 * Leadership takes a painted hero rather than a photographic one: a blue
 * field running light-to-dark across the diagonal, with a soft brand-blue
 * glow bleeding in past the top-right corner. That is why it does not use
 * AboutHero — there is no photograph to wash, and none of AboutHero's
 * scrims or ghost-title machinery applies.
 */
export default function LeadershipHero({
  crumbs,
  eyebrow,
  title,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden pb-[108px] pt-24"
      style={{
        backgroundImage:
          "linear-gradient(106deg, #1449c6 4.95%, #0a2360 99.42%)",
      }}
    >
      {/* The glow is centred beyond the right edge and above the top, so only
          its lower-left quadrant falls on the panel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[140px] hidden size-[620px] lg:block"
        style={{
          insetInlineStart: "1769px",
          backgroundImage:
            "radial-gradient(circle, rgba(0,122,255,0.28) 0%, rgba(0,122,255,0) 66%)",
        }}
      />

      <Container className="relative max-w-[1104px]">
        <nav aria-label="Breadcrumb" className="text-[13px] text-white/55">
          <ol className="flex items-center gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden>/</span>}
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

        {/* Not the shared Eyebrow: this one draws a solid brand-blue rule at
            2px under white text, where every tone that component carries
            paints its rule and its text the same colour. */}
        <div className="mt-[34px] flex items-center gap-[19px]">
          <span className="h-0.5 w-7 shrink-0 bg-brand-blue" />
          <span className="text-[11.5px] font-bold uppercase tracking-[0.24em] text-white/70">
            {eyebrow}
          </span>
        </div>

        <h1 className="mt-6 max-w-[645px] font-display text-[44px] font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-[64px] lg:text-[86px]">
          {title}
        </h1>

        <div className="mt-[30px] max-w-[685px] text-[17.5px] leading-[30.1px] text-white/78">
          {children}
        </div>
      </Container>
    </section>
  );
}
