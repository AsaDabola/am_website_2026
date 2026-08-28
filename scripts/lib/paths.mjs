import fs from "node:fs";
import path from "node:path";

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
 * A name reduced to what someone reading it would say out loud: case, and any
 * run of spaces — ordinary, non-breaking, or otherwise — treated as one.
 *
 * Names arriving from a download and an unzip carry invisible differences a
 * file listing does not show: a trailing space, a non-breaking space where a
 * plain one is expected. "events part 1 " and "events part 1" look identical
 * in Finder and are different paths.
 */
function squash(name) {
  return name.replace(/\s+/gu, " ").trim().toLowerCase();
}

/**
 * The first candidate that is there; failing that, the one folder beside it
 * whose name only differs in those invisible ways; failing that, the tidiest
 * reading, so the error names a path someone will recognise.
 *
 * Looking in the parent rather than guessing further is the point: the folder
 * is right there, and one listing settles what it is actually called.
 */
export function resolveFolder(input) {
  const candidates = pathCandidates(input);
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (found) return found;

  const guess = candidates[0];
  const parent = path.dirname(guess);
  const wanted = squash(path.basename(guess));

  try {
    const alike = fs
      .readdirSync(parent, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && squash(entry.name) === wanted);
    if (alike.length === 1) return path.join(parent, alike[0].name);
  } catch {
    // The parent is unreadable or gone; the caller reports the missing folder.
  }

  return guess;
}

/**
 * The folders sitting beside where someone pointed, for an error message.
 * Being told what is actually there beats being told again that it is not.
 */
export function foldersBeside(missingPath, limit = 12) {
  try {
    return fs
      .readdirSync(path.dirname(missingPath), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .slice(0, limit);
  } catch {
    return [];
  }
}
