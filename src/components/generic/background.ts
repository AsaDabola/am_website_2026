/**
 * The constrained set of section backgrounds every generic block can pick
 * from — built entirely from the site's existing brand tokens (globals.css)
 * so an editor can't produce an off-brand or unreadable combination. Mirrors
 * the same mechanism in the YEF site (src/components/generic/background.ts),
 * ported to AM's own token names.
 */
export const BACKGROUND_OPTIONS = [
  { label: "White (default)", value: "white" },
  { label: "Paper (light)", value: "paper" },
  { label: "Night (dark navy)", value: "night" },
  { label: "Brand blue", value: "blue" },
  { label: "Gradient — night to blue", value: "gradient-night-blue" },
  { label: "Gradient — blue to navy", value: "gradient-blue-navy" },
] as const;

export type BackgroundValue = (typeof BACKGROUND_OPTIONS)[number]["value"];

const BG_CLASSES: Record<BackgroundValue, string> = {
  white: "bg-white",
  paper: "bg-paper",
  night: "bg-night",
  blue: "bg-brand-blue",
  "gradient-night-blue": "bg-gradient-to-br from-night to-brand-blue",
  "gradient-blue-navy": "bg-gradient-to-br from-brand-blue to-brand-navy",
};

const DARK_BACKGROUNDS = new Set<BackgroundValue>([
  "night",
  "blue",
  "gradient-night-blue",
  "gradient-blue-navy",
]);

/** A dark background needs light text — everything else keeps the block's
 *  normal (dark-on-light) text colors. */
export function backgroundClasses(background?: BackgroundValue) {
  const value = background ?? "white";
  const dark = DARK_BACKGROUNDS.has(value);
  return {
    section: BG_CLASSES[value] ?? BG_CLASSES.white,
    dark,
    heading: dark ? "text-white" : "text-ink",
    body: dark ? "text-on-dark/80" : "text-ink-muted",
    eyebrowTone: (dark ? "light" : "blue") as "light" | "blue",
  };
}
