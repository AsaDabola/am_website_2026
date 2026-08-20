import { useTranslations } from "next-intl";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

export default function GetInvolvedSubNav({ active }: { active: string }) {
  const t = useTranslations("GetInvolvedSubNav");
  const getInvolvedTabs = [
    { label: t("thursdayBibleStudy"), href: "/get-involved/online-bible-study" },
    { label: t("bibleStudies"), href: "/bible-study" },
    { label: t("groupActivities"), href: "/get-involved/group-activities" },
    { label: t("volunteer"), href: "/get-involved/volunteer" },
    { label: t("chapterStaff"), href: "/get-involved/chapter-staff" },
    { label: t("bibleTeacherTraining"), href: "/get-involved/bible-teacher-training" },
    { label: t("internship"), href: "/get-involved/internship" },
    { label: t("alumniConnect"), href: "/get-involved/alumni-connect" },
    { label: t("donate"), href: "/get-involved/donate" },
  ];

  return (
    <div className="border-b border-black/[0.12] bg-white">
      <Container>
        <nav className="flex gap-8 overflow-x-auto">
          {getInvolvedTabs.map((tab) => {
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
