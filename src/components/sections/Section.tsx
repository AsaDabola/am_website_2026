import type { CSSProperties, ReactNode } from "react";
import Container from "@/components/ui/Container";
import {
  BACKGROUND_PRESETS,
  DARK_BACKGROUNDS,
  type Appearance,
} from "@/collections/blocks/appearance";
import { mediaUrl } from "@/lib/homeBlockTypes";

/**
 * One authored section, drawn with whatever look was chosen for it.
 *
 * Every block in the page library renders through here, which is what makes
 * background colours, gradients, photographs, spacing, width and alignment
 * editable everywhere at once instead of block by block. A block with no
 * appearance set — the usual case — comes out exactly as the design draws it,
 * because every control defaults to "as designed" and produces no style.
 *
 * Colours are written as inline styles rather than Tailwind classes on
 * purpose: an editor can type any hex value, and Tailwind only compiles the
 * classes that appear in the source, so a generated class name would produce
 * no rule at all. (That mistake has already been made once here, on the hero
 * gradient.)
 */

const PADDING: Record<string, string> = {
  none: "0px",
  sm: "2rem",
  md: "4rem",
  lg: "5rem",
  xl: "7rem",
};

const WIDTH: Record<string, string> = {
  // The site's own reading measure — what the news article body and the
  // statement of faith are already set at, so a converted page keeps its line
  // length rather than gaining forty pixels of it.
  narrow: "max-w-[720px]",
  wide: "max-w-[1360px]",
  full: "max-w-none px-0 lg:px-0",
};

const OBJECT_POSITION: Record<string, string> = {
  center: "center",
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};

/** A colour an editor typed, or nothing. Empty strings must not become `#`. */
function colour(value: string | null | undefined, fallback?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  // A bare hex without its hash is the commonest way to get this wrong, and
  // the browser silently ignores it. Six or three hex digits, so a colour name
  // like "papayawhip" is left alone.
  return /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(trimmed) ? `#${trimmed}` : trimmed;
}

/**
 * How light a colour is, 0 to 1, or null for anything not written as a hex.
 *
 * Only hex values are measured. A CSS colour name or a `var(--…)` cannot be
 * resolved on the server, and guessing would be worse than falling back to the
 * background's own kind — which is what the caller does with a null.
 */
function lightness(value: string | null | undefined): number | null {
  const trimmed = value?.trim().replace(/^#/, "");
  if (!trimmed || !/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(trimmed)) return null;

  const full =
    trimmed.length === 3
      ? [...trimmed].map((character) => character + character).join("")
      : trimmed;
  const [r, g, b] = [0, 2, 4].map((at) => parseInt(full.slice(at, at + 2), 16) / 255);
  // Rec. 709 luma. Good enough for "does white or black read on this", which
  // is the only question being asked.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * True when this section's text has to be light.
 *
 * A named ground answers this by name. A colour or a gradient an editor typed
 * has to be measured — otherwise "a colour I choose" set to near-black gets
 * the design's dark text on it and the section is unreadable, which is what
 * happened the first time this was tried.
 */
export function isDarkSection(appearance?: Appearance | null): boolean {
  const theme = appearance?.textTheme;
  if (theme === "light") return true;
  if (theme === "dark") return false;

  const kind = appearance?.background ?? "default";

  if (kind === "colour") {
    const measured = lightness(appearance?.backgroundColour);
    return measured === null ? false : measured < 0.5;
  }

  if (kind === "gradient") {
    // Both ends, because text crosses the whole band. Either end being dark is
    // enough to want light text; a gradient with no colours set defaults to
    // the site's own dark blues, so an unset gradient is dark too.
    const ends = [lightness(appearance?.gradientFrom), lightness(appearance?.gradientTo)].filter(
      (value): value is number => value !== null,
    );
    return ends.length === 0 || ends.some((value) => value < 0.55);
  }

  return DARK_BACKGROUNDS.has(kind);
}

/**
 * The background as a style object, plus whether a photograph needs drawing
 * behind it. Split out so a block that draws its own foreground layer (a hero
 * with a slideshow, say) can reuse the decision.
 */
function backgroundStyle(appearance?: Appearance | null): CSSProperties {
  const kind = appearance?.background ?? "default";
  if (!kind || kind === "default" || kind === "image") return {};

  if (kind === "colour") {
    const value = colour(appearance?.backgroundColour);
    return value ? { backgroundColor: value } : {};
  }

  if (kind === "gradient") {
    const from = colour(appearance?.gradientFrom, "var(--color-night, #050a2e)");
    const to = colour(appearance?.gradientTo, "var(--color-brand-navy, #2a5eec)");
    const angle = typeof appearance?.gradientAngle === "number" ? appearance.gradientAngle : 135;
    return { backgroundImage: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` };
  }

  const preset = BACKGROUND_PRESETS[kind as keyof typeof BACKGROUND_PRESETS];
  return preset ? { backgroundColor: preset } : {};
}

export default function Section({
  appearance,
  children,
  className = "",
  containerClassName = "",
  /**
   * What the section looks like when nothing has been chosen — supplied by
   * each block so "as designed" means that block's own design rather than a
   * bare white band.
   */
  defaultClassName = "bg-white py-20",
  /**
   * The vertical rhythm to keep once a background *has* been chosen, when the
   * block's own `bg-*` default no longer applies. Separate from
   * `defaultClassName` because two `py-*` utilities on one element is a
   * coin toss over which the stylesheet defines last.
   */
  styledClassName = "py-20",
  defaultContainerClassName = "",
}: {
  appearance?: Appearance | null;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  defaultClassName?: string;
  styledClassName?: string;
  defaultContainerClassName?: string;
}) {
  if (appearance?.hidden) return null;

  const kind = appearance?.background ?? "default";
  const styled = kind !== "default";
  const dark = isDarkSection(appearance);

  const style: CSSProperties = { ...backgroundStyle(appearance) };
  const top = appearance?.paddingTop;
  const bottom = appearance?.paddingBottom;
  if (top && top !== "default") style.paddingTop = PADDING[top];
  if (bottom && bottom !== "default") style.paddingBottom = PADDING[bottom];
  if (appearance?.accentColour) {
    // Read by the blocks below through var(--section-accent), so one field
    // recolours the eyebrow, the links and the buttons together.
    (style as Record<string, string>)["--section-accent"] =
      colour(appearance.accentColour) ?? "";
  }

  const photo = kind === "image" ? mediaUrl(appearance?.backgroundImage) : undefined;
  const overlay =
    typeof appearance?.overlay === "number" ? Math.min(100, Math.max(0, appearance.overlay)) : 45;

  const width = appearance?.width && appearance.width !== "default" ? WIDTH[appearance.width] : "";
  const align =
    appearance?.align === "center" ? "text-center" : appearance?.align === "left" ? "text-left" : "";

  return (
    <section
      id={appearance?.anchor?.trim() || undefined}
      // The default look only applies while nothing overrides it; once a
      // ground is chosen the design's own `bg-*` would win over the inline
      // background and the choice would appear to do nothing.
      className={[
        "relative",
        styled ? styledClassName : defaultClassName,
        dark ? "text-white" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {photo && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${photo})`,
              backgroundPosition: OBJECT_POSITION[appearance?.focalPoint ?? "center"] ?? "center",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundColor: colour(appearance?.overlayColour, "#050a2e"),
              opacity: overlay / 100,
            }}
          />
        </>
      )}

      <Container
        className={[
          photo ? "relative" : "",
          // The block's own width only applies while none is chosen — both are
          // max-width classes, and two of them is a coin toss over which wins.
          width || defaultContainerClassName,
          align,
          containerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </Container>
    </section>
  );
}
