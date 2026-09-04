/**
 * The translation providers, shared by everything here that translates.
 *
 * Two machine services and a small model, behind one interface: give it a list
 * of strings, get the same list back translated, in the same order. That shape
 * is what lets a whole article — or a whole page of headings — go over in one
 * or two calls rather than one per sentence.
 *
 * Extracted so that translating the message catalogue and translating the
 * articles cannot drift apart. Adding a provider here adds it to both.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..", "..");

/** The language everything is written in. Everything else is a target. */
export const SOURCE = "en";

/** Every locale the site ships, read from the routing table so it cannot drift. */
export function siteLocales() {
  const source = fs.readFileSync(path.join(ROOT, "src", "i18n", "routing.ts"), "utf8");
  const block = /export const locales = \[([\s\S]*?)\] as const;/.exec(source);
  if (!block) throw new Error("I couldn't read the locale list out of src/i18n/routing.ts.");
  return [...block[1].matchAll(/"([a-z-]+)"/g)].map((match) => match[1]);
}

/**
 * Each locale's name in its own language, read from the same file.
 *
 * The machine translation services take a language code. A model does not —
 * it takes a sentence — and "translate this into 한국어" is both unambiguous
 * and already written down here, so there is no second list to keep in step.
 */
export function localeLabels() {
  const source = fs.readFileSync(path.join(ROOT, "src", "i18n", "routing.ts"), "utf8");
  const block = /export const localeLabels: Record<Locale, string> = \{([\s\S]*?)\n\};/.exec(source);
  if (!block) return {};
  return Object.fromEntries(
    [...block[1].matchAll(/^\s*"?([a-z-]+)"?:\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]),
  );
}

const LABELS = localeLabels();

/* -------------------------------------------------------------- providers */

/**
 * Both providers take a list of strings and give a list back in the same
 * order, which is what lets a whole article go over in one or two calls
 * instead of one per paragraph.
 */

export const PROVIDERS = {
  google: {
    name: "Google Cloud Translation",
    /**
     * Overridable so this can be pointed at a self-hosted or proxied
     * translation service that speaks the same shape — and so the script can
     * be exercised end to end without spending anything.
     */
    base: () => process.env.TRANSLATE_ENDPOINT || "https://translation.googleapis.com/language/translate/v2",
    /** Google's own names for languages whose codes differ from ours. */
    aliases: { he: "iw", zh: "zh-CN", fil: "tl", nb: "no" },
    async languages(key) {
      const res = await fetch(
        `${PROVIDERS.google.base()}/languages?key=${encodeURIComponent(key)}`,
      );
      if (!res.ok) throw new Error(`Asking Google which languages it has failed (${res.status}): ${await res.text()}`);
      const body = await res.json();
      return body.data.languages.map((entry) => entry.language.toLowerCase());
    },
    async translate(key, texts, target) {
      const res = await fetch(
        `${PROVIDERS.google.base()}?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: texts, source: SOURCE, target, format: "text" }),
        },
      );
      if (!res.ok) {
        const error = new Error(`Google returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        error.status = res.status;
        throw error;
      }
      const body = await res.json();
      return body.data.translations.map((entry) => entry.translatedText);
    },
  },

  deepl: {
    name: "DeepL",
    aliases: { pt: "pt-PT", zh: "zh-HANS", en: "en-GB" },
    endpoint: (key) =>
      key.endsWith(":fx") ? "https://api-free.deepl.com/v2" : "https://api.deepl.com/v2",
    async languages(key) {
      const res = await fetch(`${PROVIDERS.deepl.endpoint(key)}/languages?type=target`, {
        headers: { Authorization: `DeepL-Auth-Key ${key}` },
      });
      if (!res.ok) throw new Error(`Asking DeepL which languages it has failed (${res.status}): ${await res.text()}`);
      return (await res.json()).map((entry) => entry.language.toLowerCase());
    },
    async translate(key, texts, target) {
      const res = await fetch(`${PROVIDERS.deepl.endpoint(key)}/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: texts, source_lang: SOURCE.toUpperCase(), target_lang: target.toUpperCase() }),
      });
      if (!res.ok) {
        const error = new Error(`DeepL returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        error.status = res.status;
        throw error;
      }
      return (await res.json()).translations.map((entry) => entry.text);
    },
  },

  /**
   * A small language model, through OpenAI's chat completions API.
   *
   * Two reasons to prefer it over the two above. It costs roughly a hundredth
   * as much — pennies per million characters against twenty dollars — and it
   * can attempt every language the site ships, including Fiji Hindi and
   * Romansh, which neither machine translation service offers at all.
   *
   * What it costs in exchange is determinism: a model can decline, waffle, or
   * hand back a different number of strings than it was given. So the reply is
   * parsed strictly and a wrong count is thrown rather than accepted — the
   * caller retries, and a translation that still does not line up is left
   * undone, which shows the article in the language it was written in. That is
   * the same fallback everything else here uses.
   */
  openai: {
    name: "OpenAI",
    aliases: {},
    base: () => process.env.TRANSLATE_ENDPOINT || "https://api.openai.com/v1",
    model: () => process.env.TRANSLATE_MODEL || "gpt-4o-mini",
    /**
     * Every locale, unfiltered. There is no endpoint to ask, and a model will
     * make an honest attempt at any of them — which is the point of using one.
     */
    async languages() {
      return siteLocales();
    },
    async translate(key, texts, target) {
      const language = LABELS[target] ? `${LABELS[target]} (${target})` : target;
      const res = await fetch(`${PROVIDERS.openai.base()}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: PROVIDERS.openai.model(),
          // Nothing creative is wanted here.
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a translation engine for a Christian student mission's website. " +
                `Translate each string from English into ${language}. ` +
                "Reply with JSON: {\"translations\": [...]} — an array of the translated " +
                "strings, the same length as the input and in the same order. " +
                "Translate every string, even one that looks like a heading, a button " +
                "label or a single word. Keep names of people, places and organisations " +
                "as they are. Preserve any leading or trailing spaces, and any HTML or " +
                "markdown around the words — in particular, a <hl>…</hl> tag marks the " +
                "word the design picks out in colour, so keep the tag and put it around " +
                "the word that carries the same meaning in your translation, wherever " +
                "that word falls in the sentence. Do not add notes, explanations or quotation " +
                "marks of your own. If a string is already in the target language, return " +
                "it unchanged.",
            },
            { role: "user", content: JSON.stringify({ strings: texts }) },
          ],
        }),
      });

      if (!res.ok) {
        const error = new Error(`OpenAI returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        error.status = res.status;
        throw error;
      }

      const body = await res.json();
      const content = body.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("OpenAI replied with no message content.");

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error(`OpenAI replied with something that is not JSON: ${content.slice(0, 200)}`);
      }

      const out = parsed.translations;
      // The guard that makes a model safe to use here: a reply that does not
      // line up one-for-one with the input would silently put the wrong
      // sentence under the wrong heading.
      if (!Array.isArray(out) || out.length !== texts.length) {
        const error = new Error(
          `OpenAI returned ${Array.isArray(out) ? out.length : "no"} strings for ${texts.length}.`,
        );
        // Worth retrying: this is usually the model truncating a long batch.
        error.status = 500;
        throw error;
      }
      return out.map((value, index) => (typeof value === "string" ? value : texts[index]));
    },
  },
};

/**
 * The provider's name for one of our locales, or null if it cannot do it.
 *
 * Asked of the provider rather than hard-coded: the list of languages these
 * services cover grows, and a table written today would quietly go on
 * refusing a language months after it became available. Matching on the base
 * code as well as the exact one is what makes "pt" find "pt-BR".
 */
export function providerCode(locale, aliases, supported) {
  const candidates = [aliases[locale], locale].filter(Boolean).map((code) => code.toLowerCase());
  for (const candidate of candidates) {
    if (supported.includes(candidate)) return candidate;
    const regional = supported.find((code) => code.split("-")[0] === candidate);
    if (regional) return regional;
  }
  return null;
}

/** One call, retried on the failures that are worth retrying. */
export async function translateBatch(provider, key, texts, target) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await provider.translate(key, texts, target);
    } catch (error) {
      const retryable = error.status === 429 || (error.status >= 500 && error.status < 600);
      if (!retryable || attempt === 4) throw error;
      // Backing off rather than hammering: a rate limit answered immediately
      // is a rate limit again.
      await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
    }
  }
  return null;
}

/**
 * Splits a list of strings into calls the provider will accept.
 *
 * Both services cap the number of strings and the total size of one request,
 * and an article with eighty paragraphs exceeds the first while a single long
 * one can exceed the second.
 */
/**
 * How much each provider is given at once.
 *
 * The two machine services cap this themselves and are happy with large
 * requests. A model is given far less: a long batch is where it starts
 * truncating, and a truncated batch is a whole retry rather than a slightly
 * short one, so smaller batches are both safer and, in the end, faster.
 */
export const BATCH_LIMITS = {
  google: { maxItems: 100, maxChars: 25_000 },
  deepl: { maxItems: 100, maxChars: 25_000 },
  openai: { maxItems: 25, maxChars: 6_000 },
};

export function batched(texts, { maxItems = 100, maxChars = 25_000 } = {}) {
  const batches = [];
  let current = [];
  let size = 0;
  for (const text of texts) {
    if (current.length && (current.length >= maxItems || size + text.length > maxChars)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += text.length;
  }
  if (current.length) batches.push(current);
  return batches;
}
