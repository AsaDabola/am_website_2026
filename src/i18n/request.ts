import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import en from "../../messages/en.json";

type Messages = Record<string, unknown>;

/**
 * Locale messages laid over English.
 *
 * All 48 locale files are translated in full, but a newly added string only
 * exists in English until translation catches up. Without this, next-intl
 * renders the key path — a reader in Korean would see "Network.globeSubtitle"
 * sitting in the middle of the page. English is not the right answer either,
 * but it is a sentence rather than a variable name.
 */
function mergeInto(base: Messages, override: Messages): Messages {
  const merged: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = merged[key];
    const bothObjects =
      existing !== null &&
      value !== null &&
      typeof existing === "object" &&
      typeof value === "object" &&
      !Array.isArray(existing) &&
      !Array.isArray(value);
    merged[key] = bothObjects
      ? mergeInto(existing as Messages, value as Messages)
      : value;
  }
  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default as Messages;
  return {
    locale,
    messages: locale === routing.defaultLocale ? messages : mergeInto(en as Messages, messages),
  };
});
