import Image from "next/image";
import type { ReactNode } from "react";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

type Crumb = { label: string; href?: string };

export default function AboutHero({
  crumbs,
  title,
  subtitle,
  backgroundImage = "/images/about-hero-banner.jpg",
  size = "default",
  titleVariant = "solid",
  children,
}: {
  crumbs: Crumb[];
  title: string;
  subtitle: string;
  backgroundImage?: string;
  size?: "default" | "large";
  titleVariant?: "solid" | "ghost";
  children?: ReactNode;
}) {
  const isLarge = size === "large";

  return (
    <section className="relative overflow-hidden bg-night">
      <Image
        src={backgroundImage}
        alt=""
        fill
        className="object-cover opacity-80"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/10 to-night/50" />

      <Container
        className={`relative flex flex-col py-16 ${
          isLarge ? "min-h-[560px] justify-end pb-14 lg:min-h-[680px]" : "min-h-[300px] justify-center"
        }`}
      >
        <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-on-dark/90">
          <ol className="flex items-center gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span className="opacity-50">/</span>}
                {crumb.href ? (
                  <TenantLink href={crumb.href} className="hover:text-white">
                    {crumb.label}
                  </TenantLink>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1
          className={
            titleVariant === "ghost"
              ? "max-w-4xl font-display text-[64px] font-extrabold uppercase leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_white] sm:text-[96px] lg:text-[140px]"
              : "max-w-3xl font-display text-5xl font-semibold tracking-[-0.02em] text-white sm:text-6xl lg:text-[80px]"
          }
        >
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-dark/80 sm:text-xl">
          {subtitle}
        </p>
        {children}
      </Container>
    </section>
  );
}
