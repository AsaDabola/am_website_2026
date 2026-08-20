import { useTranslations } from "next-intl";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

export function useAboutTabs() {
  const t = useTranslations("AboutSubNav");
  return [
    { label: t("whoWeAre"), href: "/about" },
    { label: t("missionStatement"), href: "/about/mission" },
    { label: t("statementOfFaith"), href: "/about/statement-of-faith" },
    { label: t("history"), href: "/about/history" },
    { label: t("ourFirstChairman"), href: "/about/chairman" },
    { label: t("membership"), href: "/about/membership" },
    { label: t("leadership"), href: "/about/leadership" },
  ];
}

export default function AboutSubNav({ active }: { active: string }) {
  const aboutTabs = useAboutTabs();
  return (
    <div className="border-b border-black/[0.12] bg-white">
      <Container>
        <nav className="flex gap-8 overflow-x-auto">
          {aboutTabs.map((tab) => {
            const isActive = tab.href === active;
            return (
              <TenantLink
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-brand-navy text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </TenantLink>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
