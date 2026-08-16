"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { ChevronDownIcon } from "@/components/ui/icons";

export default function Header() {
  const t = useTranslations("Header");
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdowns = [
    {
      label: t("whoWeAre"),
      columns: 2,
      links: [
        { label: t("whoWeAreMenu.whoWeAre"), href: "/about" },
        { label: t("whoWeAreMenu.ourMission"), href: "/about/mission" },
        { label: t("whoWeAreMenu.statementOfFaith"), href: "/about/statement-of-faith" },
        { label: t("whoWeAreMenu.history"), href: "/about/history" },
        { label: t("whoWeAreMenu.ourFirstChairmen"), href: "/about/chairman" },
        { label: t("whoWeAreMenu.membership"), href: "/about/membership" },
        { label: t("whoWeAreMenu.ourLeadership"), href: "/about/leadership" },
        { label: t("whatWeDoMenu.pillarsOfMission"), href: "/what-we-do/pillars-of-mission" },
        { label: t("whatWeDoMenu.administration"), href: "/what-we-do/administration" },
        { label: t("whatWeDoMenu.bibleStudyProgram"), href: "/bible-study" },
        { label: t("whatWeDoMenu.fourSpiritualThemes"), href: "/four-spiritual-themes" },
        { label: t("whatWeDoMenu.amAcademy"), href: "https://www.amacademy.org" },
        { label: t("whatWeDoMenu.ourMinistries"), href: "/ministries" },
      ],
    },
    {
      label: t("connect"),
      columns: 1,
      links: [
        { label: t("getInvolvedMenu.bibleStudies"), href: "/bible-study" },
        { label: t("getInvolvedMenu.groupActivities"), href: "/get-involved/group-activities" },
        { label: t("getInvolvedMenu.volunteer"), href: "/get-involved" },
        { label: t("getInvolvedMenu.bibleTeacherTraining"), href: "/get-involved/bible-teacher-training" },
        { label: t("getInvolvedMenu.internship"), href: "/get-involved/internship" },
        { label: t("getInvolvedMenu.donate"), href: "/get-involved/donate" },
        { label: t("contactUs"), href: "/contact" },
      ],
    },
    {
      label: t("news"),
      columns: 1,
      links: [
        { label: t("newsMenu.featured"), href: "/news" },
        { label: t("newsMenu.events"), href: "/events" },
        { label: t("newsMenu.editorial"), href: "/news/editorial" },
        { label: t("newsMenu.photoNews"), href: "/news/photo-news" },
        { label: t("newsMenu.testimony"), href: "/news/testimony" },
      ],
    },
  ];

  const plainLinks = [{ label: t("ourNetwork"), href: "/network" }];

  return (
    <header className="sticky top-0 z-40 bg-brand-blue/95 backdrop-blur-[7px]">
      <Container className="flex h-[77px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {dropdowns.map((item) => (
            <div key={item.label} className="group relative">
              <button className="flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium text-white">
                {item.label}
                <ChevronDownIcon className="size-2.5 text-white/80" />
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                <ul
                  className={
                    item.columns === 2
                      ? "grid w-[28rem] grid-cols-2 gap-x-2 rounded-xl border border-black/5 bg-white p-2 shadow-xl"
                      : "w-56 rounded-xl border border-black/5 bg-white p-2 shadow-xl"
                  }
                >
                  {item.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-mist"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {plainLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2.5 text-sm font-medium text-white hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Link
            href="/get-involved/donate"
            className="ml-2 hidden rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white hover:bg-brand-navy-light sm:inline-flex"
          >
            {t("give")}
          </Link>
          <button
            aria-label={t("toggleNav")}
            className="flex size-10 items-center justify-center rounded-md text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6">
              <path
                d={mobileOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand-blue lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {dropdowns.map((item) => (
              <div key={item.label} className="py-2">
                <p className="px-1 text-sm font-semibold text-white">{item.label}</p>
                <ul className="mt-1 space-y-1">
                  {item.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block rounded-md px-1 py-1.5 text-sm text-white/75 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {plainLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-1 py-2 text-sm font-medium text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-involved/donate"
              className="mt-2 inline-flex w-fit rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white"
            >
              {t("give")}
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
