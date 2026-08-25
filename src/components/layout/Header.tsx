import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import CountrySwitcher from "@/components/layout/CountrySwitcher";
import MobileNav from "@/components/layout/MobileNav";
import { ArrowRightIcon, ChevronDownIcon, NavIcon } from "@/components/ui/icons";
import { getNavigation } from "@/components/layout/navigation";
import { getCountryDirectory } from "@/lib/countryDirectory";

/** Picks the country-aware or plain link depending on where the target lives. */
function NavAnchor({
  href,
  tenantAware,
  className,
  children,
}: {
  href: string;
  tenantAware: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Anchor = tenantAware ? TenantLink : Link;
  return (
    <Anchor href={href} className={className}>
      {children}
    </Anchor>
  );
}

export default async function Header() {
  const t = await getTranslations("Header");
  const { menus, plainLinks } = await getNavigation();

  // Only the three fields the switcher renders cross to the client — the full
  // sheet carries language lists and geo codes it has no use for.
  const countries = await getCountryDirectory();
  const switcherCountries = countries
    .filter((country) => country.live)
    .map(({ country, key, flag }) => ({ country, key, flag }));

  return (
    // `sticky` makes this the containing block for the dropdown panels below,
    // which is what lets them span the full viewport width instead of being
    // trapped inside the Container.
    <header className="sticky top-0 z-40 bg-brand-blue/95 backdrop-blur-[7px]">
      <Container className="flex h-[77px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {menus.map((menu) => (
            // Deliberately not `relative` — see the header comment above.
            <div key={menu.key} className="group">
              <button className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white">
                {menu.label}
                <ChevronDownIcon className="size-2.5 text-white/80 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />
              </button>

              <div className="invisible absolute inset-x-0 top-full opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="max-h-[calc(100vh-77px)] overflow-y-auto border-t border-black/5 bg-white shadow-[0_18px_40px_-12px_rgba(5,10,46,0.25)]">
                  <Container className="py-10">
                    <NavAnchor
                      href={menu.href}
                      tenantAware={menu.tenantAware}
                      className="group/all inline-flex items-center gap-2 border-b-2 border-brand-blue pb-1.5 font-display text-lg font-bold text-brand-blue"
                    >
                      {menu.label}
                      <ArrowRightIcon className="size-4 transition-transform group-hover/all:translate-x-1" />
                    </NavAnchor>

                    <div className="mt-9 grid gap-x-10 gap-y-10 lg:grid-cols-3">
                      {menu.groups.map((group) => (
                        <div key={group.key} className="flex gap-4">
                          <NavIcon
                            name={group.icon}
                            className="mt-0.5 size-6 shrink-0 text-brand-blue"
                          />
                          <div className="min-w-0">
                            <NavAnchor
                              href={group.href}
                              tenantAware={group.tenantAware}
                              className="font-display text-lg font-bold text-ink hover:text-brand-blue"
                            >
                              {group.label}
                            </NavAnchor>
                            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                              {group.description}
                            </p>

                            {group.links.length > 0 && (
                              <ul className="mt-4 space-y-0.5">
                                {group.links.map((link) => (
                                  <li key={link.href}>
                                    <NavAnchor
                                      href={link.href}
                                      tenantAware={link.tenantAware}
                                      className="-mx-3 block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-brand-blue/[0.07] hover:text-brand-blue"
                                    >
                                      {link.label}
                                    </NavAnchor>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Container>
                </div>
              </div>
            </div>
          ))}

          {plainLinks.map((link) => (
            <NavAnchor
              key={link.href}
              href={link.href}
              tenantAware={link.tenantAware}
              className="px-4 py-2.5 text-sm font-medium text-white hover:text-white/80"
            >
              {link.label}
            </NavAnchor>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <CountrySwitcher countries={switcherCountries} />
          <LanguageSwitcher />
          <TenantLink
            href="/get-involved/donate"
            className="ms-2 hidden rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white hover:bg-brand-navy-light sm:inline-flex"
          >
            {t("give")}
          </TenantLink>
          <MobileNav
            menus={menus}
            plainLinks={plainLinks}
            giveLabel={t("give")}
            toggleNavLabel={t("toggleNav")}
            backLabel={t("mobile.back")}
            closeLabel={t("mobile.close")}
          />
        </div>
      </Container>
    </header>
  );
}
