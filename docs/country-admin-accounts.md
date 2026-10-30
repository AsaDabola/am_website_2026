# One sign-in per country

Every country site can have its own account in `/admin`, holding that country
and nothing else. This page is how to create them, what they can and cannot
reach, and the two things to settle before handing them out.

## Creating them

The accounts are created by an endpoint, not by hand — 68 accounts typed into
the Users screen is 68 chances to mis-set a country.

1. Sign in to `/admin` as a **super admin**. Nobody else can run this; the
   endpoint answers 403.
2. Visit `/api/provision-country-admins`. This is the dry run: it lists the
   addresses it would create and writes nothing.
3. To create them, open the browser console on that same tab and run:

   ```js
   fetch('/api/provision-country-admins', { method: 'POST' })
     .then((r) => r.json())
     .then((d) => {
       const a = document.createElement('a');
       a.href = URL.createObjectURL(new Blob([d.csv], { type: 'text/csv' }));
       a.download = 'am-country-admins.csv';
       a.click();
     });
   ```

   That downloads `country,email,password` for every account created.

**The passwords exist in readable form once.** Payload stores a hash, so that
CSV is the only copy; losing it means resetting a password, not recovering
one. Keep it somewhere a password manager would be kept, and delete it from
the Downloads folder once the credentials are handed over.

Re-running is safe. Any address that already has an account is skipped rather
than reissued — a second run must not lock someone out of their own site. So
after adding a country to `src/lib/countrySites.ts` and re-seeding the
tenants, run it again and only the new country is created.

### Addresses

The address comes from the tenant's own slug at `amintl.org` —
`germany@amintl.org`, `united-states@amintl.org`. `?domain=example.org` puts
them on another domain; pass it on the dry run first, so the list can be read
before anything is created.

## What these accounts can reach

The role is `sub-admin`, carrying one tenant. The sections granted are:

    pages · posts · events · campuses · leaders · tenant-content · media

So each account edits its own country's pages, news, events, campuses, leaders
and site wording, and sees no other country's entries in any of them.

They **cannot**:

- read, edit or delete another country's records in any of those six;
- edit anything on the main site, `amintl.org` itself — those records carry no
  tenant, so they match nobody's scope but a super admin's;
- file a record under another country. The create hook writes their own tenant
  into it regardless of what the form asked for;
- create, edit or delete any account, including their own role;
- edit any tenant record — the country's name, address, contact email and
  org name stay with a super admin;
- see the submissions: contact messages, donation intents, and the bible
  study, volunteer, internship, chapter and membership applications.

That last one is deliberate and worth knowing. Those records have no country
on them — the forms behind them do not ask — so granting a country admin one
of those sections would show them **every** country's submissions, people's
names and addresses included. If a national office needs its own enquiries,
that needs a country on the form first. Until then, grant it to one account at
a time, knowingly.

### The media library works the other way round

Every other section hides other countries' records. Media cannot, because an
image is a building material rather than a country's own work: the main site's
logos, photography and PDFs are what a country page is assembled from, so a
library narrowed to your own uploads would be an empty picker and nothing to
build with.

So the whole library stays visible and usable to everyone, and only changing it
is scoped. A country admin can upload, and can rename or delete what they
uploaded. The main site's files and other countries' files are theirs to use
and not to touch. A file with no country on it belongs to the main site, which
is every file that existed before uploads remembered a country.

## Two things to settle first

**These are login identities, not mailboxes.** Creating
`germany@amintl.org` here does not create an inbox at that address. Until one
exists, "Forgot password" sends mail nowhere, so the credentials have to be
handed over directly and a reset means a super admin setting a new password in
`/admin`. Creating the mailboxes in the mail provider — or using addresses the
country teams already have — fixes that.

**Seed the tenants first.** The endpoint creates one account per *active*
tenant, so a country with no tenant row gets no account.
`POST /api/seed-tenants` as a super admin creates them from
`src/lib/countrySites.ts`.
