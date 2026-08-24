import en from "../../messages/en.json";

/**
 * The catalogue of overridable copy.
 *
 * messages/en.json is the main version of every string on the site, so it
 * doubles as the list of what a country site is allowed to change. Deriving
 * the list from the file rather than maintaining a second copy means a new
 * string becomes overridable the moment it is translated, and a deleted one
 * stops being offered.
 */

export type MessageKind = "string" | "list";

export type MessageKey = {
  /** Dotted path as next-intl addresses it, e.g. "Home.Hero.headingWhere". */
  key: string;
  /** The main-version English copy this key falls back to. */
  defaultValue: string;
  kind: MessageKind;
};

function walk(node: unknown, path: string[], out: MessageKey[]): void {
  if (typeof node === "string") {
    out.push({ key: path.join("."), defaultValue: node, kind: "string" });
    return;
  }
  if (Array.isArray(node)) {
    // The handful of list-valued keys (roadmap bullet lists) are overridable
    // too, one item per line — see coerceOverride below.
    if (node.every((item) => typeof item === "string")) {
      out.push({ key: path.join("."), defaultValue: node.join("\n"), kind: "list" });
    }
    return;
  }
  if (node && typeof node === "object") {
    for (const [childKey, child] of Object.entries(node)) {
      walk(child, [...path, childKey], out);
    }
  }
}

export const MESSAGE_KEYS: MessageKey[] = (() => {
  const out: MessageKey[] = [];
  walk(en, [], out);
  return out.sort((a, b) => a.key.localeCompare(b.key));
})();

export const MESSAGE_KIND_BY_KEY: Record<string, MessageKind> = Object.fromEntries(
  MESSAGE_KEYS.map((entry) => [entry.key, entry.kind]),
);

export const DEFAULT_BY_KEY: Record<string, string> = Object.fromEntries(
  MESSAGE_KEYS.map((entry) => [entry.key, entry.defaultValue]),
);

/**
 * Turns a stored override back into the shape the key had in en.json, so a
 * list key stays a list and next-intl's `t.raw` keeps working.
 */
export function coerceOverride(key: string, value: string): string | string[] {
  if (MESSAGE_KIND_BY_KEY[key] !== "list") return value;
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Human-readable trail: "Home.Hero.headingWhere" -> "Home › Hero › headingWhere". */
export function humanizeKey(key: string): string {
  return key.split(".").join(" › ");
}

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}

/**
 * Options for the admin picker. The English copy is folded into the label so
 * an editor can find a string by what it says rather than having to know the
 * key it lives under — searching "Overflows" finds Home.Hero.headingWeAre.
 */
export const MESSAGE_KEY_OPTIONS = MESSAGE_KEYS.map(({ key, defaultValue }) => ({
  value: key,
  label: `${humanizeKey(key)} — “${truncate(defaultValue, 60)}”`,
}));
