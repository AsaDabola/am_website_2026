import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import PlaceholderPhoto from "@/components/ui/PlaceholderPhoto";

type Crumb = { label: string; href?: string };

export default function AboutHero({
  crumbs,
  title,
  subtitle,
}: {
  crumbs: Crumb[];
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden bg-night">
      <PlaceholderPhoto
        className="absolute inset-0 opacity-80"
        from="#1c3f8c"
        to="#050a2e"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/10 to-night/50" />

      <Container className="relative flex min-h-[300px] flex-col justify-center py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-on-dark/90">
          <ol className="flex items-center gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span className="opacity-50">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-[-0.02em] text-white sm:text-6xl lg:text-[80px]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-dark/80 sm:text-xl">
          {subtitle}
        </p>
      </Container>
    </section>
  );
}
