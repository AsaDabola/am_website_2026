import Image from "next/image";
import type { ReactNode } from "react";
import TenantLink from "@/components/layout/TenantLink";
import Container from "@/components/ui/Container";

type Crumb = { label: string; href?: string };

export default function AboutHero({
  crumbs = [],
  title,
  subtitle,
  backgroundImage = "/images/about-hero-banner.jpg",
  size = "default",
  titleVariant = "solid",
  titleCase = "upper",
  align = "left",
  children,
}: {
  /**
   * Omit on a hero whose photograph is pale at the top. This text is white,
   * and the Who-we-are sunrise leaves it unreadable — which is why that
   * design carries no breadcrumb and lets the section tabs sitting above the
   * hero do the wayfinding instead.
   */
  crumbs?: Crumb[];
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  /**
   * "tall" is the Who-we-are hero at the height its design draws it (node
   * 602:2637, 964px on a 1920 canvas) — enough of the photograph to read as a
   * vista rather than a band. The four other pages on "large" have no design
   * of their own checked yet, so they keep the height they had.
   */
  size?: "default" | "large" | "tall";
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
  const isLarge = size === "large" || size === "tall";
  const isTall = size === "tall";
  const isCentered = align === "center";
  const isSentenceGhost = titleVariant === "ghost" && titleCase === "sentence";

  return (
    <section className="relative overflow-hidden bg-night">
      {/* The photograph carries these pages, so it runs at full strength: the
          designs stack it straight onto the night background with only a light
          wash over the top. Dimming the image to 80% and then laying a
          night/10→night/50 gradient on it was doing the darkening twice, which
          is what drained the colour out of the sunrise shots. */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            // Two faint blue tints, top-right then bottom-left, then the wash.
            "radial-gradient(60% 45% at 80% 0%, rgba(77,141,246,0.16) 0%, rgba(77,141,246,0) 58%)",
            "radial-gradient(52% 34% at 0% 100%, rgba(20,73,198,0.10) 0%, rgba(20,73,198,0) 60%)",
            // The design's wash is 0.10 → 0.20, calibrated against the photo
            // it was drawn over. The Who-we-are hero uses that exact photo, so
            // it gets the exact wash; the shorter heroes are running stand-in
            // images that are brighter than the ones in the design, and at
            // 0.20 their white subtitle stops being readable. Those keep the
            // full-strength image and take a deeper wash instead.
            isTall
              ? "linear-gradient(180deg, rgba(5,7,13,0.10) 0%, rgba(8,14,27,0.20) 100%)"
              : "linear-gradient(180deg, rgba(5,7,13,0.28) 0%, rgba(8,14,27,0.52) 100%)",
          ].join(", "),
        }}
      />

      <Container
        className={`relative flex flex-col py-16 ${
          isTall
            ? // Title group sits at the bottom over the rock, leaving the
              // sky clear. `justify-between` only once there is a breadcrumb
              // to push to the top — with a single child it would pull the
              // title up there instead.
              `min-h-[600px] pb-14 lg:min-h-[964px] lg:pb-16 ${
                crumbs.length > 0 ? "justify-between" : "justify-end"
              }`
            : isLarge
              ? "min-h-[560px] justify-end pb-14 lg:min-h-[680px]"
              : "min-h-[300px] justify-center"
        }`}
      >
        {crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-[13px] text-on-dark/90"
          >
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
        )}

        <div>
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
              className={`mt-6 text-lg leading-[1.6] text-on-dark/[0.68] sm:text-[21px] ${
                isCentered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"
              }`}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </Container>
    </section>
  );
}
