import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";

export const getInvolvedTabs = [
  { label: "Thursday Bible Study", href: "/what-we-do/pillars-of-mission" },
  { label: "Bible Studies", href: "/bible-study" },
  { label: "Group Activities", href: "/get-involved/group-activities" },
  { label: "Volunteer", href: "/get-involved/volunteer" },
  { label: "Chapter Staff", href: "/get-involved/chapter-staff" },
  { label: "Bible Teacher Training", href: "/get-involved/bible-teacher-training" },
  { label: "Internship", href: "/get-involved/internship" },
  { label: "Alumni Connect", href: "/get-involved/alumni-connect" },
  { label: "Donate", href: "/get-involved/donate" },
];

export default function GetInvolvedSubNav({ active }: { active: string }) {
  return (
    <div className="border-b border-black/[0.12] bg-white">
      <Container>
        <nav className="flex gap-8 overflow-x-auto">
          {getInvolvedTabs.map((tab) => {
            const isActive = tab.href === active;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-brand-navy text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
