import type { Access, CollectionConfig, FieldHook, Where } from "payload";
import { isContinent, type Continent } from "./continents";

/**
 * Who can edit what in /admin.
 *
 * Three roles, each a narrower reach than the one above it.
 *
 *   super admin  runs the network and sees everything.
 *   admin        is given continents, countries, or both, and reaches every
 *                country site inside them — a continent's admin does not have
 *                to be re-granted each country added to it.
 *   sub admin    is given countries only, and reaches exactly those.
 *
 * Whichever role, what they see is the intersection with the sections listed
 * on their account: the parts of the admin they were given, holding only the
 * countries they were given.
 *
 * Read access is the subtle one. The public site reads Pages, Posts, Events
 * and Campuses without logging in, so `read` cannot simply be locked down —
 * it stays open when there is no user and narrows to a tenant filter when
 * there is one. That is what scopes the admin's list views without taking the
 * website offline. (The frontend goes through Payload's Local API, which
 * bypasses access control anyway, so this only governs the admin and the REST
 * API.)
 */

export type Role = "super-admin" | "admin" | "sub-admin";

/**
 * The role name this account was created under before there were three of
 * them. A country admin reached the countries listed on it and nothing else,
 * which is exactly what a sub admin is, so it reads as one rather than
 * needing every existing account rewritten to keep working.
 */
const LEGACY_SUB_ADMIN = "country-admin";

/** The role an account holds, with the old name read as what it now means. */
export function roleOf(user: unknown): Role | null {
  const role = asUser(user)?.role ?? null;
  if (!role) return null;
  return (role === LEGACY_SUB_ADMIN ? "sub-admin" : role) as Role;
}

/** The parts of /admin an admin or sub admin can be given. */
export const SECTIONS = [
  "pages",
  "posts",
  "events",
  "campuses",
  "leaders",
  "tenant-content",
  "media",
  "ministries",
  "bible-study-signups",
  "volunteer-applications",
  "internship-applications",
  "chapter-affiliations",
  "membership-applications",
  "contact-messages",
  "donation-intents",
] as const;

export type Section = (typeof SECTIONS)[number];

/**
 * Sections with no tenant of their own. A country admin given one of these
 * sees every country's records in it, because there is nothing on the record
 * saying which country it belongs to — the forms behind them do not ask.
 * Grant them deliberately.
 */
export const UNSCOPED_SECTIONS = new Set<Section>([
  "media",
  "ministries",
  "bible-study-signups",
  "volunteer-applications",
  "internship-applications",
  "chapter-affiliations",
  "membership-applications",
  "contact-messages",
  "donation-intents",
]);

type UserFields = {
  role?: Role | string | null;
  tenants?: (number | string | { id: number | string })[] | null;
  continents?: string[] | null;
  sections?: string[] | null;
};

/**
 * Payload hands the user through as its generated `User` type, which does not
 * carry these fields until `payload generate:types` has been run against them,
 * and an interface has no implicit index signature to widen it with. Taking
 * `unknown` and narrowing here keeps every call site free of casts and is
 * honest about the fact that the shape is not proven at compile time.
 */
function asUser(user: unknown): UserFields | null {
  return user && typeof user === "object" ? (user as UserFields) : null;
}

export function isSuperAdmin(user: unknown): boolean {
  return roleOf(user) === "super-admin";
}

/** The continents an admin was given. Empty for every other role. */
export function continentsOf(user: unknown): Continent[] {
  const fields = asUser(user);
  if (!fields || roleOf(fields) !== "admin") return [];
  return (fields.continents ?? []).filter((value): value is Continent => isContinent(value));
}

/**
 * The records this person may touch, as a filter, or false for none at all.
 *
 * Two ways to be in reach and either is enough: the country is listed on the
 * account, or its continent is. Records with no country belong to the main
 * site and match neither, which is the point — nobody below a super admin
 * edits amintl.org.
 */
export function tenantScopeWhere(user: unknown): Where | false {
  const ids = tenantIds(user);
  const continents = continentsOf(user);

  const clauses: Where[] = [];
  if (ids.length) clauses.push({ tenant: { in: ids } });
  // Payload reads through the relationship, so a continent needs no list of
  // its countries here and stays right as countries are added to it.
  if (continents.length) clauses.push({ "tenant.continent": { in: continents } });

  if (clauses.length === 0) return false;
  return clauses.length === 1 ? clauses[0] : { or: clauses };
}

/** The tenant ids a user may touch. Empty for a super admin, who is not limited. */
export function tenantIds(user: unknown): (number | string)[] {
  const list = asUser(user)?.tenants ?? [];
  return list.map((entry) => (typeof entry === "object" ? entry.id : entry));
}

export function canUseSection(user: unknown, section: Section): boolean {
  const fields = asUser(user);
  if (!fields) return false;
  if (isSuperAdmin(fields)) return true;
  return (fields.sections ?? []).includes(section);
}

/**
 * Access for a collection whose records name the country they belong to.
 *
 * A country admin is limited to their countries. Records with no tenant belong
 * to the main site, so they are not in `tenant in (…)` and stay out of reach —
 * which is the point: a country admin must not be able to edit amintl.org.
 */
export function tenantScopedAccess(section: Section): CollectionConfig["access"] {
  const scoped: Access = ({ req: { user } }) => {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    if (!canUseSection(user, section)) return false;
    return tenantScopeWhere(user);
  };

  return {
    // Open to the public, narrowed once someone is logged in — see the note
    // at the top of this file.
    read: ({ req: { user } }) => (user ? scoped({ req: { user } } as never) : true),
    create: ({ req: { user } }) =>
      isSuperAdmin(user) ||
      (canUseSection(user, section) && tenantScopeWhere(user) !== false),
    update: scoped,
    delete: scoped,
  };
}

/** Access for a collection that has no tenant field — section membership only. */
export function sectionAccess(
  section: Section,
  { publicRead = false, publicCreate = false } = {},
): CollectionConfig["access"] {
  const gate: Access = ({ req: { user } }) => canUseSection(user, section);
  return {
    read: publicRead ? () => true : gate,
    create: publicCreate ? () => true : gate,
    update: gate,
    delete: gate,
  };
}

/** Hides a collection from the sidebar for anyone not granted that section. */
export function hideUnlessGranted(section: Section) {
  return ({ user }: { user?: unknown }) => !canUseSection(user, section);
}

/**
 * Keeps a country admin from filing a record under a country that is not
 * theirs — including under no country at all, which would put it on the main
 * site. Access control alone does not cover this: it decides which records you
 * may write, not which tenant you may write into them.
 *
 * With exactly one country to their name the field fills itself in, which is
 * the common case and one less thing to get wrong.
 */
export const enforceTenantScope: FieldHook = async ({ req, value, operation }) => {
  if (operation !== "create" && operation !== "update") return value;
  const user = req.user;
  if (!user || isSuperAdmin(user)) return value;

  const ids = tenantIds(user);
  const continents = continentsOf(user);
  if (ids.length === 0 && continents.length === 0) return value;

  const chosen = typeof value === "object" && value !== null ? (value as { id: unknown }).id : value;
  if (chosen !== undefined && chosen !== null) {
    if (ids.some((id) => String(id) === String(chosen))) return value;

    // Named by continent rather than one by one, so which continent this
    // country is in has to be read before the answer is known.
    if (continents.length) {
      const tenant = await req.payload
        .findByID({ collection: "tenants", id: chosen as string | number, depth: 0 })
        .catch(() => null);
      const continent = (tenant as { continent?: string } | null)?.continent;
      if (continent && continents.includes(continent as Continent)) return value;
    }
  }

  // One country to their name and the field fills itself in — the common case
  // for a sub admin, and one less thing to get wrong.
  if (ids.length === 1 && continents.length === 0) return ids[0];

  throw new Error(
    "Choose one of your own country sites. You do not have access to the one selected.",
  );
};

/** Finance and the shape of the network itself: super admins only. */
export const superAdminOnly: CollectionConfig["access"] = {
  read: ({ req: { user } }) => isSuperAdmin(user),
  create: ({ req: { user } }) => isSuperAdmin(user),
  update: ({ req: { user } }) => isSuperAdmin(user),
  delete: ({ req: { user } }) => isSuperAdmin(user),
};

/**
 * Tenants stays publicly readable — the country switcher, the network map and
 * every tenant route resolve through it — but only a super admin can add,
 * rename or remove a country site.
 */
export const tenantsAccess: CollectionConfig["access"] = {
  read: () => true,
  create: ({ req: { user } }) => isSuperAdmin(user),
  update: ({ req: { user } }) => isSuperAdmin(user),
  delete: ({ req: { user } }) => isSuperAdmin(user),
};
