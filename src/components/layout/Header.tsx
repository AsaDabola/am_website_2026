import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import MobileNav from "@/components/layout/MobileNav";
import { ChevronDownIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { getPostsList } from "@/lib/posts";

export default async function Header() {
  const t = await getTranslations("Header");
  const tMega = await getTranslations("Header.megaMenu");
  const featuredPosts = (await getPostsList()).slice(0, 3);

  const aboutLinks = [
    { label: t("whoWeAreMenu.whoWeAre"), href: "/about" },
    { label: t("whoWeAreMenu.ourMission"), href: "/about/mission" },
    { label: t("whoWeAreMenu.statementOfFaith"), href: "/about/statement-of-faith" },
    { label: t("whoWeAreMenu.history"), href: "/about/history" },
    { label: t("whoWeAreMenu.ourFirstChairmen"), href: "/about/chairman" },
    { label: t("whoWeAreMenu.membership"), href: "/about/membership" },
    { label: t("whoWeAreMenu.ourLeadership"), href: "/about/leadership" },
  ];

  const whatWeDoLinks = [
    { label: t("whatWeDoMenu.pillarsOfMission"), href: "/what-we-do/pillars-of-mission" },
    { label: t("whatWeDoMenu.administration"), href: "/what-we-do/administration" },
    { label: t("whatWeDoMenu.bibleStudyProgram"), href: "/bible-study" },
    { label: t("whatWeDoMenu.fourSpiritualThemes"), href: "/four-spiritual-themes" },
    { label: t("whatWeDoMenu.amAcademy"), href: "https://www.amacademy.org" },
    { label: t("whatWeDoMenu.ourMinistries"), href: "/ministries" },
  ];

  const ctaLinks = [
    { label: tMega("ctaBibleStudy"), href: "/bible-study", tenantAware: true },
    // "Our Network" is a single global directory of every country, not a
    // per-tenant page, so it stays a plain (non-prefixed) link even inside
    // a country site.
    { label: tMega("ctaFindChapter"), href: "/network", tenantAware: false },
    { label: tMega("ctaGive"), href: "/get-involved/donate", tenantAware: true },
  ];

  const dropdowns = [
    { label: t("whoWeAre"), tenantAware: true, links: [...aboutLinks, ...whatWeDoLinks] },
    {
      label: t("connect"),
      tenantAware: true,
      links: [
        { label: t("getInvolvedMenu.bibleStudies"), href: "/bible-study" },
        { label: t("getInvolvedMenu.groupActivities"), href: "/get-involved/group-activities" },
        { label: t("getInvolvedMenu.volunteer"), href: "/get-involved/volunteer" },
        {
          label: t("getInvolvedMenu.bibleTeacherTraining"),
          href: "/get-involved/bible-teacher-training",
        },
        { label: t("getInvolvedMenu.internship"), href: "/get-involved/internship" },
        { label: t("getInvolvedMenu.donate"), href: "/get-involved/donate" },
        { label: t("contactUs"), href: "/contact" },
      ],
    },
    {
      // News/events are shared, globally-listed content with no per-tenant
      // route yet, so these links intentionally stay un-prefixed.
      label: t("news"),
      tenantAware: false,
      links: [
        { label: t("newsMenu.featured"), href: "/news" },
        { label: t("newsMenu.events"), href: "/events" },
        { label: t("newsMenu.editorial"), href: "/news/editorial" },
        { label: t("newsMenu.photoNews"), href: "/news/photo-news" },
        { label: t("newsMenu.testimony"), href: "/news/testimony" },
      ],
    },
  ];

  const plainLinks = [{ label: t("ourNetwork"), href: "/network", tenantAware: false }];

  return (
    <header className="sticky top-0 z-40 bg-brand-blue/95 backdrop-blur-[7px]">
      <Container className="flex h-[77px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {/* Who We Are — full mega menu, matching Cru's multi-column layout */}
          <div className="group relative">
            <button className="flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium text-white">
              {t("whoWeAre")}
              <ChevronDownIcon className="size-2.5 text-white/80" />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
              <div className="w-[880px] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/5 bg-white p-8 shadow-2xl">
                <div className="grid grid-cols-[1fr_1fr_1.3fr] gap-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink">
                      {tMega("aboutHeading")}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {aboutLinks.map((link) => (
                        <li key={link.label}>
                          <TenantLink
                            href={link.href}
                            className="text-sm text-ink-muted hover:text-brand-blue"
                          >
                            {link.label}
                          </TenantLink>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink">
                      {tMega("whatWeDoHeading")}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {whatWeDoLinks.map((link) => (
                        <li key={link.label}>
                          <TenantLink
                            href={link.href}
                            className="text-sm text-ink-muted hover:text-brand-blue"
                          >
                            {link.label}
                          </TenantLink>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink">
                      {tMega("featuredHeading")}
                    </p>
                    <ul className="mt-4 space-y-4">
                      {featuredPosts.map((post) => (
                        <li key={post.id}>
                          <Link href={`/news/${post.slug}`} className="group/article flex gap-3">
                            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-mist">
                              {post.coverImage ? (
                                <Image
                                  src={post.coverImage}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              ) : (
                                <span
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: "linear-gradient(135deg, #2a5eec, #0d1f52)",
                                  }}
                                />
                              )}
                            </span>
                            <span className="text-sm font-semibold leading-snug text-ink group-hover/article:text-brand-blue">
                              {post.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/news"
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white hover:bg-brand-navy"
                    >
                      {tMega("allArticles")}
                    </Link>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-black/[0.06] pt-6">
                  {ctaLinks.map((link) => {
                    const CtaLink = link.tenantAware ? TenantLink : Link;
                    return (
                      <CtaLink
                        key={link.label}
                        href={link.href}
                        className="group/cta flex items-center gap-3"
                      >
                        <span className="flex size-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue transition-colors group-hover/cta:bg-brand-blue group-hover/cta:text-white">
                          <ArrowUpRightIcon className="size-4" />
                        </span>
                        <span className="text-sm font-semibold text-ink">{link.label}</span>
                      </CtaLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {dropdowns.slice(1).map((item) => {
            const ItemLink = item.tenantAware ? TenantLink : Link;
            return (
              <div key={item.label} className="group relative">
                <button className="flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium text-white">
                  {item.label}
                  <ChevronDownIcon className="size-2.5 text-white/80" />
                </button>
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                  <div className="w-64 rounded-2xl border border-black/5 bg-white p-5 shadow-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink">
                      {item.label}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {item.links.map((link) => (
                        <li key={link.label}>
                          <ItemLink
                            href={link.href}
                            className="text-sm text-ink-muted hover:text-brand-blue"
                          >
                            {link.label}
                          </ItemLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}

          {plainLinks.map((link) => {
            const PlainLink = link.tenantAware ? TenantLink : Link;
            return (
              <PlainLink
                key={link.label}
                href={link.href}
                className="px-4 py-2.5 text-sm font-medium text-white hover:text-white/80"
              >
                {link.label}
              </PlainLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <TenantLink
            href="/get-involved/donate"
            className="ml-2 hidden rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white hover:bg-brand-navy-light sm:inline-flex"
          >
            {t("give")}
          </TenantLink>
          <MobileNav
            dropdowns={dropdowns}
            plainLinks={plainLinks}
            giveLabel={t("give")}
            toggleNavLabel={t("toggleNav")}
          />
        </div>
      </Container>
    </header>
  );
}
