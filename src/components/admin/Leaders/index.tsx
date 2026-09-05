import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import Link from "next/link";

import { isSuperAdmin, tenantIds } from "@/lib/adminAccess";
import { getLeaderCounts, type ContinentCount } from "@/lib/leaderCounts";

/**
 * How many leaders there are, and where.
 *
 * The question this answers is the one that used to need seven emails: how
 * many leaders are there in Asia, in Europe, in Africa — and within each, in
 * which countries. Both numbers are here at once, because the continental
 * figure on its own hides the thing worth knowing, which is that it is usually
 * two or three countries carrying it.
 *
 * Which is why the countries with nobody recorded are on the screen too. A
 * page that showed only the countries with leaders would let a country quietly
 * stay at zero for a year; naming them makes the gap the finding.
 *
 * Scope follows the rest of the admin. A super admin sees the network; anyone
 * else sees the countries they were given, and the totals are of those.
 */

function Bar({ value, of }: { value: number; of: number }) {
  const width = of > 0 ? Math.max(2, Math.round((value / of) * 100)) : 0;
  return (
    <span className="am-leaders__bar" aria-hidden>
      <span className="am-leaders__bar-fill" style={{ width: `${width}%` }} />
    </span>
  );
}

function Continent({ group, most }: { group: ContinentCount; most: number }) {
  return (
    <section className="am-leaders__continent">
      <header className="am-leaders__continent-head">
        <h3>{group.label}</h3>
        <p className="am-leaders__count">
          {group.leaders.toLocaleString("en")}
          <span> {group.leaders === 1 ? "leader" : "leaders"}</span>
        </p>
      </header>

      <ol className="am-leaders__countries">
        {group.countries.map((country) => (
          <li key={country.tenantId}>
            <Link href={`/admin/collections/leaders?where[tenant][equals]=${country.tenantId}`}>
              <span className="am-leaders__country">{country.country}</span>
              <Bar value={country.leaders} of={most} />
              <span className="am-leaders__country-count">{country.leaders}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export async function LeadersView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult;
  const user = req.user;

  const only = isSuperAdmin(user) ? undefined : tenantIds(user).map(String);
  const counts = await getLeaderCounts(req.payload, only);

  // The busiest country anywhere, so every bar on the page is to one scale and
  // continents can be compared against each other rather than each against
  // itself.
  const most = Math.max(
    1,
    ...counts.continents.flatMap((group) => group.countries.map((country) => country.leaders)),
  );

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user ?? undefined}
      visibleEntities={{
        collections: [...(initPageResult.visibleEntities?.collections ?? [])],
        globals: [...(initPageResult.visibleEntities?.globals ?? [])],
      }}
    >
      <div className="am-leaders">
        <header className="am-leaders__head">
          <div>
            <h1>Leaders</h1>
            <p>
              {counts.total.toLocaleString("en")} recorded across{" "}
              {counts.continents.length} {counts.continents.length === 1 ? "continent" : "continents"}.
            </p>
          </div>
          <Link className="am-leaders__all" href="/admin/collections/leaders">
            Open the full list
          </Link>
        </header>

        {counts.total === 0 ? (
          <p className="am-leaders__empty">
            No leaders have been recorded yet. Add them under Leaders and the numbers appear here.
          </p>
        ) : (
          <div className="am-leaders__grid">
            {counts.continents.map((group) => (
              <Continent key={group.label} group={group} most={most} />
            ))}
          </div>
        )}

        {counts.empty.length > 0 && (
          <section className="am-leaders__gaps">
            <h3>No leaders recorded yet</h3>
            <p>
              {counts.empty.length} {counts.empty.length === 1 ? "country has" : "countries have"}{" "}
              a site but nobody on it.
            </p>
            <ul>
              {counts.empty.map((country) => (
                <li key={country.tenantId}>{country.country}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DefaultTemplate>
  );
}
