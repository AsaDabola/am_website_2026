/**
 * Turns a small, well-defined subset of markdown into the Lexical document
 * Payload's rich text field stores.
 *
 * The site's built-in pages hold a great deal of prose, and putting it into the
 * editor means putting it into that field. Written as Lexical JSON by hand it
 * would be thousands of lines of nested nodes that nobody could read or
 * correct; written as markdown it is the paragraphs themselves, and this turns
 * one into the other.
 *
 * The subset is deliberate — headings, paragraphs, bold, italic, links, bullet
 * and numbered lists, and block quotes. That is what these pages actually use.
 * Anything outside it is left as literal text rather than guessed at, because a
 * converter that half-understands a construct produces a document that looks
 * right until someone opens it.
 *
 * Shapes taken from what `lexicalEditor()` writes, so a converted document is
 * the same as one typed into the admin — which matters, since editors will
 * open these and carry on typing.
 */

/** Lexical's bit flags for inline formatting. Bold is 1, italic is 2. */
const BOLD = 1;
const ITALIC = 2;

function textNode(text, format = 0) {
  return {
    detail: 0,
    format,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function linkNode(text, url, format = 0) {
  return {
    children: [textNode(text, format)],
    direction: "ltr",
    fields: {
      // The shape the Lexical link feature stores. `linkType: custom` with a
      // url is what typing an address into the editor produces.
      linkType: "custom",
      newTab: /^https?:\/\//.test(url),
      url,
    },
    format: "",
    indent: 0,
    type: "link",
    version: 3,
  };
}

/**
 * One line of markdown as a list of inline nodes.
 *
 * Ordered so the longest markers win: `**` before `*`, and links before
 * either, so `[**bold link**](…)` comes out whole rather than as three pieces.
 */
function inline(line) {
  const nodes = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;
  let at = 0;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > at) nodes.push(textNode(line.slice(at, match.index)));
    const [, linkText, url, bold, italicStar, italicUnderscore] = match;

    if (linkText !== undefined) {
      // A link's own text may itself be bold or italic.
      const inner = /^\*\*(.+)\*\*$/.exec(linkText) ?? /^\*(.+)\*$/.exec(linkText);
      const format = inner ? (linkText.startsWith("**") ? BOLD : ITALIC) : 0;
      nodes.push(linkNode(inner ? inner[1] : linkText, url, format));
    } else if (bold !== undefined) nodes.push(textNode(bold, BOLD));
    else nodes.push(textNode(italicStar ?? italicUnderscore, ITALIC));

    at = match.index + match[0].length;
  }

  if (at < line.length) nodes.push(textNode(line.slice(at)));
  return nodes.length ? nodes : [textNode("")];
}

const block = (type, children, extra = {}) => ({
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  type,
  version: 1,
  ...extra,
});

/**
 * A line break inside a paragraph, which is what markdown's two trailing
 * spaces mean. Needed for the things that are one block but several lines —
 * a postal address, a verse reference — where a paragraph each would space
 * them apart as if they were separate thoughts.
 */
const LINE_BREAK = { type: "linebreak", version: 1 };

function paragraph(text) {
  // The sentinel is what the reader below leaves where a line ended in two
  // spaces. It cannot appear in anyone's copy: it is a control character.
  // The join below puts a space after the sentinel; it belongs to neither
  // line, so it goes with the mark.
  const parts = String(text).split(/\u0000 ?/);
  const children = parts.flatMap((part, index) =>
    index === 0 ? inline(part) : [LINE_BREAK, ...inline(part)],
  );
  return block("paragraph", children, { textFormat: 0, textStyle: "" });
}

function heading(text, tag) {
  return block("heading", inline(text), { tag });
}

function quote(lines) {
  return block("quote", inline(lines.join(" ")));
}

function list(items, ordered) {
  return block(
    "list",
    items.map((item, index) =>
      block("listitem", inline(item), { checked: undefined, value: index + 1 }),
    ),
    { listType: ordered ? "number" : "bullet", start: 1, tag: ordered ? "ol" : "ul" },
  );
}

/**
 * @param {string} markdown
 * @returns {object} the value a Payload richText field holds
 */
export function markdownToLexical(markdown) {
  const lines = String(markdown ?? "").replace(/\r\n/g, "\n").split("\n");
  const children = [];

  let paragraphLines = [];
  let listItems = null;
  let listOrdered = false;
  let quoteLines = null;

  const flushParagraph = () => {
    if (paragraphLines.length) {
      // Lines that ended in two spaces already carry the sentinel, so joining
      // on a space here does not run them together.
      children.push(paragraph(paragraphLines.join(" ").trim()));
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems?.length) children.push(list(listItems, listOrdered));
    listItems = null;
  };
  const flushQuote = () => {
    if (quoteLines?.length) children.push(quote(quoteLines));
    quoteLines = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    // Markdown's hard line break: two spaces at the end of a line. Recorded
    // before trimming, since trimming is what removes it.
    const hardBreak = /\s\s$/.test(raw);
    const line = raw.trim();

    if (line === "") {
      flushAll();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushAll();
      children.push(heading(headingMatch[2], `h${headingMatch[1].length}`));
      continue;
    }

    const quoteMatch = /^>\s?(.*)$/.exec(line);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      (quoteLines ??= []).push(quoteMatch[1]);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      flushQuote();
      const ordered = Boolean(numbered);
      // A bullet list running straight into a numbered one is two lists.
      if (listItems && listOrdered !== ordered) flushList();
      listOrdered = ordered;
      (listItems ??= []).push((bullet ?? numbered)[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(hardBreak ? `${line}\u0000` : line);
  }

  flushAll();

  return {
    root: {
      children: children.length ? children : [paragraph("")],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}
