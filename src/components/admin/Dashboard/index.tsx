import type { AdminViewServerProps } from "payload";
import Link from "next/link";

import { Chart } from "./Chart";
import { getDashboardData } from "./data";
import { CARD_ICON, IconArrow, IconGlobe, IconInbox, IconSpark } from "./icons";

/**
 * The admin's home screen.
 *
 * Payload's own dashboard is a list of every collection, which answers "what
 * is in here" but not "what is going on". This answers the second: how much
 * has been published, what came in through the forms, what was last touched,
 * and how far the network reaches — then still puts the collections one click
 * away underneath.
 *
 * It is a server component and stays one. Everything on it is known at
 * request time, so nothing here needs to be shipped to the browser to run.
 *
 * What appears is what the person looking may open. A sub admin given Events
 * and one country gets an Events card counting that country's events, no
 * Articles card at all, and no sight of the forms they were not granted —
 * every read below goes through Payload's own access control, so the page
 * cannot show a number the list view would then refuse to explain.
 */

export async function Dashboard({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  const adminRoute = req.payload.config.routes.admin ?? "/admin";
  const data = await getDashboardData(req.payload, req.user, adminRoute);

  const number = (value: number | null) =>
    value === null ? "—" : value.toLocaleString("en");

  return (
    <div className="am-dash">
      <header className="am-dash__head">
        <div>
          <p className="am-dash__eyebrow">
            <IconSpark className="am-dash__eyebrow-icon" />
            {data.roleLabel}
          </p>
          <h1 className="am-dash__title">
            Welcome back{data.greetingName ? `, ${data.greetingName}` : ""}
          </h1>
          <p className="am-dash__subtitle">{data.scopeLabel}.</p>
        </div>
        {data.quickLinks.length > 0 && (
          <nav aria-label="Quick actions" className="am-dash__quick">
            {data.quickLinks.map((action, index) => (
              <Link
                className={`am-quick${index === 0 ? " am-quick--primary" : ""}`}
                href={action.href}
                key={action.href}
              >
                {action.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {data.cards.length > 0 && (
        <section className="am-dash__cards">
          {data.cards.map((card) => {
            const Icon = CARD_ICON[card.key] ?? IconSpark;
            return (
              <Link
                className={`am-stat am-stat--${card.tone}`}
                href={card.href}
                key={card.key}
              >
                <span className="am-stat__icon">
                  <Icon className="am-stat__glyph" />
                </span>
                <span className="am-stat__value">{number(card.value)}</span>
                <span className="am-stat__label">{card.label}</span>
                <span className="am-stat__caption">{card.caption}</span>
                <IconArrow className="am-stat__arrow" />
              </Link>
            );
          })}
        </section>
      )}

      <div className="am-dash__grid">
        {data.chart && (
          <section className="am-panel am-panel--wide">
            <div className="am-panel__head">
              <div>
                <h2 className="am-panel__title">{data.chartLabel}</h2>
                <p className="am-panel__note">
                  The last twelve months
                  {data.chartPeak
                    ? ` · busiest was ${data.chartPeak.label}, with ${data.chartPeak.value}`
                    : ""}
                </p>
              </div>
              <span className="am-panel__figure">
                {data.chartTotal.toLocaleString("en")}
              </span>
            </div>
            <Chart points={data.chart} />
          </section>
        )}

        <section className="am-panel">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">
                <IconInbox className="am-panel__title-icon" />
                Coming in
              </h2>
              <p className="am-panel__note">
                Everything people sent through the forms
              </p>
            </div>
            <span className="am-panel__figure">
              {data.inboxTotal.toLocaleString("en")}
            </span>
          </div>
          {data.inbox.length ? (
            <ul className="am-list">
              {data.inbox.map((row) => (
                <li key={row.key}>
                  <Link className="am-list__row" href={row.href}>
                    <span className="am-list__label">{row.label}</span>
                    <span className="am-list__value">{number(row.value)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="am-empty">
              You have not been given any of the forms.
            </p>
          )}
        </section>

        <section className="am-panel">
          <div className="am-panel__head">
            <div>
              <h2 className="am-panel__title">Recently touched</h2>
              <p className="am-panel__note">The newest articles and events</p>
            </div>
          </div>
          {data.activity.length ? (
            <ul className="am-feed">
              {data.activity.map((row) => (
                <li key={row.id}>
                  <Link className="am-feed__row" href={row.href}>
                    <span
                      className={`am-feed__dot am-feed__dot--${row.kind}`}
                    />
                    <span className="am-feed__body">
                      <span className="am-feed__title">{row.title}</span>
                      <span className="am-feed__meta">
                        {row.meta}
                        {row.when ? ` · ${row.when}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="am-empty">Nothing published yet.</p>
          )}
        </section>

        {data.network && (
          <section className="am-panel">
            <div className="am-panel__head">
              <div>
                <h2 className="am-panel__title">
                  <IconGlobe className="am-panel__title-icon" />
                  The network
                </h2>
                <p className="am-panel__note">
                  Country sites being served, by region
                </p>
              </div>
              <span className="am-panel__figure">{data.networkLive}</span>
            </div>
            {data.network.length ? (
              <ul className="am-bars">
                {data.network.map((row) => (
                  <li className="am-bars__row" key={row.label}>
                    <span className="am-bars__label">{row.label}</span>
                    <span className="am-bars__track">
                      <span
                        className="am-bars__fill"
                        style={{ width: `${row.share}%` }}
                      />
                    </span>
                    <span className="am-bars__value">{row.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="am-empty">No country sites are live yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
