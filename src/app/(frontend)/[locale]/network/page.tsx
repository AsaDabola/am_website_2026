import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";
import { Link } from "@/i18n/navigation";
import AboutHero from "@/components/about/AboutHero";
import OurNetwork from "@/components/sections/OurNetwork";
import { regions } from "@/lib/regions";
import { getActiveTenantCountByContinent } from "@/lib/tenants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Network | AM International",
  description: "Find AM's presence around the world, from campus chapters to country sites.",
};

export default async function NetworkPage() {
  const counts = await getActiveTenantCountByContinent();

  return (
    <>
      <AboutHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Network" }]}
        title="Our Network"
        subtitle="Find AM's presence around the world, from campus chapters to country-wide ministries."
      />

      <section className="bg-white py-24">
        <Container className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Explore the world</Eyebrow>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-5xl">
            Regions
          </h1>
          <p className="mt-3 text-base text-ink-muted">Explore geographically</p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((region) => {
              const count = counts[region.slug] ?? 0;
              return (
                <Link
                  key={region.slug}
                  href={`/network/${region.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <PlaceholderPhoto
                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                    from={region.from}
                    to={region.to}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute bottom-5 left-0 right-0 text-center font-display text-xl font-bold text-white">
                    {region.label}
                  </span>
                  {count > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {count} {count === 1 ? "site" : "sites"}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <OurNetwork />
    </>
  );
}
