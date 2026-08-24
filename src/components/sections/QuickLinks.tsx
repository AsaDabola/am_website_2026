import { getTranslations } from "@/i18n/content";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import TenantLink from "@/components/layout/TenantLink";
import { BookIcon, HeartIcon, PeopleIcon, PinIcon } from "@/components/ui/icons";
import type { QuickLinksData } from "@/lib/homeBlockTypes";

const iconMap = { book: BookIcon, pin: PinIcon, people: PeopleIcon, heart: HeartIcon };

export default async function QuickLinks({ data }: { data?: QuickLinksData } = {}) {
  const t = await getTranslations("Home.QuickLinks");

  const links = data?.links?.length
    ? data.links.map((link) => ({
        title: link.title ?? "",
        description: link.description ?? "",
        href: link.href ?? "#",
        Icon: iconMap[link.icon ?? "book"],
        tenantAware: true,
      }))
    : [
        {
          title: t("joinBibleStudyTitle"),
          description: t("joinBibleStudyDescription"),
          href: "/bible-study",
          Icon: BookIcon,
          tenantAware: true,
        },
        {
          title: t("findCampusTitle"),
          description: t("findCampusDescription"),
          href: "/network",
          Icon: PinIcon,
          // A single global directory of every country, not a per-tenant page.
          tenantAware: false,
        },
        {
          title: t("getInvolvedTitle"),
          description: t("getInvolvedDescription"),
          href: "/get-involved",
          Icon: PeopleIcon,
          tenantAware: true,
        },
        {
          title: t("supportTitle"),
          description: t("supportDescription"),
          href: "/get-involved/donate",
          Icon: HeartIcon,
          tenantAware: true,
        },
      ];

  return (
    <section className="bg-white py-8">
      <Container>
        {/* The 1px gaps let the container colour through as hairline dividers
            between the tiles, matching the design's white rules. */}
        <div
          className="grid gap-px overflow-hidden rounded-xl sm:grid-cols-2 lg:grid-cols-4"
          style={{ backgroundColor: "rgba(255,255,255,0.28)" }}
        >
          {links.map(({ title, description, href, Icon, tenantAware }) => {
            const ItemLink = tenantAware ? TenantLink : Link;
            return (
              <ItemLink
                key={title}
                href={href}
                className="group flex flex-col gap-4 p-8 text-white transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundImage: "linear-gradient(180deg, #2a5eec, #4d8df6)",
                }}
              >
                <Icon className="size-8 text-white" />
                <div>
                  <p className="font-display text-lg font-bold tracking-[-0.02em]">{title}</p>
                  <p className="mt-2 text-sm text-on-dark/70">{description}</p>
                </div>
              </ItemLink>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
