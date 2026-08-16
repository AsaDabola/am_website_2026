import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
        { label: t("fourSpiritualThemes"), href: "/four-spiritual-themes" },
        { label: t("amAcademy"), href: "https://www.amacademy.org" },
        { label: t("ourMinistries"), href: "/ministries" },
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
        { label: t("fourSpiritualThemes"), href: "/four-spiritual-themes" },
        { label: t("legacyOfChairman"), href: "/ralph-d-winter" },
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
          <p className="mt-6 text-sm leading-relaxed text-on-dark/70">
            {t("orgName")}
            <br />
            {t("orgLocation")}
            <br />
            <a href="mailto:info@amintl.org" className="underline underline-offset-2">
              {t("email")}
            </a>
          </p>
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
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/[0.15]">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-[13px] text-on-dark/45 sm:flex-row">
          <p>{t("copyright")}</p>
          <div className="flex gap-6">
            <Link href="/about/statement-of-faith" className="hover:text-on-dark/80">
              {t("statementOfFaith")}
            </Link>
            <Link href="/contact" className="hover:text-on-dark/80">
              {t("contact")}
            </Link>
            <Link href="/get-involved/donate" className="hover:text-on-dark/80">
              {t("give")}
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
