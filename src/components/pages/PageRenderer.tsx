import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import type { PageDoc } from "@/lib/pages";

type Crumb = { label: string; href?: string };

export default function PageRenderer({ page, crumbs }: { page: PageDoc; crumbs: Crumb[] }) {
  const heroImageUrl =
    page.hero?.image && typeof page.hero.image === "object" ? page.hero.image.url : undefined;
  const heading = page.hero?.heading || page.title;

  return (
    <>
      <section className="relative overflow-hidden bg-night">
        {heroImageUrl && (
          <>
            <Image src={heroImageUrl} alt="" fill className="object-cover opacity-80" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-night/10 to-night/50" />
          </>
        )}

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
            {heading}
          </h1>
          {page.hero?.subheading && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-dark/80 sm:text-xl">
              {page.hero.subheading}
            </p>
          )}
        </Container>
      </section>

      {page.body && (
        <article className="bg-white py-20">
          <Container className="max-w-[720px]">
            <RichText
              data={page.body}
              className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-[-0.02em] prose-a:text-brand-blue"
            />
          </Container>
        </article>
      )}
    </>
  );
}
