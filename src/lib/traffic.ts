import type { Payload } from "payload";

import { COUNTRY_BY_CODE } from "@/lib/countrySites";

/**
 * Reading and writing the traffic counters.
 *
 * The `traffic` table is not a Payload collection. Its whole definition is
 * scripts/add-traffic.sql, and everything that touches it does so here, in
 * SQL. That is deliberate twice over.
 *
 * Nothing edits these rows, so a collection would buy nothing — but it would
 * cost something: Payload gives every collection a column on
 * payload_locked_documents_rels, and shipping code that expects that column
 * before the database has it takes out every document screen in the admin,
 * because opening any document writes a lock row through that table. Keeping
 * this out of the config means the admin and the site behave identically
 * whether the table exists or not.
 *
 * Both halves go straight to SQL rather than through Payload's own methods,
 * for the same reason in each direction.
 *
 * Writing: a view has to add one to a row that may or may not exist, and it
 * has to do it without reading first — two requests arriving together would
 * both read zero and both write one, and a count would be lost. That is
 * `INSERT … ON CONFLICT … DO UPDATE`, which Payload has no equivalent for.
 *
 * Reading: the screen wants "views per day for ninety days", which is a
 * `GROUP BY` over rows the caller never sees. Through `find` that is every
 * matching row pulled into memory and added up in JavaScript.
 */

/** The rows a single page view touches. */
type ViewFacts = {
  /** The address that was opened, already trimmed of query and origin. */
  path: string;
  /** The country site's code — "de" — or "" for amintl.org. */
  site: string;
  /**
   * The host that sent this reader, or "" if nobody did.
   *
   * Sent only on the first page of a visit, so what this counts is arrivals
   * rather than views — see the note in RecordView.
   */
  referrer: string;
  /** Two-letter country the reader is in, or "" if it isn't known. */
  country: string;
  /** Whether this view opened a new visit, rather than continuing one. */
  newVisit: boolean;
};

/** The UTC date, as the counters key themselves by. */
export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** The day `back` days before `from`, inclusive of both ends when listed. */
export function daysBack(back: number, from = new Date()): string[] {
  const days: string[] = [];
  for (let i = back - 1; i >= 0; i--) {
    days.push(dayKey(new Date(from.getTime() - i * 86_400_000)));
  }
  return days;
}

/**
 * The country site an address belongs to.
 *
 * The address is the country's code and nothing else — "/de", "/de/about" —
 * so this is the first segment when it names a country, and "" otherwise,
 * which is the main site.
 */
export function siteOf(path: string): string {
  const [first] = path.split("/").filter(Boolean);
  return first && COUNTRY_BY_CODE.has(first) ? first : "";
}

/**
 * Tidies an address into something worth counting.
 *
 * Query strings and fragments are dropped — the same page reached from two
 * campaigns is one page — and so is a trailing slash, which would otherwise
 * split "/about" and "/about/" into two rows saying the same thing. The length
 * cap is a guard against a crawler inventing addresses faster than anyone can
 * read them.
 */
export function tidyPath(raw: string): string | null {
  const path = raw.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/")) return null;
  if (path.startsWith("/admin") || path.startsWith("/api")) return null;
  if (path.length > 120) return null;
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return trimmed || "/";
}

/**
 * The site that linked here, as a bare host.
 *
 * Only the host is kept: the path someone came from is their business, and the
 * useful question is "did they arrive from a search engine, from Facebook, or
 * by typing the address". Arrivals from within this site are not referrals at
 * all and come back empty.
 */
export function referrerHost(raw: string | null | undefined, selfHost: string): string {
  if (!raw) return "";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host && host !== selfHost.replace(/^www\./, "") ? host.slice(0, 80) : "";
  } catch {
    return "";
  }
}

/**
 * Crawlers, previews and uptime checks.
 *
 * Most never run the script that reports a view, so this catches the few that
 * do rather than doing the work alone.
 */
const NOT_A_READER =
  /bot|crawler|spider|crawling|slurp|preview|monitor|headless|lighthouse|pingdom|curl|wget|python-requests/i;

export function looksLikeABot(userAgent: string | null | undefined): boolean {
  return !userAgent || NOT_A_READER.test(userAgent);
}

/**
 * Adds one view to every counter that describes it.
 *
 * One statement, five rows: the site's total, the page, the referrer and the
 * reader's country — the last two only when they are known, so that "" never
 * becomes a category of its own on screen.
 */
export async function recordView(payload: Payload, facts: ViewFacts): Promise<void> {
  const day = dayKey();
  const visit = facts.newVisit ? 1 : 0;

  const rows: [string, string, string][] = [
    [facts.site, "total", ""],
    [facts.site, "page", facts.path],
  ];
  if (facts.referrer) rows.push([facts.site, "referrer", facts.referrer]);
  if (facts.country) rows.push([facts.site, "country", facts.country]);

  const values: unknown[] = [];
  const placeholders = rows.map((row, index) => {
    const at = index * 5;
    values.push(day, row[0], row[1], row[2], visit);
    return `($${at + 1}, $${at + 2}, $${at + 3}, $${at + 4}, 1, $${at + 5})`;
  });

  // Named by columns rather than by index name: Payload chooses the index's
  // name, and this then keeps working if it ever chooses a different one.
  await pool(payload).query(
    `INSERT INTO traffic (day, site, kind, label, views, visits)
     VALUES ${placeholders.join(", ")}
     ON CONFLICT (day, site, kind, label) DO UPDATE
       SET views = traffic.views + EXCLUDED.views,
           visits = traffic.visits + EXCLUDED.visits,
           updated_at = now()`,
    values,
  );
}

type Pool = { query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };

function pool(payload: Payload): Pool {
  const candidate = (payload.db as unknown as { pool?: Pool }).pool;
  if (!candidate) throw new Error("The database adapter has no connection pool.");
  return candidate;
}

export type TrafficTotals = { views: number; visits: number };

export type TrafficBar = { label: string; views: number; share: number };

export type TrafficReport = {
  /** Views and visits per day, oldest first, with empty days filled in. */
  perDay: { day: string; views: number; visits: number }[];
  total: TrafficTotals;
  /** The same window, ending the day before it began, for the comparison. */
  previous: TrafficTotals;
  pages: TrafficBar[];
  sites: TrafficBar[];
  referrers: TrafficBar[];
  countries: TrafficBar[];
  /** True before anything has ever been recorded, which reads differently. */
  everRecorded: boolean;
};

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function bars(rows: Record<string, unknown>[], top: number): TrafficBar[] {
  const list = rows.map((row) => ({
    label: String(row.label ?? ""),
    views: toNumber(row.views),
  }));
  const biggest = Math.max(1, ...list.map((row) => row.views));
  return list.slice(0, top).map((row) => ({
    ...row,
    share: Math.round((row.views / biggest) * 100),
  }));
}

/**
 * Everything the Traffic screen draws, for a window of days.
 *
 * `sites` limits it to particular country sites — that is how an admin sees
 * their own countries and nobody else's. Undefined means every site, which is
 * what a super admin gets; an empty list means none at all, and no query is
 * run.
 */
export async function getTrafficReport(
  payload: Payload,
  { days, sites }: { days: number; sites?: string[] },
): Promise<TrafficReport> {
  const empty: TrafficReport = {
    perDay: daysBack(days).map((day) => ({ day, views: 0, visits: 0 })),
    total: { views: 0, visits: 0 },
    previous: { views: 0, visits: 0 },
    pages: [],
    sites: [],
    referrers: [],
    countries: [],
    everRecorded: false,
  };

  if (sites && sites.length === 0) return empty;

  const window = daysBack(days);
  const from = window[0];
  const to = window[window.length - 1];
  const priorFrom = daysBack(days, new Date(new Date(`${from}T00:00:00Z`).getTime() - 86_400_000))[0];
  const priorTo = daysBack(1, new Date(new Date(`${from}T00:00:00Z`).getTime() - 86_400_000))[0];

  // The site filter is spliced in rather than parameterised as an array, so
  // one shape of query serves both roles; the values themselves stay bound.
  const bound: unknown[] = [from, to];
  let siteFilter = "";
  if (sites) {
    siteFilter = ` AND site IN (${sites.map((_, i) => `$${bound.length + i + 1}`).join(", ")})`;
    bound.push(...sites);
  }

  const db = pool(payload);
  const run = (sql: string, values: unknown[]) =>
    db.query(sql, values).then((result) => result.rows).catch(() => [] as Record<string, unknown>[]);

  const [perDayRows, priorRows, pageRows, siteRows, referrerRows, countryRows, anyRows] =
    await Promise.all([
      run(
        `SELECT day, SUM(views) AS views, SUM(visits) AS visits FROM traffic
          WHERE kind = 'total' AND day BETWEEN $1 AND $2${siteFilter}
          GROUP BY day ORDER BY day`,
        bound,
      ),
      // The same filter text serves both windows: the site names sit at $3
      // onwards either way, only the two dates in front of them differ.
      run(
        `SELECT SUM(views) AS views, SUM(visits) AS visits FROM traffic
          WHERE kind = 'total' AND day BETWEEN $1 AND $2${siteFilter}`,
        [priorFrom, priorTo, ...(sites ?? [])],
      ),
      run(
        `SELECT label, SUM(views) AS views FROM traffic
          WHERE kind = 'page' AND day BETWEEN $1 AND $2${siteFilter}
          GROUP BY label ORDER BY 2 DESC LIMIT 12`,
        bound,
      ),
      run(
        `SELECT site AS label, SUM(views) AS views FROM traffic
          WHERE kind = 'total' AND day BETWEEN $1 AND $2${siteFilter}
          GROUP BY site ORDER BY 2 DESC LIMIT 12`,
        bound,
      ),
      run(
        `SELECT label, SUM(views) AS views FROM traffic
          WHERE kind = 'referrer' AND day BETWEEN $1 AND $2${siteFilter}
          GROUP BY label ORDER BY 2 DESC LIMIT 8`,
        bound,
      ),
      run(
        `SELECT label, SUM(views) AS views FROM traffic
          WHERE kind = 'country' AND day BETWEEN $1 AND $2${siteFilter}
          GROUP BY label ORDER BY 2 DESC LIMIT 8`,
        bound,
      ),
      run(`SELECT 1 FROM traffic LIMIT 1`, []),
    ]);

  const byDay = new Map(perDayRows.map((row) => [String(row.day), row]));
  const perDay = window.map((day) => ({
    day,
    views: toNumber(byDay.get(day)?.views),
    visits: toNumber(byDay.get(day)?.visits),
  }));

  return {
    perDay,
    total: {
      views: perDay.reduce((sum, row) => sum + row.views, 0),
      visits: perDay.reduce((sum, row) => sum + row.visits, 0),
    },
    previous: {
      views: toNumber(priorRows[0]?.views),
      visits: toNumber(priorRows[0]?.visits),
    },
    pages: bars(pageRows, 12),
    sites: bars(siteRows, 12),
    referrers: bars(referrerRows, 8),
    countries: bars(countryRows, 8),
    everRecorded: anyRows.length > 0,
  };
}
