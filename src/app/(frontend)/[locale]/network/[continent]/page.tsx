import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
  if (!isContinent(continent)) return { title: "AM Network" };
  const t = await getTranslations("Network");
  return { title: `${t(`regions.${continent}`)} | AM Network` };
}

export default async function ContinentPage({ params }: Props) {
  const { continent } = await params;
  if (!isContinent(continent)) notFound();

  const region = regions.find((r) => r.slug === continent);
  if (!region) notFound();

  const [t, common, tenants] = await Promise.all([
    getTranslations("Network"),
    getTranslations("Common"),
    getTenantsByContinent(continent),
  ]);
  const label = t(`regions.${continent}`);

  return (
    <>
      <AboutHero
        crumbs={[
          { label: common("home"), href: "/" },
          { label: t("breadcrumb"), href: "/network" },
          { label },
        ]}
        title={label}
        subtitle={t("continentSubtitle", { region: label })}
      />

      <section className="bg-white py-24">
        <Container className="max-w-[720px]">
          {tenants.length === 0 ? (
            <div className="rounded-2xl bg-mist p-10 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                {t("noSitesTitle", { region: label })}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {t("noSitesBodyPrefix")}{" "}
                <Link href="/contact" className="text-brand-blue underline underline-offset-2">
                  {t("noSitesLink")}
                </Link>{" "}
                {t("noSitesBodySuffix")}
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
                    <span className="text-sm text-brand-blue">{t("visitSite")} →</span>
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
