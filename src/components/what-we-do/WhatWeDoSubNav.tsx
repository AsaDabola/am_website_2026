import { useTranslations } from "next-intl";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

export default function WhatWeDoSubNav({ active }: { active: string }) {
  const t = useTranslations("WhatWeDoSubNav");
  const whatWeDoTabs = [
    { label: t("pillarsOfMission"), href: "/what-we-do/pillars-of-mission" },
    { label: t("administration"), href: "/what-we-do/administration" },
  ];

  return (
    <div className="border-b border-black/[0.12] bg-white">
      <Container>
        <nav className="flex gap-8 overflow-x-auto">
          {whatWeDoTabs.map((tab) => {
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
