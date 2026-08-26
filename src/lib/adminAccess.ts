import type { Access, CollectionConfig, FieldHook } from "payload";

/**
 * Who can edit what in /admin.
 *
 * Two roles. A super admin runs the network and sees everything. A country
 * admin is given a list of country sites and a list of sections, and sees the
 * intersection: the sections they were given, holding only the countries they
 * were given.
 *
 * Read access is the subtle one. The public site reads Pages, Posts, Events
 * and Campuses without logging in, so `read` cannot simply be locked down —
 * it stays open when there is no user and narrows to a tenant filter when
 * there is one. That is what scopes the admin's list views without taking the
 * website offline. (The frontend goes through Payload's Local API, which
 * bypasses access control anyway, so this only governs the admin and the REST
 * API.)
 */

export type Role = "super-admin" | "country-admin";

/** The parts of /admin a country admin can be given. */
export const SECTIONS = [
  "pages",
  "posts",
  "events",
  "campuses",
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
  role?: Role | null;
  tenants?: (number | string | { id: number | string })[] | null;
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
  return asUser(user)?.role === "super-admin";
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
    const ids = tenantIds(user);
    if (ids.length === 0) return false;
    return { tenant: { in: ids } };
  };

  return {
    // Open to the public, narrowed once someone is logged in — see the note
    // at the top of this file.
    read: ({ req: { user } }) => (user ? scoped({ req: { user } } as never) : true),
    create: ({ req: { user } }) =>
      isSuperAdmin(user) || (canUseSection(user, section) && tenantIds(user).length > 0),
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
export const enforceTenantScope: FieldHook = ({ req, value, operation }) => {
  if (operation !== "create" && operation !== "update") return value;
  const user = req.user;
  if (!user || isSuperAdmin(user)) return value;

  const ids = tenantIds(user);
  if (ids.length === 0) return value;

  const chosen = typeof value === "object" && value !== null ? (value as { id: unknown }).id : value;
  if (chosen !== undefined && chosen !== null && ids.some((id) => String(id) === String(chosen))) {
    return value;
  }
  if (ids.length === 1) return ids[0];

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
