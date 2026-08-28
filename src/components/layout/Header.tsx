import { getTranslations } from "@/i18n/content";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import CountrySwitcher from "@/components/layout/CountrySwitcher";
import DesktopNav from "@/components/layout/DesktopNav";
import MobileNav from "@/components/layout/MobileNav";
import { getNavigation } from "@/components/layout/navigation";
import { getCountryDirectory } from "@/lib/countryDirectory";

export default async function Header() {
  const t = await getTranslations("Header");
  const { menus, plainLinks } = await getNavigation();

  // Only the four fields the switcher needs cross to the client — the full
  // sheet carries native-language lists and geo codes it has no use for.
  const countries = await getCountryDirectory();
  const switcherCountries = countries
    .filter((country) => country.live)
    .map(({ country, key, flag, locale }) => ({ country, key, flag, locale }));

  return (
    // `sticky` makes this the containing block for the dropdown panels below,
    // which is what lets them span the full viewport width instead of being
    // trapped inside the Container.
    <header className="sticky top-0 z-40 bg-brand-blue/95 backdrop-blur-[7px]">
      <Container className="flex h-[77px] items-center justify-between">
        <Logo />

        <DesktopNav menus={menus} plainLinks={plainLinks} />

        <div className="flex items-center gap-1">
          {/*
            No language picker: the language follows the country. Choosing
            Germany is choosing German — the switcher below routes to that
            country's own locale, and the middleware sends anyone who lands on
            a country site under the wrong one to the right one. A picker
            beside it only offered a way to read a country's site in a language
            that country does not use.
          */}
          <CountrySwitcher countries={switcherCountries} />
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
