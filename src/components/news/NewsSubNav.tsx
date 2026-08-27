import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";

export default function NewsSubNav({ active }: { active: string }) {
  const t = useTranslations("NewsSubNav");
  // The order the news section has always been presented in.
  const newsTabs = [
    { label: t("news"), href: "/news" },
    { label: t("events"), href: "/events" },
    { label: t("editorial"), href: "/news/editorial" },
    { label: t("photoNews"), href: "/news/photo-news" },
    { label: t("testimony"), href: "/news/testimony" },
  ];

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
