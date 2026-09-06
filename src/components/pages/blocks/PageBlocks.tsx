import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import TenantLink from "@/components/layout/TenantLink";
import Section, { isDarkSection } from "@/components/sections/Section";
import HistoryTimeline from "@/components/about/HistoryTimeline";
import {
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  GiftIcon,
  GraduationIcon,
  HeartIcon,
  MonitorIcon,
  NewspaperIcon,
  PaletteIcon,
  PeopleIcon,
  PinIcon,
} from "@/components/ui/icons";
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
  NoticeData,
  TimelineData,
} from "@/lib/pageBlockTypes";

/**
 * How each authored section is drawn.
 *
 * Every one of these is a server component wrapping `<Section>`, so the
 * background, gradient, spacing, width and alignment an editor chose are
 * applied in one place and each component below only has to lay out its own
 * content. Two are interactive: the accordion, which uses <details> and so
 * ships nothing, and the timeline, which is the one block here that sends
 * JavaScript to the browser.
 */

/* ------------------------------------------------------------------ shared */

const GRID: Record<string, string> = {
  "1": "grid-cols-1",
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

/**
 * The accent colour an editor chose, or the design's own.
 *
 * The fallback is not optional. An unset custom property is the
 * guaranteed-invalid value, so `color: var(--section-accent)` on its own does
 * not fall back to the Tailwind class beside it — the declaration becomes
 * `unset`, and for an inherited property that means inherit. Written without
 * the fallback, as this was, every eyebrow on an authored section came out in
 * the body's ink and the little rule before it was fully transparent.
 *
 * So each call passes the colour its own class sets, and the two agree until
 * the variable exists.
 */
const accent = (fallback: string) => ({ color: `var(--section-accent, ${fallback})` });
const accentBackground = (fallback: string) => ({
  backgroundColor: `var(--section-accent, ${fallback})`,
});

/** A quotation with its marks, or as written if it already carries them. */
function quoted(text?: string | null) {
  const value = (text ?? "").trim();
  if (!value) return null;
  return /^["“'‘«]/.test(value) ? value : `“${value}”`;
}

/** The design's blue, and the tints the sections draw it at. */
const BLUE = "var(--color-brand-blue, #007aff)";
const INK = "var(--color-ink, #101828)";

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
    // `am-eyebrow` so a centred section centres the rule and the word together.
    // Text alignment cannot do it: this is a flex row, and `text-center` on an
    // ancestor leaves the row itself packed to the start.
    <div className="am-eyebrow mb-4 flex items-center gap-3">
      <span
        className="h-px w-7"
        style={accentBackground(dark ? "rgba(255,255,255,0.6)" : "rgba(0,122,255,0.6)")}
      />
      <span
        className="text-xs font-semibold uppercase tracking-[0.2em]"
        style={accent(dark ? "rgba(255,255,255,0.9)" : BLUE)}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * A heading with any highlighted words set in the accent blue.
 *
 * `Sustain Your Spirit with <hl>Morning QT</hl>` — the same mark the hero
 * headline uses, and for the same reason: the word being picked out sits in
 * the middle of the sentence, and a sentence translated into Korean or Arabic
 * puts it somewhere else entirely. A position could not survive that; a tag
 * travels with the word.
 *
 * Split rather than parsed as HTML. Nothing here is ever set as markup, so a
 * stray angle bracket in someone's copy stays text instead of becoming a hole.
 */
function Highlighted({ text, dark }: { text: string; dark: boolean }) {
  const parts = text.split(/<hl>|<\/hl>/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) =>
        // Odd pieces are what sat between the tags.
        index % 2 === 1 ? (
          <span
            key={index}
            style={accent(dark ? "#ffffff" : "var(--color-brand-navy-deep, #1449c6)")}
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * The sizes a section title can be set to.
 *
 * `default` is what a section added in the admin gets. The designed pages set
 * their section headings at 44px and their page titles at 45–48px, so a page
 * converted to blocks asks for `lg` — otherwise every heading on it shrinks by
 * eight pixels the day it becomes editable, which is not a conversion, it is a
 * redesign nobody asked for.
 */
const HEADING_SIZE: Record<string, string> = {
  default: "text-3xl sm:text-4xl",
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-[32px] leading-[1.15] sm:text-[44px]",
  xl: "text-[34px] leading-[1.1] sm:text-[48px]",
};

function Heading({
  eyebrow,
  heading,
  dark,
  className = "",
  size,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  dark: boolean;
  className?: string;
  size?: string | null;
}) {
  if (!eyebrow && !heading) return null;
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow dark={dark}>{eyebrow}</Eyebrow> : null}
      {heading ? (
        <h2
          className={`font-display font-semibold tracking-[-0.02em] ${
            HEADING_SIZE[size ?? "default"] ?? HEADING_SIZE.default
          } ${dark ? "text-white" : "text-ink"}`}
        >
          <Highlighted text={heading} dark={dark} />
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

  if (data.layout === "aside") {
    return (
      <Section appearance={data.appearance} defaultContainerClassName="max-w-[1116px]">
        <div className="grid gap-8 text-start lg:grid-cols-[340px_1fr] lg:gap-16">
          <div>
            <Heading
              eyebrow={data.eyebrow}
              heading={data.heading}
              dark={dark}
              size={data.appearance?.headingSize}
            />
            {/* The short rule the design puts under a side heading. It belongs
                to the heading, so it is hidden when there is none. */}
            {data.heading ? (
              <span
                aria-hidden
                className="mt-8 block h-1 w-14 rounded-full"
                style={accentBackground(dark ? "#ffffff" : BLUE)}
              />
            ) : null}
          </div>
          <div>
            <Prose data={data.body} dark={dark} className="prose-sm" />
            <Buttons buttons={data.buttons} dark={dark} />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[860px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} className="mb-8" />
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

  // How much of its half the picture takes. "Small" is what the pillars of
  // mission hold theirs to; left at full it grows by half again and the
  // column stops reading as a caption beside the text.
  const width =
    data.imageSize === "small" ? "max-w-[386px]" : data.imageSize === "medium" ? "max-w-[520px]" : "";

  const picture = url ? (
    <div className={`relative w-full overflow-hidden ${width} ${shape} ${rounded}`}>
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
          <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} className="mb-6" />
          <Prose data={data.body} dark={dark} />
          <Buttons buttons={data.buttons} dark={dark} />
        </div>
      </div>
    </Section>
  );
}

/**
 * The icons a card can carry, by the name stored on it. A card with no icon
 * name draws none, which is the usual case — this is for the pages that name
 * ways to serve rather than showing photographs of them.
 */
const CARD_ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  heart: HeartIcon,
  book: BookIcon,
  monitor: MonitorIcon,
  palette: PaletteIcon,
  people: PeopleIcon,
  pin: PinIcon,
  calendar: CalendarIcon,
  newspaper: NewspaperIcon,
  graduation: GraduationIcon,
  gift: GiftIcon,
};

export function Cards({ data }: { data: CardsData }) {
  const dark = isDarkSection(data.appearance);
  const cards = data.cards ?? [];
  // Text-only columns, each under a short rule — how the departments and the
  // pillars are drawn. The heading steps down to 16px and the copy is set
  // smaller, because a ruled column is a list item, not a card.
  const ruled = data.layout === "ruled";

  return (
    <Section appearance={data.appearance}>
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />
      {data.intro ? (
        <p
          className={`mt-4 max-w-[733px] text-base leading-relaxed ${
            dark ? "text-white/80" : "text-ink-muted"
          } ${
            // Centred inside a centred section rather than pinned left, which
            // is what the design does with this standfirst.
            "[.text-center_&]:mx-auto"
          }`}
        >
          {data.intro}
        </p>
      ) : null}

      <div
        className={`mt-12 grid gap-8 ${ruled ? "gap-x-10 gap-y-10 text-start" : ""} ${grid(data.columns)}`}
      >
        {cards.map((card, index) => {
          const url = mediaUrl(card.image);
          const Icon = card.icon ? CARD_ICONS[card.icon] : undefined;
          const body = (
            <>
              {Icon ? (
                <span
                  className={`mx-auto flex size-20 items-center justify-center rounded-full ${
                    dark ? "bg-white/10 text-white" : "bg-mist text-brand-navy-deep"
                  }`}
                >
                  <Icon className="size-9" />
                </span>
              ) : null}
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
                  className="mt-5 text-xs font-semibold uppercase tracking-[0.15em]"
                  style={accent(dark ? "rgba(255,255,255,0.7)" : BLUE)}
                >
                  {card.tag}
                </p>
              ) : null}
              <p
                className={`${card.tag ? "mt-2" : ruled ? "" : Icon ? "mt-6" : "mt-5"} font-display ${
                  ruled ? "text-base font-bold" : "text-xl font-semibold"
                } tracking-[-0.02em] ${dark ? "text-white" : "text-ink"}`}
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
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  style={accent(dark ? "#ffffff" : BLUE)}
                >
                  {card.linkLabel || "Learn more"}
                  <ArrowRightIcon />
                </span>
              ) : null}
            </>
          );

          const shell = ruled
            ? `group border-t-2 pt-6 ${dark ? "border-white/20" : "border-black/10"}`
            : "group";

          return card.href ? (
            <Anchor key={card.id ?? index} href={card.href} className={`${shell} block`}>
              {body}
            </Anchor>
          ) : (
            <div key={card.id ?? index} className={shell}>
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
  const all = data.people ?? [];
  // Whoever has a paragraph to go with them is drawn first, in a wide row.
  // A biography cannot sit in a tile at the grid's width without either
  // stretching the tile or cutting the paragraph, and the design does neither.
  const featured = all.filter((person) => person.featured);
  const people = all.filter((person) => !person.featured);

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[1104px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />

      {featured.length > 0 ? (
        <div className="mt-14 space-y-12 text-start">
          {featured.map((person, index) => (
            <div key={person.id ?? `featured-${index}`} className="flex flex-col gap-10 sm:flex-row">
              <Portrait
                image={person.photo}
                name={person.name ?? ""}
                sizes="258px"
                className="w-full shrink-0 sm:w-[258px]"
                initialsClassName="text-[34px]"
              />
              <div className="flex flex-col gap-[7px] pt-1">
                <p
                  className={`font-display text-[23px] font-extrabold leading-[24.38px] tracking-[-0.035em] ${dark ? "text-white" : "text-ink"}`}
                >
                  {person.name}
                </p>
                {person.role ? (
                  <p
                    className="text-[14.5px] font-semibold leading-6"
                    style={accent(dark ? "#ffffff" : BLUE)}
                  >
                    {person.role}
                  </p>
                ) : null}
                {person.bio ? (
                  <p
                    className={`max-w-[760px] text-[14.5px] leading-[23.9px] ${dark ? "text-white/75" : "text-ink-muted"}`}
                  >
                    {person.bio}
                  </p>
                ) : null}
                {person.email ? (
                  <a
                    href={`mailto:${person.email}`}
                    className="pt-1 text-[13px] font-semibold"
                    style={accent(dark ? "#ffffff" : BLUE)}
                  >
                    {person.email}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={`grid grid-cols-2 gap-x-6 gap-y-11 ${grid(data.columns ?? "5")} ${
          // A rule between the story and the grid when both are here, the way
          // the leadership page separates them.
          featured.length > 0
            ? `mt-16 border-t pt-14 ${dark ? "border-white/20" : "border-ink/[0.12]"}`
            : "mt-16"
        }`}
      >
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
                className="pt-2 text-[13px] font-semibold"
                style={accent(dark ? "#ffffff" : BLUE)}
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
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />
      <div
        className={`${data.eyebrow || data.heading ? "mt-12" : ""} grid gap-8 ${grid(String(Math.min(4, Math.max(2, stats.length))))}`}
      >
        {stats.map((stat, index) => (
          <div key={stat.id ?? index}>
            <p
              className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl"
              style={accent(dark ? "#ffffff" : INK)}
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

  if (data.stepsLayout === "columns") {
    return (
      <Section appearance={data.appearance} defaultContainerClassName="max-w-[1200px]">
        <Heading
          eyebrow={data.eyebrow}
          heading={data.heading}
          dark={dark}
          size={data.appearance?.headingSize}
          className="[&>div]:justify-center"
        />

        <div className="mt-16 grid gap-x-6 gap-y-12 text-start sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.id ?? index}
              className={`relative border-t-2 pt-6 ${dark ? "border-white/20" : "border-[rgba(16,24,40,0.12)]"}`}
            >
              {/* Big, pale, and overlapping the rule — furniture rather than a
                  label, so it is hidden from assistive tech and the title
                  carries the meaning. */}
              <span
                aria-hidden
                className={`pointer-events-none absolute end-0 -top-1 select-none font-display text-[72px] font-normal leading-none lg:text-[92px] ${
                  dark ? "text-white/20" : "text-[#bfbfbf]"
                }`}
              >
                {index + 1}
              </span>

              <h3
                className={`relative max-w-[65%] font-display text-[19px] font-bold leading-[1.15] ${dark ? "text-white" : "text-ink"}`}
              >
                {step.title}
              </h3>

              {step.description ? (
                <p
                  className={`relative mt-4 text-[15px] leading-[21px] ${dark ? "text-white/75" : "text-ink-muted"}`}
                >
                  {step.description}
                </p>
              ) : null}

              {step.href ? (
                <Anchor
                  href={step.href}
                  className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy"
                >
                  Click here
                  <ArrowRightIcon />
                </Anchor>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[1104px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />

      <div className={`mt-10 divide-y px-6 ${dark ? "divide-white/15" : "divide-black/10"}`}>
        {steps.map((step, index) => {
          const row = (
            <div className="flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-baseline gap-4 sm:w-[304px] sm:shrink-0">
                <span
                  className="font-display text-sm font-extrabold"
                  style={accent(dark ? "rgba(255,255,255,0.7)" : BLUE)}
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

/**
 * Milestones on a filling rail — the same component the history page draws,
 * so a country writing its own history gets the design rather than a list.
 *
 * It is the one block here that ships JavaScript: one entry is open at a time
 * and the rail fills to it, which is a choice the reader makes.
 */
export function Timeline({ data }: { data: TimelineData }) {
  const dark = isDarkSection(data.appearance);
  const milestones = (data.milestones ?? [])
    .filter((row) => row?.title)
    .map((row) => ({
      tag: row.tag ?? "",
      title: row.title ?? "",
      description: row.description ?? "",
    }));
  if (milestones.length === 0) return null;

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[720px]">
      <Heading
        eyebrow={data.eyebrow}
        heading={data.heading}
        dark={dark}
        size={data.appearance?.headingSize}
      />
      {/* The heading follows the section's alignment; the milestones do not.
          A centred section is asking for its title to be centred — a dated
          entry read down a rail is still a list, and centring its lines makes
          the dates stop lining up with each other. */}
      <div className={`text-start ${data.eyebrow || data.heading ? "mt-16" : ""}`}>
        <HistoryTimeline milestones={milestones} />
      </div>
    </Section>
  );
}

/**
 * A short thing the reader has to notice: a deadline, a condition, a caveat.
 *
 * A rule down the leading side and a tinted ground, which is what the chapter
 * affiliation page's September deadline is drawn as. Deliberately not a
 * section-wide band — a notice is a paragraph the page interrupts itself with,
 * and giving it the whole width would make it read as the page's subject.
 */
const NOTICE_TONES: Record<string, { rule: string; ground: string; mark: string }> = {
  warning: { rule: "#f0a90a", ground: "#fdf6e7", mark: "!" },
  info: { rule: "#2a5eec", ground: "#eef3fe", mark: "i" },
  success: { rule: "#1f9d55", ground: "#eaf7f0", mark: "✓" },
};

export function Notice({ data }: { data: NoticeData }) {
  const tone = NOTICE_TONES[data.tone ?? "warning"] ?? NOTICE_TONES.warning;

  return (
    <Section
      appearance={data.appearance}
      defaultClassName="bg-white pb-20"
      styledClassName="pb-20"
      defaultContainerClassName="max-w-[1100px]"
    >
      <div
        className="flex gap-3 rounded-lg border-s-4 px-5 py-4 text-start"
        style={{ borderColor: tone.rule, backgroundColor: tone.ground }}
      >
        <span
          aria-hidden
          className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: tone.rule }}
        >
          {tone.mark}
        </span>
        {/* Always the light theme's ink: the ground is a pale tint whatever the
            section around it is set to, so following the section here would put
            white text on cream. */}
        <div className="[&_p]:m-0 [&_p+p]:mt-3">
          <Prose data={data.body} dark={false} className="text-sm leading-relaxed" />
        </div>
      </div>
    </Section>
  );
}

export function Accordion({ data }: { data: AccordionData }) {
  const dark = isDarkSection(data.appearance);
  const items = data.items ?? [];

  return (
    <Section appearance={data.appearance} defaultContainerClassName="max-w-[860px]">
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />

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

  // The shorter shape the About, Mission statement, Statement of faith and
  // Membership designs set a verse in: a blue rule down the leading side, the
  // display face at 22px, and no quotation marks added — the verse arrives
  // with its own. Deeper blue than the brand navy token, flat across the four
  // pages rather than a responsive step, the same as the coded component this
  // replaces.
  if (data.style === "rule") {
    return (
      <Section appearance={data.appearance} defaultContainerClassName="max-w-[720px]">
        <blockquote
          className={`border-s-[3px] py-2 ps-6 font-display text-xl font-semibold leading-[1.35] sm:text-[22px] ${
            dark ? "border-white/70 text-white" : "border-[#1449c6] text-ink"
          }`}
        >
          {data.quote}
        </blockquote>
        {data.attribution ? (
          <p className={`mt-3 ps-6 text-sm ${dark ? "text-white/70" : "text-ink-muted"}`}>
            {data.attribution}
            {data.role ? `, ${data.role}` : ""}
          </p>
        ) : null}
      </Section>
    );
  }

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
            {/* Quotation marks are added, unless the line already has its own.
                Scripture usually arrives quoted — and quoted inside that — so
                adding a second pair around it gives `"John 20:21 says, "Again
                Jesus said, '…'" (NIV)"`, with a stray mark at each end. */}
            {quoted(data.quote)}
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
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />
      <div className={`mt-12 grid gap-6 ${grid(data.columns)}`}>
        {images.map((row, index) => (
          <figure key={row.id ?? index}>
            <div
              className={`relative w-full overflow-hidden rounded-2xl ${
                IMAGE_SHAPE[data.imageShape ?? "landscape"] ?? IMAGE_SHAPE.landscape
              }`}
            >
              {/* A shape of "its own" has no aspect box to fill, so the
                  picture is laid out at its real proportions instead — a wide
                  banner keeps its ends rather than being cropped to 4:3. */}
              <Image
                src={mediaUrl(row.image)!}
                alt={row.caption ?? ""}
                {...(data.imageShape === "natural"
                  ? { width: 1600, height: 900, className: "h-auto w-full" }
                  : { fill: true, className: "object-cover" })}
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
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} className="[&>div]:justify-center" />
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
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} className="mb-8" />
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
      <Heading eyebrow={data.eyebrow} heading={data.heading} dark={dark} size={data.appearance?.headingSize} />
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
