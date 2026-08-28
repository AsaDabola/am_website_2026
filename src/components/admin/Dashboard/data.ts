import type { Payload, Where } from "payload";

import { CONTINENT_LABELS, isContinent } from "@/lib/continents";
import {
  UNSCOPED_SECTIONS,
  canUseSection,
  continentsOf,
  isSuperAdmin,
  roleOf,
  tenantIds,
  tenantScopeWhere,
  type Section,
} from "@/lib/adminAccess";

/**
 * Everything the dashboard puts on screen, read in one pass.
 *
 * Two rules run through all of it. Nothing is counted that the person looking
 * cannot open — a sub admin given Events and one country sees that country's
 * events and no card for anything else — and nothing here may take the page
 * down: every read is allowed to fail on its own and comes back null, which
 * draws as a dash rather than an error screen.
 */

export type Scope = { granted: boolean; where?: Where };

/**
 * Whether this person reaches a section at all, and the filter that narrows it
 * to their own countries.
 *
 * The filter is worked out here for the few reads that need it by hand; the
 * counts and listings below ask Payload to apply access control itself, so the
 * two can never disagree about what someone is allowed to see.
 */
export function scopeFor(user: unknown, section: Section): Scope {
  if (isSuperAdmin(user)) return { granted: true };
  if (!canUseSection(user, section)) return { granted: false };
  if (UNSCOPED_SECTIONS.has(section)) return { granted: true };

  const where = tenantScopeWhere(user);
  if (where === false) return { granted: false };
  return { granted: true, where };
}

type Reader = { payload: Payload; user: unknown };

async function count(
  { payload, user }: Reader,
  collection: string,
  where?: Where,
): Promise<number | null> {
  try {
    const { totalDocs } = await payload.count({
      collection: collection as never,
      overrideAccess: false,
      user: user as never,
      where,
    });
    return totalDocs;
  } catch {
    return null;
  }
}

type Doc = Record<string, unknown> & { id: number | string };

async function find(
  { payload, user }: Reader,
  collection: string,
  options: {
    limit?: number;
    sort?: string;
    where?: Where;
    depth?: number;
    /**
     * The columns to read. Worth naming: an article carries its whole body,
     * and the two reads below want a date and a title. Without this the
     * dashboard would pull every word of every article on the site to draw a
     * twelve-bar chart.
     */
    select?: Record<string, true>;
  } = {},
): Promise<Doc[]> {
  try {
    const { docs } = await payload.find({
      collection: collection as never,
      depth: options.depth ?? 0,
      limit: options.limit ?? 5,
      overrideAccess: false,
      pagination: false,
      select: options.select as never,
      sort: options.sort,
      user: user as never,
      where: options.where,
    });
    return docs as Doc[];
  } catch {
    return [];
  }
}

export type StatCard = {
  key: string;
  label: string;
  value: number | null;
  /** The line under the number: what the number is made of. */
  caption: string;
  href: string;
  tone: "navy" | "blue" | "green" | "amber" | "violet";
};

export type InboxRow = {
  key: string;
  label: string;
  value: number | null;
  href: string;
};

export type ActivityRow = {
  id: string;
  title: string;
  meta: string;
  when: string | null;
  href: string;
  kind: "post" | "event" | "page";
};

export type ChartPoint = { label: string; value: number };

export type BarRow = { label: string; value: number; share: number };

export type DashboardData = {
  greetingName: string | null;
  roleLabel: string;
  scopeLabel: string;
  cards: StatCard[];
  inbox: InboxRow[];
  inboxTotal: number;
  activity: ActivityRow[];
  /**
   * Null when the person looking has not been given Articles: a chart of
   * twelve empty months says nothing except that they cannot see it.
   */
  chart: ChartPoint[] | null;
  chartTotal: number;
  chartLabel: string;
  /** The busiest month in the twelve, for the line under the heading. */
  chartPeak: { label: string; value: number } | null;
  /** The whole network, so only a super admin is shown it. */
  network: BarRow[] | null;
  networkLive: number;
  networkTotal: number;
  quickLinks: { label: string; href: string }[];
};

const ROLE_LABEL: Record<string, string> = {
  "super-admin": "Super admin",
  admin: "Admin",
  "sub-admin": "Sub admin",
};

/** The last twelve months, oldest first, as year-month keys. */
function lastTwelveMonths(now: Date): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  for (let back = 11; back >= 0; back--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    months.push({
      key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
      label: date.toLocaleString("en", { month: "short", timeZone: "UTC" }),
    });
  }
  return months;
}

function monthKey(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

function asDate(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function getDashboardData(
  payload: Payload,
  user: unknown,
  adminRoute: string,
): Promise<DashboardData> {
  const reader: Reader = { payload, user };
  const link = (path: string) => `${adminRoute}${path}`;

  const posts = scopeFor(user, "posts");
  const events = scopeFor(user, "events");
  const pages = scopeFor(user, "pages");
  const campuses = scopeFor(user, "campuses");
  const media = scopeFor(user, "media");
  const wording = scopeFor(user, "tenant-content");
  const superAdmin = isSuperAdmin(user);

  const inboxSections: { section: Section; label: string; slug: string }[] = [
    { section: "contact-messages", label: "Contact messages", slug: "contact-messages" },
    { section: "bible-study-signups", label: "Bible study sign-ups", slug: "bible-study-signups" },
    { section: "volunteer-applications", label: "Volunteer applications", slug: "volunteer-applications" },
    { section: "internship-applications", label: "Internship applications", slug: "internship-applications" },
    { section: "membership-applications", label: "Membership applications", slug: "membership-applications" },
    { section: "chapter-affiliations", label: "Chapter affiliations", slug: "chapter-affiliations" },
  ];
  const visibleInbox = inboxSections.filter(({ section }) => scopeFor(user, section).granted);

  const [
    postCount,
    eventCount,
    pageCount,
    campusCount,
    mediaCount,
    wordingCount,
    tenantDocs,
    postDates,
    recentPosts,
    recentEvents,
    inboxCounts,
  ] = await Promise.all([
    posts.granted ? count(reader, "posts") : Promise.resolve(null),
    events.granted ? count(reader, "events") : Promise.resolve(null),
    pages.granted ? count(reader, "pages") : Promise.resolve(null),
    campuses.granted ? count(reader, "campuses") : Promise.resolve(null),
    media.granted ? count(reader, "media") : Promise.resolve(null),
    wording.granted ? count(reader, "tenant-content") : Promise.resolve(null),
    // Tenants are readable by everyone — the country switcher and the network
    // map both need them — so this is the same list whoever is looking.
    find(reader, "tenants", {
      limit: 0,
      sort: "country",
      select: { country: true, continent: true, active: true },
    }),
    // One read, bucketed in memory, rather than twelve counts down the wire.
    posts.granted
      ? find(reader, "posts", { limit: 0, sort: "-publishedDate", select: { publishedDate: true } })
      : Promise.resolve([]),
    posts.granted
      ? find(reader, "posts", {
          limit: 4,
          sort: "-publishedDate",
          select: { title: true, category: true, publishedDate: true },
        })
      : Promise.resolve([]),
    events.granted
      ? find(reader, "events", {
          limit: 4,
          sort: "sortOrder",
          select: { title: true, location: true, dateLabel: true, startDate: true },
        })
      : Promise.resolve([]),
    Promise.all(visibleInbox.map(({ slug }) => count(reader, slug))),
  ]);

  const cards: StatCard[] = [];
  if (posts.granted) {
    cards.push({
      key: "posts",
      label: "Articles",
      value: postCount,
      caption: "news, editorials and photo stories",
      href: link("/collections/posts"),
      tone: "navy",
    });
  }
  if (events.granted) {
    cards.push({
      key: "events",
      label: "Events",
      value: eventCount,
      caption: "conferences, outreaches and gatherings",
      href: link("/collections/events"),
      tone: "blue",
    });
  }
  if (pages.granted) {
    cards.push({
      key: "pages",
      label: "Pages",
      value: pageCount,
      caption: "every page of the site, editable",
      href: link("/collections/pages"),
      tone: "violet",
    });
  }
  if (campuses.granted) {
    cards.push({
      key: "campuses",
      label: "Chapters",
      value: campusCount,
      caption: "campuses on the network map",
      href: link("/collections/campuses"),
      tone: "green",
    });
  }
  if (media.granted) {
    cards.push({
      key: "media",
      label: "Photographs",
      value: mediaCount,
      caption: "in the shared media library",
      href: link("/collections/media"),
      tone: "amber",
    });
  }
  if (wording.granted) {
    cards.push({
      key: "wording",
      label: "Wording changes",
      value: wordingCount,
      caption: "phrases rewritten for a country",
      href: link("/collections/tenant-content"),
      tone: "blue",
    });
  }

  const inbox: InboxRow[] = visibleInbox.map((entry, index) => ({
    key: entry.slug,
    label: entry.label,
    value: inboxCounts[index] ?? null,
    href: link(`/collections/${entry.slug}`),
  }));
  const inboxTotal = inbox.reduce((sum, row) => sum + (row.value ?? 0), 0);

  const months = lastTwelveMonths(new Date());
  const buckets = new Map(months.map((month) => [month.key, 0]));
  for (const post of postDates) {
    const key = monthKey(post.publishedDate);
    if (key && buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const chart: ChartPoint[] = months.map((month) => ({
    label: month.label,
    value: buckets.get(month.key) ?? 0,
  }));
  const chartTotal = chart.reduce((sum, point) => sum + point.value, 0);
  const chartPeak = chart.reduce<ChartPoint | null>(
    (best, point) => (point.value > (best?.value ?? 0) ? point : best),
    null,
  );

  const activity: ActivityRow[] = [
    ...recentPosts.map((post) => ({
      id: `post-${post.id}`,
      title: text(post.title, "Untitled article"),
      meta: text(post.category, "Article"),
      when: asDate(post.publishedDate),
      href: link(`/collections/posts/${post.id}`),
      kind: "post" as const,
    })),
    ...recentEvents.map((event) => ({
      id: `event-${event.id}`,
      title: text(event.title, "Untitled event"),
      meta: text(event.location, "Event"),
      when: text(event.dateLabel, "") || asDate(event.startDate),
      href: link(`/collections/events/${event.id}`),
      kind: "event" as const,
    })),
  ].slice(0, 8);

  // Country sites by continent. `active` is what decides whether a site is
  // being served, so the bar reads as "live", not "on the list".
  const byContinent = new Map<string, number>();
  let networkLive = 0;
  for (const tenant of tenantDocs) {
    if (tenant.active === false) continue;
    networkLive += 1;
    const continent = text(tenant.continent, "Elsewhere");
    byContinent.set(continent, (byContinent.get(continent) ?? 0) + 1);
  }
  const biggest = Math.max(1, ...byContinent.values());
  const network: BarRow[] = [...byContinent.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      // The stored value is a slug — "northamerica" — and the wording for it
      // is already written once, beside the select field that offers it.
      label: isContinent(key) ? CONTINENT_LABELS[key] : key,
      value,
      share: Math.round((value / biggest) * 100),
    }));

  const quickLinks: { label: string; href: string }[] = [];
  if (posts.granted) quickLinks.push({ label: "Write an article", href: link("/collections/posts/create") });
  if (events.granted) quickLinks.push({ label: "Add an event", href: link("/collections/events/create") });
  if (pages.granted) quickLinks.push({ label: "Edit a page", href: link("/collections/pages") });
  if (media.granted) quickLinks.push({ label: "Upload photographs", href: link("/collections/media/create") });
  if (superAdmin) quickLinks.push({ label: "Country sites", href: link("/collections/tenants") });
  if (superAdmin) quickLinks.push({ label: "People with access", href: link("/collections/users") });

  const names = tenantIds(user).length;
  const continents = continentsOf(user);
  const scopeLabel = superAdmin
    ? `${networkLive} country ${networkLive === 1 ? "site" : "sites"} across the network`
    : [
        continents.length
          ? `${continents.length} ${continents.length === 1 ? "continent" : "continents"}`
          : null,
        names ? `${names} country ${names === 1 ? "site" : "sites"}` : null,
      ]
        .filter(Boolean)
        .join(" and ") || "no country sites yet";

  // Accounts are identified by email address — there is no name field on
  // Users — so there is usually nobody to greet by name. Rather than invent
  // one out of the address, the greeting simply drops the name when there is
  // none, and picks it up by itself if a name is ever added.
  const account = user as { name?: string } | null;
  const greetingName = text(account?.name, "").split(" ")[0] || null;

  return {
    greetingName,
    roleLabel: ROLE_LABEL[roleOf(user) ?? ""] ?? "Editor",
    scopeLabel,
    cards,
    inbox,
    inboxTotal,
    activity,
    chart: posts.granted ? chart : null,
    chartTotal,
    chartLabel: "Articles published",
    chartPeak,
    network: superAdmin ? network : null,
    networkLive,
    networkTotal: tenantDocs.length,
    quickLinks,
  };
}
