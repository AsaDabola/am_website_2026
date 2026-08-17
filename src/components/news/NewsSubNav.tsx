import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";

export const newsTabs = [
  { label: "Featured News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Editorial", href: "/news/editorial" },
  { label: "Photo News", href: "/news/photo-news" },
  { label: "Testimony", href: "/news/testimony" },
];

export default function NewsSubNav({ active }: { active: string }) {
  return (
    <div className="border-b border-black/[0.12] bg-white">
      <Container>
        <nav className="flex gap-8 overflow-x-auto">
          {newsTabs.map((tab) => {
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
