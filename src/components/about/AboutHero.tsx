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
  titleCase = "upper",
  align = "left",
  children,
}: {
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  size?: "default" | "large";
  titleVariant?: "solid" | "ghost";
  /**
   * Casing of a ghost title. The Who-we-are design sets its hero in sentence
   * case at Archivo Black 96px; the other ghost heroes are upper-cased, so
   * that stays the default until their own designs say otherwise.
   */
  titleCase?: "upper" | "sentence";
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const isLarge = size === "large";
  const isCentered = align === "center";
  const isSentenceGhost = titleVariant === "ghost" && titleCase === "sentence";

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
          className={[
            titleVariant === "ghost"
              ? [
                  "font-display leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:2px_white]",
                  isSentenceGhost
                    ? // Archivo Black 96px, sentence case. The design breaks
                      // the line after "As the Father", which no width can
                      // reproduce — its second line is the wider of the two —
                      // so the break travels in the message as a newline and
                      // `pre-line` renders it. A translation that omits the
                      // newline just wraps on width, which is what the other
                      // 47 locales want anyway.
                      "whitespace-pre-line text-[40px] font-black sm:text-[64px] lg:text-[96px]"
                    : "text-[44px] font-extrabold uppercase sm:text-[72px] lg:text-[104px]",
                ].join(" ")
              : "font-display text-5xl font-semibold tracking-[-0.02em] text-white sm:text-6xl lg:text-[80px]",
            isCentered
              ? `mx-auto text-center ${isSentenceGhost ? "max-w-[1075px]" : "max-w-5xl"}`
              : "max-w-4xl",
          ].join(" ")}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-6 text-lg leading-relaxed text-on-dark/80 sm:text-xl ${
              isCentered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"
            }`}
          >
            {subtitle}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
