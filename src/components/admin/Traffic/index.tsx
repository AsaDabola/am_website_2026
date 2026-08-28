import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import Link from "next/link";

import { COUNTRY_BY_CODE } from "@/lib/countrySites";
import { continentsOf, isSuperAdmin, tenantIds } from "@/lib/adminAccess";
import { getTrafficReport, type TrafficBar } from "@/lib/traffic";

import { TrafficChart } from "./TrafficChart";
import { IconArrow, IconChart, IconGlobe, IconPage, IconSpark } from "../Dashboard/icons";

/**
 * How much the site is being read.
 *
 * The counters behind this are written by /api/track, once per page, from the
 * page itself. They are running totals rather than a log, so a year reads as
 * fast as a week and there is nothing stored about anybody: no address, no
 * cookie, and a "visit" that is only the first page seen in a tab.
 *
 * Scope follows the same rule as the rest of the admin. A super admin sees the
 * whole network; anyone else sees the country sites they were given, and the
 * per-country breakdown that would name the others is left off rather than
 * shown empty.
 *
 * Two things this deliberately says out loud. Before anything has been
 * recorded it says so, rather than drawing an empty chart that looks like a
 * failure. And a country the reader is in is where the *reader* is, which is
 * not the same as which country site they were on — both are on screen, and
 * they are labelled differently for that reason.
 */

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

/** The country sites a person may see, or undefined for "all of them". */
async function sitesFor(
  user: unknown,
  payload: AdminViewServerProps["initPageResult"]["req"]["payload"],
): Promise<string[] | undefined> {
  if (isSuperAdmin(user)) return undefined;

  const ids = tenantIds(user);
  const continents = continentsOf(user);
  if (!ids.length && !continents.length) return [];

  // The counters key on the country's code and the account names its tenants
  // by database id, so the tenants have to be read to get from one to the
  // other. Continents come along the same way: a continent's admin reaches
  // every country in it, including ones added after the account was made.
  const clauses = [];
  if (ids.length) clauses.push({ id: { in: ids } });
  if (continents.length) clauses.push({ continent: { in: continents } });

  try {
    const { docs } = await payload.find({
      collection: "tenants",
      depth: 0,
      limit: 0,
      overrideAccess: true,
      pagination: false,
      select: { slug: true },
      where: clauses.length === 1 ? clauses[0] : { or: clauses },
    });
    const codes = new Set<string>();
    for (const [code, country] of COUNTRY_BY_CODE) {
      if (docs.some((doc) => (doc as { slug?: string }).slug === country.slug)) codes.add(code);
    }
    return [...codes];
  } catch {
    return [];
  }
}

/** "de" as "Germany", "" as the main site. */
function siteName(code: string): string {
  if (!code) return "amintl.org";
  return COUNTRY_BY_CODE.get(code)?.country ?? code.toUpperCase();
}

const COUNTRY_NAMES =
  typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

function readerCountry(code: string): string {
  if (!code) return "Not known";
  try {
    return COUNTRY_NAMES?.of(code) ?? code;
  } catch {
    return code;
  }
}

function Bars({
  rows,
  empty,
  name = (label: string) => label || "—",
}: {
  rows: TrafficBar[];
  empty: string;
  name?: (label: string) => string;
}) {
  if (!rows.length) return <p className="am-empty">{empty}</p>;
  return (
    <ul className="am-bars">
      {rows.map((row) => (
        <li className="am-bars__row am-bars__row--wide" key={row.label}>
          <span className="am-bars__label" title={name(row.label)}>
            {name(row.label)}
          </span>
          <span className="am-bars__track">
            <span className="am-bars__fill" style={{ width: `${row.share}%` }} />
          </span>
          <span className="am-bars__value">{row.views.toLocaleString("en")}</span>
        </li>
      ))}
    </ul>
  );
}

/** "up 12%" — or nothing at all when there is no earlier window to compare. */
function change(now: number, before: number): { text: string; tone: "up" | "down" | "flat" } | null {
  if (!before) return null;
  const percent = Math.round(((now - before) / before) * 100);
  if (percent === 0) return { text: "level with the window before", tone: "flat" };
  return {
    text: `${percent > 0 ? "up" : "down"} ${Math.abs(percent)}% on the window before`,
    tone: percent > 0 ? "up" : "down",
  };
}

/**
 * Wraps the screen in the admin's own furniture.
 *
 * Payload gives a view it already knows — the dashboard, a collection list —
 * its sidebar and header automatically. A view added at a new address is
 * handed no template at all and renders as a bare page with no way back, so
 * this asks for the same one those views get. `DefaultTemplate` is exported
 * for exactly this.
 *
 * `visibleEntities` is rebuilt rather than passed along: React 19 refuses to
 * assign to the object Payload hands over, and the template writes to it.
 */
export async function TrafficView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props;
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      req={initPageResult.req}
      searchParams={searchParams}
      user={initPageResult.req.user ?? undefined}
      visibleEntities={{
        collections: initPageResult.visibleEntities?.collections,
        globals: initPageResult.visibleEntities?.globals,
      }}
    >
      <TrafficScreen {...props} />
    </DefaultTemplate>
  );
}

async function TrafficScreen({ initPageResult, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult;
  const adminRoute = req.payload.config.routes.admin ?? "/admin";

  const asked = Number(Array.isArray(searchParams?.days) ? searchParams.days[0] : searchParams?.days);
  const days = RANGES.some((range) => range.days === asked) ? asked : 30;

  const sites = await sitesFor(req.user, req.payload);
  const report = await getTrafficReport(req.payload, { days, sites });
  const superAdmin = isSuperAdmin(req.user);

  const viewsChange = change(report.total.views, report.previous.views);
  const perVisit =
    report.total.visits > 0 ? (report.total.views / report.total.visits).toFixed(1) : null;

  return (
    <div className="am-dash">
      <header className="am-dash__head">
        <div>
          <p className="am-dash__eyebrow">
            <IconSpark className="am-dash__eyebrow-icon" />
            Traffic
          </p>
          <h1 className="am-dash__title">How much the site is being read</h1>
          <p className="am-dash__subtitle">
            {superAdmin
              ? "Every country site in the network, and amintl.org."
              : "The country sites you were given."}{" "}
            Nothing here identifies a reader.
          </p>
        </div>
        <nav aria-label="Range" className="am-dash__quick">
          {RANGES.map((range) => (
            <Link
              className={`am-quick${range.days === days ? " am-quick--primary" : ""}`}
              href={`${adminRoute}/traffic?days=${range.days}`}
              key={range.days}
            >
              {range.label}
            </Link>
          ))}
        </nav>
      </header>

      {!report.everRecorded && (
        <section className="am-notice">
          <IconArrow className="am-notice__icon" />
          <div>
            <strong>Nothing has been counted yet.</strong> Counting starts the moment this is
            deployed and someone opens a page — there is no history from before, because nothing
            was measuring. Come back tomorrow and this will have a day in it.
          </div>
        </section>
      )}

      <section className="am-dash__cards">
        <div className="am-stat am-stat--navy am-stat--plain">
          <span className="am-stat__icon">
            <IconPage className="am-stat__glyph" />
          </span>
          <span className="am-stat__value">{report.total.views.toLocaleString("en")}</span>
          <span className="am-stat__label">Page views</span>
          <span className="am-stat__caption">
            {viewsChange ? viewsChange.text : `over the last ${days} days`}
          </span>
        </div>
        <div className="am-stat am-stat--blue am-stat--plain">
          <span className="am-stat__icon">
            <IconSpark className="am-stat__glyph" />
          </span>
          <span className="am-stat__value">{report.total.visits.toLocaleString("en")}</span>
          <span className="am-stat__label">Visits</span>
          <span className="am-stat__caption">someone opening the site and reading a while</span>
        </div>
        <div className="am-stat am-stat--green am-stat--plain">
          <span className="am-stat__icon">
            <IconChart className="am-stat__glyph" />
          </span>
          <span className="am-stat__value">{perVisit ?? "—"}</span>
          <span className="am-stat__label">Pages per visit</span>
          <span className="am-stat__caption">how far people read before leaving</span>
        </div>
      </section>

      <div className="am-dash__grid am-dash__grid--pairs">
        <section className="am-panel am-panel--wide">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">Page views</h2>
              <p className="am-panel__note">
                The last {days} days{perVisit ? `, and ${report.total.visits.toLocaleString("en")} visits` : ""}
              </p>
            </div>
            <span className="am-panel__figure">{report.total.views.toLocaleString("en")}</span>
          </div>
          <TrafficChart points={report.perDay} />
        </section>

        <section className="am-panel">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">Most read</h2>
              <p className="am-panel__note">Pages, busiest first</p>
            </div>
          </div>
          <Bars empty="No pages have been opened yet." rows={report.pages} />
        </section>

        <section className="am-panel">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">
                <IconGlobe className="am-panel__title-icon" />
                Which site
              </h2>
              <p className="am-panel__note">The country site the page was on</p>
            </div>
          </div>
          <Bars
            empty="No country site has been opened yet."
            name={siteName}
            rows={report.sites}
          />
        </section>

        <section className="am-panel">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">Came from</h2>
              <p className="am-panel__note">Where visits arrived from, counted once each</p>
            </div>
          </div>
          <Bars
            empty="Nobody has arrived from another site yet — people are typing the address, or coming from somewhere that hides where it sent them."
            rows={report.referrers}
          />
        </section>

        <section className="am-panel">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">Read in</h2>
              <p className="am-panel__note">Where the reader was, not which site they read</p>
            </div>
          </div>
          <Bars
            empty="No country has been recorded yet. This is filled in by the host, so it stays empty when the site is run anywhere but its live home."
            name={readerCountry}
            rows={report.countries}
          />
        </section>
      </div>
    </div>
  );
}

export default TrafficView;
