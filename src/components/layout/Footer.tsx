import { getTranslations } from "@/i18n/content";
import FooterOrg from "@/components/layout/FooterOrg";
import FooterCopyright from "@/components/layout/FooterCopyright";
import { getCountryDirectory } from "@/lib/countryDirectory";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { FacebookIcon, InstagramIcon, MailIcon, YoutubeIcon } from "@/components/ui/icons";

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
  { label: "Email", href: "mailto:info@amintl.org", Icon: MailIcon },
];

export default async function Footer() {
  const t = await getTranslations("Footer");

  // Only the live countries, and only the fields the footer shows.
  const footerCountries = (await getCountryDirectory())
    .filter((c) => c.live)
    .map(({ key, country, flag, orgName, address, contactEmail }) => ({
      key,
      country,
      flag,
      orgName,
      address,
      contactEmail,
    }));

  const columns = [
    {
      title: t("whoWeAre"),
      links: [
        { label: t("aboutAM"), href: "/about" },
        { label: t("missionStatement"), href: "/about/mission" },
        { label: t("statementOfFaith"), href: "/about/statement-of-faith" },
        { label: t("ourHistory"), href: "/about/history" },
        { label: t("leadership"), href: "/about/leadership" },
      ],
    },
    {
      title: t("whatWeDo"),
      links: [
        { label: t("bibleStudyProgram"), href: "/bible-study" },
        { label: t("amAcademy"), href: "https://www.amacademy.org" },
      ],
    },
    {
      title: t("getInvolved"),
      links: [
        { label: t("connectGrowLeadSent"), href: "/get-involved" },
        { label: t("chapterAffiliation"), href: "/get-involved/chapter-affiliation" },
        { label: t("ourNetwork"), href: "/network" },
        { label: t("events"), href: "/events" },
        { label: t("give"), href: "/get-involved/donate" },
      ],
    },
    {
      title: t("media"),
      links: [
        { label: t("news"), href: "/news" },
        { label: t("legacyOfChairman"), href: "/about/chairman" },
        { label: t("contactUs"), href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.07] bg-footer text-on-dark">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] lg:gap-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-6 text-sm leading-relaxed text-on-dark/70">
            {t("tagline")}
          </p>
          <FooterOrg
            countries={footerCountries}
            defaultOrgName={t("orgName")}
            defaultAddress={t("orgLocation")}
            defaultEmail={t("email")}
          />
          <div className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex size-[38px] items-center justify-center rounded-full border border-white/[0.12] text-on-dark/80 transition-colors hover:border-white/30 hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue">
              {col.title}
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-on-dark/70">
              {col.links.map((link) => (
                <li key={link.label}>
                  <TenantLink href={link.href} className="hover:text-white">
                    {link.label}
                  </TenantLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/[0.15]">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-[13px] text-on-dark/45 sm:flex-row">
          <FooterCopyright
            template={t.raw("copyright") as string}
            countries={footerCountries}
            defaultOrgName={t("orgName")}
          />
          <div className="flex gap-6">
            <TenantLink href="/about/statement-of-faith" className="hover:text-on-dark/80">
              {t("statementOfFaith")}
            </TenantLink>
            <TenantLink href="/contact" className="hover:text-on-dark/80">
              {t("contact")}
            </TenantLink>
            <TenantLink href="/get-involved/donate" className="hover:text-on-dark/80">
              {t("give")}
            </TenantLink>
          </div>
        </Container>
      </div>
    </footer>
  );
}
