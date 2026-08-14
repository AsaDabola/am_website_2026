import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

export default async function AnnouncementBar() {
  const t = await getTranslations("AnnouncementBar");

  return (
    <div
      className="text-[13px]"
      style={{
        backgroundImage:
          "linear-gradient(185deg, #145ec6 29%, #1449c6 88%)",
      }}
    >
      <Container className="flex h-10 items-center justify-between">
        <p className="truncate text-[11px] uppercase tracking-[0.08em] text-white/90">
          {t("tagline")}
        </p>
        <Link
          href="https://www.amacademy.org"
          className="hidden shrink-0 text-white/90 hover:text-white sm:block"
        >
          {t("amAcademy")}
        </Link>
      </Container>
    </div>
  );
}
