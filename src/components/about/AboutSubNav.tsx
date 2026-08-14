import Link from "next/link";
import Container from "@/components/ui/Container";

export const aboutTabs = [
  { label: "Who we are", href: "/about" },
  { label: "Mission statement", href: "/about/mission" },
  { label: "Statement of faith", href: "/about/statement-of-faith" },
  { label: "History", href: "/about/history" },
  { label: "Leadership", href: "/about/leadership" },
  { label: "Our First Chairman", href: "/about/chairman" },
];

export default function AboutSubNav({ active }: { active: string }) {
  return (
    <div className="border-b border-black/[0.12] bg-white">
      <Container>
        <nav className="flex gap-8 overflow-x-auto">
          {aboutTabs.map((tab) => {
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
