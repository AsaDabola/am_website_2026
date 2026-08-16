import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import AboutHero from "@/components/about/AboutHero";
import Newsletter from "@/components/sections/Newsletter";
import { regions } from "@/lib/regions";
import { isContinent, getTenantsByContinent } from "@/lib/tenants";

export const revalidate = 60;

type Props = { params: Promise<{ continent: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { continent } = await params;
  const region = regions.find((r) => r.slug === continent);
  return { title: region ? `${region.label} | AM Network` : "AM Network" };
}

export default async function ContinentPage({ params }: Props) {
  const { continent } = await params;
  if (!isContinent(continent)) notFound();

  const region = regions.find((r) => r.slug === continent);
  if (!region) notFound();

  const tenants = await getTenantsByContinent(continent);

  return (
    <>
      <AboutHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Our Network", href: "/network" },
          { label: region.label },
        ]}
        title={region.label}
        subtitle={`AM country sites across ${region.label}.`}
      />

      <section className="bg-white py-24">
        <Container className="max-w-[720px]">
          {tenants.length === 0 ? (
            <div className="rounded-2xl bg-mist p-10 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                No {region.label} sites yet
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                We&rsquo;re still building out AM&rsquo;s presence in this region. Check back
                soon, or{" "}
                <Link href="/contact" className="text-brand-blue underline underline-offset-2">
                  get in touch
                </Link>{" "}
                if you&rsquo;d like to help start one.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-black/10 rounded-2xl border border-black/10">
              {tenants.map((tenant) => (
                <li key={tenant.id}>
                  <Link
                    href={`/${region.slug}/${tenant.slug}`}
                    className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-mist"
                  >
                    <span className="font-display text-lg font-semibold text-ink">
                      {tenant.country}
                    </span>
                    <span className="text-sm text-brand-blue">Visit site →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <Newsletter />
    </>
  );
}
