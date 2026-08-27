import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { PostSort } from "@/lib/posts";

/**
 * The sort and page-size controls, and the pager beneath the grid.
 *
 * Both are built from links over search parameters rather than client state:
 * a listing is content, so a particular page of it should be shareable,
 * bookmarkable and crawlable, and none of this needs JavaScript to work.
 */

const PER_PAGE_CHOICES = [12, 24, 48];

/** Rebuilds the current path's query with one value changed. */
function hrefFor(
  base: string,
  current: { sort: PostSort; perPage: number; page: number },
  change: Partial<{ sort: PostSort; perPage: number; page: number }>,
) {
  const next = { ...current, ...change };
  const params = new URLSearchParams();
  if (next.sort !== "newest") params.set("sort", next.sort);
  if (next.perPage !== 12) params.set("per", String(next.perPage));
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

const chip =
  "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors";
const chipOn = "border-brand-blue bg-brand-blue text-white";
const chipOff = "border-black/10 bg-white text-ink-muted hover:text-ink";

export function ListingControls({
  base,
  sort,
  perPage,
  total,
}: {
  base: string;
  sort: PostSort;
  perPage: number;
  total: number;
}) {
  const state = { sort, perPage, page: 1 };
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
      <p className="text-sm text-ink-muted">
        {total === 1 ? "1 story" : `${total} stories`}
      </p>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-muted">Sort</span>
          {(["newest", "oldest"] as const).map((option) => (
            <Link
              key={option}
              // Changing the order changes which stories are on page one, so
              // the pager resets rather than leaving the reader on a page
              // that no longer holds what they were looking at.
              href={hrefFor(base, state, { sort: option, page: 1 })}
              aria-current={sort === option ? "true" : undefined}
              className={`${chip} ${sort === option ? chipOn : chipOff}`}
            >
              {option === "newest" ? "Newest" : "Oldest"}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-muted">Show</span>
          {PER_PAGE_CHOICES.map((choice) => (
            <Link
              key={choice}
              href={hrefFor(base, state, { perPage: choice, page: 1 })}
              aria-current={perPage === choice ? "true" : undefined}
              className={`${chip} ${perPage === choice ? chipOn : chipOff}`}
            >
              {choice}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Page numbers with the first, the last and a window around the current one,
 * with an ellipsis where numbers are skipped — so thirty-two pages still fit
 * on one line.
 */
function pageNumbers(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages);
  const shown = [1, ...around, totalPages];
  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const n of shown) {
    if (n - previous > 1) out.push("gap");
    out.push(n);
    previous = n;
  }
  return out;
}

export function Pagination({
  base,
  sort,
  perPage,
  page,
  totalPages,
}: {
  base: string;
  sort: PostSort;
  perPage: number;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const state = { sort, perPage, page };

  const step =
    "inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-blue";
  const stepOff = "inline-flex items-center gap-2 text-sm font-semibold text-ink-muted/50";

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between gap-4 border-t border-black/10 pt-6"
    >
      {page > 1 ? (
        <Link href={hrefFor(base, state, { page: page - 1 })} className={step}>
          <ArrowRightIcon className="size-4 rotate-180" />
          Previous
        </Link>
      ) : (
        <span className={stepOff} aria-hidden>
          <ArrowRightIcon className="size-4 rotate-180" />
          Previous
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pageNumbers(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <li key={`gap-${index}`} className="px-2 text-sm text-ink-muted/60" aria-hidden>
              &hellip;
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={hrefFor(base, state, { page: entry })}
                aria-current={entry === page ? "page" : undefined}
                aria-label={`Page ${entry}`}
                className={`flex size-11 items-center justify-center rounded-full text-sm transition-colors ${
                  entry === page
                    ? "bg-brand-blue font-bold text-white"
                    : "text-ink hover:bg-mist"
                }`}
              >
                {entry}
              </Link>
            </li>
          ),
        )}
      </ol>

      {page < totalPages ? (
        <Link href={hrefFor(base, state, { page: page + 1 })} className={step}>
          Next
          <ArrowRightIcon className="size-4" />
        </Link>
      ) : (
        <span className={stepOff} aria-hidden>
          Next
          <ArrowRightIcon className="size-4" />
        </span>
      )}
    </nav>
  );
}
