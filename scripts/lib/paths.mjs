import fs from "node:fs";

/**
 * The folder someone actually meant, from what the terminal gave them.
 *
 * Dragging a folder into a terminal writes an escaped path and then a space
 * after it, so "events part 1" arrives as
 *
 *     /Users/x/Downloads/events\ part\ 1\
 *
 * — the final "\ " is that trailing space, escaped. Trimming before
 * unescaping eats the space and leaves the backslash stuck to the name, and
 * the folder is then reported missing while sitting right there. So the
 * unescaping happens first and the trimming after.
 *
 * A name that genuinely ends in a space is still reachable: both readings are
 * tried, the trimmed one first, and whichever exists wins.
 */
export function pathCandidates(input) {
  const unescaped = String(input)
    .replace(/^\s+/, "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\(.)/g, "$1")
    .replace(/\/+$/, "");

  const trimmed = unescaped.replace(/\s+$/, "");
  return trimmed === unescaped ? [trimmed] : [trimmed, unescaped];
}

/**
 * The first candidate that is there, or the tidiest one if none is — so the
 * error names the path someone will recognise rather than the raw input.
 */
export function resolveFolder(input) {
  const candidates = pathCandidates(input);
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}
