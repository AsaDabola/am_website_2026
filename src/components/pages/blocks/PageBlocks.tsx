import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import TenantLink from "@/components/layout/TenantLink";
import Section, { isDarkSection } from "@/components/sections/Section";
import { ArrowRightIcon } from "@/components/ui/icons";
import { mediaUrl } from "@/lib/homeBlockTypes";
import { embedUrl } from "@/lib/pageBlockTypes";
import type {
  AccordionData,
  BannerData,
  ButtonData,
  CardsData,
  CtaData,
  EmbedData,
  GalleryData,
  ImageTextData,
  LogosData,
  MediaRef,
  PeopleData,
  ProseData,
  QuoteData,
  SpacerData,
  StatsData,
  StepsData,
} from "@/lib/pageBlockTypes";

/**
 * How each authored section is drawn.
 *
 * Every one of these is a server component wrapping `<Section>`, so the
 * background, gradient, spacing, width and alignment an editor chose are
 * applied in one place and each component below only has to lay out its own
 * content. The accordion is the only interactive one and uses <details>, so
 * none of this ships JavaScript.
 */

/* ------------------------------------------------------------------ shared */

const GRID: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
  "5": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

function grid(columns?: string | null) {
  return GRID[columns ?? "3"] ?? GRID["3"];
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:|#)/i.test(href);
}

/** A link that keeps the country prefix on internal addresses and not on others. */
function Anchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <TenantLink href={href} className={className}>
      {children}
    </TenantLink>
  );
}

/**
 * The section's small heading. Not the shared `<Eyebrow>` component, because
 * that one takes a fixed tone and this has to follow both the section's text
 * theme and the accent colour an editor may have set.
 */
function Eyebrow({ children, dark }: { children: string; dark: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`h-px w-7 ${dark ? "bg-white/60" : "bg-brand-blue/60"}`}
        style={{ backgroundColor: "var(--section-accent)" }}
      />
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/90" : "text-brand-blue"}`}
        style={{ color: "var(--section-accent)" }}
      >
        {children}
      </span>
    </div>
  );
}

function Heading({
  eyebrow,
  heading,
  dark,
  className = "",
}: {
  eyebrow?: string | null;
  heading?: string | null;
  dark: boolean;
  className?: string;
}) {
  if (!eyebrow && !heading) return null;
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow dark={dark}>{eyebrow}</Eyebrow> : null}
      {heading ? (
        <h2
          className={`font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl ${dark ? "text-white" : "text-ink"}`}
        >
          {heading}
        </h2>
      ) : null}
    </div>
  );
}

function Buttons({ buttons, dark }: { buttons?: ButtonData[] | null; dark: boolean }) {
  const rows = (buttons ?? []).filter((b) => b?.label && b?.href);
  if (rows.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {rows.map((button, index) => {
        const style = button.style ?? "primary";
        const className =
          style === "primary"
            ? `inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                dark ? "bg-white text-ink hover:bg-white/90" : "bg-brand-blue text-white hover:bg-brand-navy"
              }`
            : style === "secondary"
              ? `inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${
                  dark
                    ? "border-white/50 text-white hover:bg-white/10"
                    : "border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5"
                }`
              : `inline-flex items-center gap-2 text-sm font-semibold ${
                  dark ? "text-white/90 hover:text-white" : "text-brand-blue hover:text-brand-navy"
                }`;

        return (
          <Anchor key={button.id ?? index} href={button.href!} className={className}>
            {button.label}
            <ArrowRightIcon />
          </Anchor>
        );
      })}
    </div>
  );
}

/** Payload's rich text, set in the site's prose styles and following the theme. */
function Prose({ data, dark, className = "" }: { data: unknown; dark: boolean; className?: string }) {
  if (!data) return null;
  return (
    <RichText
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data={data as any}
      className={`prose max-w-none prose-headings:font-display prose-headings:tracking-[-0.02em] ${
        dark
          ? "prose-invert prose-a:text-white prose-headings:text-white"
          : "prose-slate prose-a:text-brand-blue"
      } ${className}`}
    />
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * The same portrait tile the leadership page draws: square, 8px corners, and
 * the person's initials over the design's pale blue gradient when there is no
 * photograph. Shared so a People block matches the coded page beside it.
 */
function Portrait({
  image,
  name,
  sizes,
  className = "",
  initialsClassName = "text-2xl",
}: {
  image?: MediaRef;
  name: string;
  sizes: string;
  className?: string;
  initialsClassName?: string;
}) {
  const url = mediaUrl(image);
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[8px] ${className}`}
      style={{ backgroundImage: "linear-gradient(127deg, #e5edf6 0%, #cddbee 71%)" }}
    >
      {url ? (
        <Image src={url} alt={name} fill className="object-cover" sizes={sizes} />
      ) : (
        <span
          className={`flex size-full items-center justify-center font-display font-extrabold text-[#93a7be] ${initialsClassName}`}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ blocks */

const BANNER_HEIGHT: Record<string, string> = {
  sm: "py-16",
  md: "py-24",
  lg: "py-32",
  full: "min-h-[70vh] flex items-center py-24",
};

export function Banner({ data }: { data: BannerData }) {
  // A banner is the top of a page, so it defaults to the dark treatment the
  // designed heroes use rather than to a white band.
  const dark = isDarkSection(
    data.appearance?.background && data.appearance.background !== "default"
      ? data.appearance
      : { ...data.appearance, background: "night" },
  );

  return (
    <Section
      appearance={data.appearance}
      defaultClassName={`bg-night text-white ${BANNER_HEIGHT[data.height ?? "md"]}`}
      styledClassName={BANNER_HEIGHT[data.height ?? "md"]}
    >
      {data.eyebrow ? <Eyebrow dark={dark}>{data.eyebrow}</Eyebrow> : null}
      {data.heading ? (
        <h1
          className={`max-w-[820px] font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${dark ? "text-white" : "text-ink"}`}
        >
          {data.heading}
        </h1>
      ) : null}
      {data.subheading ? (
        <p
          className={`mt-6 max-w-[640px] text-lg leading-relaxed ${dark ? "text-white/80" : "text-ink-muted"}`}
        >
          {data.subheading}
        </p>
      ) : null}
      <Buttons buttons={data.buttons} dark={dark} />
    </Section>
  );
}

export function ProseSection({ data }: { data: ProseData }) {
  const dark = isDarkSection(data.appearance);
  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[860px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} className="mb-8" />
      <Prose data={data.body} dark={dark} />
      <Buttons buttons={data.buttons} dark={dark} />
    </Section>
  );
}

const IMAGE_SHAPE: Record<string, string> = {
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  natural: "",
};

export function ImageText({ data }: { data: ImageTextData }) {
  const dark = isDarkSection(data.appearance);
  const url = mediaUrl(data.image);
  const shape = IMAGE_SHAPE[data.imageShape ?? "landscape"] ?? IMAGE_SHAPE.landscape;
  const rounded = data.imageRounded === false ? "" : "rounded-2xl";

  const picture = url ? (
    <div className={`relative w-full overflow-hidden ${shape} ${rounded}`}>
      <Image
        src={url}
        alt=""
        {...(shape ? { fill: true, className: "object-cover" } : { width: 1200, height: 800, className: "h-auto w-full" })}
        sizes="(min-width: 1024px) 560px, 100vw"
      />
    </div>
  ) : null;

  return (
    <Section appearance={data.appearance}>
      <div
        className={`grid items-center gap-12 lg:grid-cols-2 ${
          data.imageSide === "left" ? "" : "lg:[&>*:first-child]:order-2"
        }`}
      >
        {picture}
        <div>
          <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} className="mb-6" />
          <Prose data={data.body} dark={dark} />
          <Buttons buttons={data.buttons} dark={dark} />
        </div>
      </div>
    </Section>
  );
}

export function Cards({ data }: { data: CardsData }) {
  const dark = isDarkSection(data.appearance);
  const cards = data.cards ?? [];

  return (
    <Section appearance={data.appearance}>
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />
      {data.intro ? (
        <p className={`mt-4 max-w-[720px] text-base leading-relaxed ${dark ? "text-white/80" : "text-ink-muted"}`}>
          {data.intro}
        </p>
      ) : null}

      <div className={`mt-12 grid gap-8 ${grid(data.columns)}`}>
        {cards.map((card, index) => {
          const url = mediaUrl(card.image);
          const body = (
            <>
              {url ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                  />
                </div>
              ) : null}
              {card.tag ? (
                <p
                  className={`mt-5 text-xs font-semibold uppercase tracking-[0.15em] ${dark ? "text-white/70" : "text-brand-blue"}`}
                  style={{ color: "var(--section-accent)" }}
                >
                  {card.tag}
                </p>
              ) : null}
              <p
                className={`${card.tag ? "mt-2" : "mt-5"} font-display text-xl font-semibold tracking-[-0.02em] ${dark ? "text-white" : "text-ink"}`}
              >
                {card.title}
              </p>
              {card.description ? (
                <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-white/75" : "text-ink-muted"}`}>
                  {card.description}
                </p>
              ) : null}
              {card.href ? (
                <span
                  className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${dark ? "text-white" : "text-brand-blue"}`}
                  style={{ color: "var(--section-accent)" }}
                >
                  {card.linkLabel || "Learn more"}
                  <ArrowRightIcon />
                </span>
              ) : null}
            </>
          );

          return card.href ? (
            <Anchor key={card.id ?? index} href={card.href} className="group block">
              {body}
            </Anchor>
          ) : (
            <div key={card.id ?? index} className="group">
              {body}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function People({ data }: { data: PeopleData }) {
  const dark = isDarkSection(data.appearance);
  const people = data.people ?? [];

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[1104px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />

      <div className={`mt-16 grid grid-cols-2 gap-x-6 gap-y-11 ${grid(data.columns ?? "5")}`}>
        {people.map((person, index) => (
          <div
            key={person.id ?? index}
            className={`flex flex-col text-center ${person.startsRow ? "lg:col-start-1" : ""}`}
          >
            <Portrait
              image={person.photo}
              name={person.name ?? ""}
              sizes="(min-width: 1024px) 202px, (min-width: 640px) 30vw, 45vw"
            />
            <p
              className={`pt-4 font-display text-base font-extrabold leading-5 tracking-[-0.025em] ${dark ? "text-white" : "text-ink"}`}
            >
              {person.name}
            </p>
            {person.role ? (
              <p className={`pt-[5px] text-sm leading-5 ${dark ? "text-white/75" : "text-ink-muted"}`}>
                {person.role}
              </p>
            ) : null}
            {person.bio ? (
              <p className={`pt-2 text-[13px] leading-5 ${dark ? "text-white/65" : "text-ink-muted"}`}>
                {person.bio}
              </p>
            ) : null}
            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className={`pt-2 text-[13px] font-semibold ${dark ? "text-white" : "text-brand-blue"}`}
                style={{ color: "var(--section-accent)" }}
              >
                {person.email}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Stats({ data }: { data: StatsData }) {
  const dark = isDarkSection(data.appearance);
  const stats = data.stats ?? [];

  return (
    <Section appearance={data.appearance}>
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />
      <div
        className={`${data.eyebrow || data.heading ? "mt-12" : ""} grid gap-8 ${grid(String(Math.min(4, Math.max(2, stats.length))))}`}
      >
        {stats.map((stat, index) => (
          <div key={stat.id ?? index}>
            <p
              className={`font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl ${dark ? "text-white" : "text-ink"}`}
              style={{ color: "var(--section-accent)" }}
            >
              {stat.value}
            </p>
            <p className={`mt-2 text-sm ${dark ? "text-white/75" : "text-ink-muted"}`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Steps({ data }: { data: StepsData }) {
  const dark = isDarkSection(data.appearance);
  const steps = data.steps ?? [];

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[1104px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />

      <div className={`mt-10 divide-y px-6 ${dark ? "divide-white/15" : "divide-black/10"}`}>
        {steps.map((step, index) => {
          const row = (
            <div className="flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-baseline gap-4 sm:w-[304px] sm:shrink-0">
                <span
                  className={`font-display text-sm font-extrabold ${dark ? "text-white/70" : "text-brand-blue"}`}
                  style={{ color: "var(--section-accent)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p
                  className={`font-display text-xl font-extrabold tracking-[-0.02em] ${dark ? "text-white" : "text-ink"}`}
                >
                  {step.title}
                </p>
              </div>
              {step.description ? (
                <p className={`flex-1 text-sm leading-relaxed ${dark ? "text-white/75" : "text-ink-muted"}`}>
                  {step.description}
                </p>
              ) : (
                <span className="flex-1" />
              )}
              <span
                className={`hidden size-[42px] shrink-0 items-center justify-center rounded-full border sm:flex ${
                  dark ? "border-white/25 text-white" : "border-black/10 text-ink"
                }`}
              >
                <ArrowRightIcon />
              </span>
            </div>
          );

          return step.href ? (
            <Anchor key={step.id ?? index} href={step.href} className="block">
              {row}
            </Anchor>
          ) : (
            <div key={step.id ?? index}>{row}</div>
          );
        })}
      </div>
    </Section>
  );
}

export function Accordion({ data }: { data: AccordionData }) {
  const dark = isDarkSection(data.appearance);
  const items = data.items ?? [];

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[860px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />

      {/* <details> rather than a click handler, so this section works with no
          JavaScript, is open to search engines and to find-in-page, and adds
          nothing to the bundle. */}
      <div className={`mt-10 divide-y border-y ${dark ? "divide-white/15 border-white/15" : "divide-black/10 border-black/10"}`}>
        {items.map((item, index) => (
          <details key={item.id ?? index} className="group py-5">
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold tracking-[-0.01em] ${dark ? "text-white" : "text-ink"}`}
            >
              {item.question}
              <span
                aria-hidden
                className={`shrink-0 text-2xl leading-none transition group-open:rotate-45 ${dark ? "text-white/60" : "text-ink-muted"}`}
              >
                +
              </span>
            </summary>
            <div className="pt-4">
              <Prose data={item.answer} dark={dark} className="prose-sm" />
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function Quote({ data }: { data: QuoteData }) {
  const dark = isDarkSection(data.appearance);
  const url = mediaUrl(data.image);

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[900px]">
      <figure className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
        {url ? (
          <div className="relative size-[120px] shrink-0 overflow-hidden rounded-full">
            <Image src={url} alt={data.attribution ?? ""} fill className="object-cover" sizes="120px" />
          </div>
        ) : null}
        <div>
          <blockquote
            className={`font-quote text-2xl italic leading-snug sm:text-[28px] ${dark ? "text-white" : "text-ink"}`}
          >
            &ldquo;{data.quote}&rdquo;
          </blockquote>
          {data.attribution ? (
            <figcaption className="mt-5">
              <span className={`block font-display font-extrabold ${dark ? "text-white" : "text-ink"}`}>
                {data.attribution}
              </span>
              {data.role ? (
                <span className={`block text-sm ${dark ? "text-white/70" : "text-ink-muted"}`}>{data.role}</span>
              ) : null}
            </figcaption>
          ) : null}
        </div>
      </figure>
    </Section>
  );
}

export function Gallery({ data }: { data: GalleryData }) {
  const dark = isDarkSection(data.appearance);
  const images = (data.images ?? []).filter((row) => mediaUrl(row.image));

  return (
    <Section appearance={data.appearance}>
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />
      <div className={`mt-12 grid gap-6 ${grid(data.columns)}`}>
        {images.map((row, index) => (
          <figure key={row.id ?? index}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src={mediaUrl(row.image)!}
                alt={row.caption ?? ""}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
              />
            </div>
            {row.caption ? (
              <figcaption className={`mt-3 text-sm ${dark ? "text-white/70" : "text-ink-muted"}`}>
                {row.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function Cta({ data }: { data: CtaData }) {
  const dark = isDarkSection(data.appearance);
  return (
    <Section
      appearance={data.appearance}
      defaultClassName="bg-mist py-20"
      defaultContainerClassName="max-w-[860px]"
      containerClassName="text-center"
    >
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} className="[&>div]:justify-center" />
      {data.description ? (
        <p className={`mx-auto mt-5 max-w-[620px] text-base leading-relaxed ${dark ? "text-white/80" : "text-ink-muted"}`}>
          {data.description}
        </p>
      ) : null}
      <div className="flex justify-center">
        <Buttons buttons={data.buttons} dark={dark} />
      </div>
    </Section>
  );
}

const RATIO: Record<string, string> = {
  "16-9": "aspect-video",
  "1-1": "aspect-square",
  "9-16": "aspect-[9/16]",
  "21-9": "aspect-[21/9]",
};

export function Embed({ data }: { data: EmbedData }) {
  const dark = isDarkSection(data.appearance);
  const url = embedUrl(data.url);
  // An address that could not be parsed, or is not http(s), draws nothing
  // rather than an empty frame or — worse — a `javascript:` src.
  if (!url) return null;

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[960px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} className="mb-8" />
      <div className={`w-full overflow-hidden rounded-2xl bg-black ${RATIO[data.ratio ?? "16-9"]}`}>
        <iframe
          src={url}
          title={data.heading ?? data.caption ?? "Embedded content"}
          className="size-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {data.caption ? (
        <p className={`mt-3 text-sm ${dark ? "text-white/70" : "text-ink-muted"}`}>{data.caption}</p>
      ) : null}
    </Section>
  );
}

export function Logos({ data }: { data: LogosData }) {
  const dark = isDarkSection(data.appearance);
  const logos = (data.logos ?? []).filter((row) => mediaUrl(row.image));

  return (
    <Section appearance={data.appearance} defaultClassName="bg-white py-16" styledClassName="py-16">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} />
      <div className={`${data.eyebrow || data.heading ? "mt-10" : ""} flex flex-wrap items-center justify-center gap-x-12 gap-y-8`}>
        {logos.map((row, index) => {
          const mark = (
            <Image
              src={mediaUrl(row.image)!}
              alt={row.name ?? ""}
              width={160}
              height={56}
              className="h-10 w-auto object-contain opacity-70 transition hover:opacity-100"
            />
          );
          return row.href ? (
            <Anchor key={row.id ?? index} href={row.href}>
              {mark}
            </Anchor>
          ) : (
            <span key={row.id ?? index}>{mark}</span>
          );
        })}
      </div>
    </Section>
  );
}

const SPACER_HEIGHT: Record<string, string> = {
  sm: "h-8",
  md: "h-16",
  lg: "h-24",
  xl: "h-32",
};

export function Spacer({ data }: { data: SpacerData }) {
  if (data.appearance?.hidden) return null;
  return (
    <Section appearance={data.appearance} defaultClassName="bg-white py-0" styledClassName="py-0">
      <div className={`flex items-center ${SPACER_HEIGHT[data.height ?? "md"]}`}>
        {data.rule ? <span className="h-px w-full bg-current opacity-10" /> : null}
      </div>
    </Section>
  );
}
