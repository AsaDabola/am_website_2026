/**
 * Reading and rewriting the words inside a rich-text article body.
 *
 * An article's body is a Lexical document: a tree of paragraphs, headings,
 * lists, quotes and links, where the words themselves live in `text` nodes
 * scattered through it. Translating a body is therefore not translating a
 * string — it is taking every run of words out in order, translating those,
 * and putting them back in the same order, so the bold stays bold and the
 * link still wraps the words it wrapped.
 *
 * This lives only here, on the writing side. The site never needs it: it
 * stores and serves whole translated bodies, so there is one implementation
 * rather than two that could disagree about what counts as text.
 */

/** Whether a node is one whose `text` is words a reader sees. */
function isTextNode(node) {
  return typeof node.text === "string" && node.type !== "linebreak";
}

function walk(node, visit) {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (isTextNode(node)) visit(node);

  // `children` is the usual nesting, but a Lexical document also nests through
  // `root`, and upload and block nodes carry their own fields. Walking every
  // object value rather than only `children` is what keeps a caption or a
  // quote attribution from being left in English.
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") walk(value, visit);
  }
}

/**
 * Every run of words in the body, in reading order.
 *
 * Empty runs are kept in place so the list lines up one-for-one with what
 * `applyText` expects — dropping them here would shift every later run onto
 * the wrong node.
 */
export function extractText(body) {
  const found = [];
  walk(body, (node) => found.push(node.text));
  return found;
}

/**
 * The same body with each run of words replaced by the matching entry.
 *
 * Returns null rather than a half-rewritten document if the counts do not line
 * up. That should not happen — the same walk produced the list — but a body is
 * the article, and a wrong answer here is a scrambled page rather than a
 * missing translation.
 */
export function applyText(body, replacements) {
  if (extractText(body).length !== replacements.length) return null;

  const copy = structuredClone(body);
  let index = 0;
  walk(copy, (node) => {
    node.text = replacements[index++];
  });
  return copy;
}

/** The characters a provider would bill for, for pricing before running. */
export function countCharacters(strings) {
  return strings.reduce((sum, text) => sum + text.length, 0);
}
