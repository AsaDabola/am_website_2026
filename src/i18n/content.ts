import { createTranslator } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getRequestOverrides, applyOverrides } from "@/lib/tenantContent";

/**
 * Drop-in replacement for next-intl's `getTranslations`, aware of the country
 * site being rendered.
 *
 * Away from a country route it behaves exactly like the original. On a
 * country route, that country's copy changes are layered over the main
 * version first, so a page written once serves ~68 countries and still lets
 * any of them say something different.
 *
 * Built on `createTranslator` over merged messages rather than by
 * intercepting the returned `t`, which keeps the whole surface — `t.rich`,
 * `t.markup`, `t.raw`, `t.has`, ICU arguments and plurals — working on
 * overridden strings exactly as it does on the originals.
 */
export async function getTranslations(namespace?: string) {
  const locale = await getLocale();
  const [messages, overrides] = await Promise.all([
    getMessages(),
    getRequestOverrides(locale),
  ]);

  return createTranslator({
    locale,
    messages: applyOverrides(messages as Record<string, unknown>, overrides),
    namespace,
    // Matches next-intl's server default: a missing key renders its own path
    // rather than throwing the page away.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

/**
 * The full message catalogue for the current request with this country's
 * overrides folded in — for handing to NextIntlClientProvider, since client
 * components read messages from the provider rather than the request config.
 */
export async function getContentMessages() {
  const locale = await getLocale();
  const [messages, overrides] = await Promise.all([
    getMessages(),
    getRequestOverrides(locale),
  ]);
  return applyOverrides(messages as Record<string, unknown>, overrides);
}
