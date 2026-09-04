# Database scripts

## The problem these exist to solve

Payload's `push: true` in `src/payload.config.ts` is **development-only**. The
Postgres adapter gates it on `NODE_ENV !== 'production'`, so it never runs on
Vercel, whatever the setting suggests.

That means: **a field added to a collection creates its column on your machine
and never on the deployed database.** And the failure is silent, because every
query in this codebase is wrapped in a `catch` that falls back to defaults —
`fetchCollectionSafely`, `getActiveTenantRows`, `getPostsList` and the rest. A
missing column does not produce an error page. It produces an empty country
switcher, an empty news feed, "chapters coming soon" on every site.

So whenever you add or rename a field, you also have to add its column to the
deployed database. These scripts are how.

## Adding a field: the whole procedure

1. Add the field to the collection as normal.

2. Start a throwaway Postgres and let Payload build the schema it now wants:

   ```bash
   createdb scratch
   POSTGRES_URL='postgres://localhost/scratch' node --import tsx scripts/push-schema.mts
   ```

3. See exactly what is missing from the deployed database:

   ```bash
   POSTGRES_URL='postgres://localhost/scratch' node scripts/inventory-schema.mjs > /tmp/wanted.txt
   POSTGRES_URL='<the Vercel connection string>' node scripts/inventory-schema.mjs > /tmp/live.txt
   diff /tmp/live.txt /tmp/wanted.txt
   ```

   Lines only in `wanted.txt` are the drift.

4. **Generate** the DDL rather than writing it:

   ```bash
   SOURCE_URL='postgres://localhost/scratch' \
   TARGET_URL='<the Vercel connection string>' \
     node scripts/generate-catchup-sql.mjs > scripts/add-your-feature.sql
   ```

   It asks Postgres for the definition of everything the deployed database is
   missing — tables with their keys and indexes, enum types, and columns on
   tables that already exist — and makes every statement safe to run twice.
   It only ever adds: no `DROP`, no `ALTER TYPE`, no change to a column that
   already exists, so a rename shows up as a new column and removing the old
   one stays a deliberate decision.

   This exists because step 4 used to be a person typing DDL from a diff, and
   that is how both of the outages below happened. One page-builder block is
   25 tables, 111 types and 500-odd columns; that is not a thing to hand-write.

   Read the generated file before running it, and **still verify it** — a
   generator has bugs too, and step 5 is what finds them. (It found one:
   `pg_dump -t` dumps a table without the enum types its columns are declared
   as, so the first version of the file failed on its own first statement.)

5. **Verify it.** Apply it to a *second* scratch database holding the old
   schema, twice, and confirm the result matches the pushed one:

   ```bash
   createdb -T old patched
   POSTGRES_URL='postgres://localhost/patched' node scripts/run-sql.mjs scripts/add-your-feature.sql
   POSTGRES_URL='postgres://localhost/patched' node scripts/run-sql.mjs scripts/add-your-feature.sql  # must also succeed
   pg_dump --schema-only --no-owner --no-privileges patched > /tmp/patched.sql
   pg_dump --schema-only --no-owner --no-privileges scratch > /tmp/pushed.sql
   diff /tmp/patched.sql /tmp/pushed.sql   # only pg_dump's own \restrict nonce,
                                           # and possibly a column's position
   ```

   Run it twice on purpose: "safe to run twice" is a claim, and a half-applied
   file that cannot be re-run is worse than one that never ran. `ADD CONSTRAINT
   ... PRIMARY KEY` was the one that caught this out — a second primary key
   raises `invalid_table_definition`, which a blanket `EXCEPTION WHEN
   duplicate_object` does not catch.

   This is not optional ceremony. Payload's adapter cares about exact table and
   column names — `shareWithContinents` becomes a table called
   `posts_share_with_continents` with a column called `value` of a generated
   enum type — and a guess at that shape fails in the same silent way the
   missing column did.

6. Apply it to the deployed database:

   ```bash
   POSTGRES_URL='<the Vercel connection string>' node scripts/run-sql.mjs scripts/your-file.sql
   ```

7. Regenerate the committed snapshot so the next person can diff against it
   without any of the above:

   ```bash
   POSTGRES_URL='postgres://localhost/scratch' node scripts/inventory-schema.mjs > scripts/schema.expected.txt
   ```

## Checking for drift at any time

`scripts/schema.expected.txt` is the schema the current collections describe.
To find out what a database is missing, one command:

```bash
POSTGRES_URL='<connection string>' node scripts/inventory-schema.mjs | diff - scripts/schema.expected.txt
```

Anything shown as only in `schema.expected.txt` is a column the code will
select and the database does not have — which is to say, a feature that is
quietly switched off.

## A blank screen in /admin

A list view that renders the sidebar and nothing else is a missing column.
Payload selects every field of the collection, Postgres rejects the query, and
the page has no error to show you. To find out which collection and which
column, without reading a schema diff:

### When it is every screen, not one

If the blank screen is a **document** rather than a list — the list works, you
click a row, and the content area is empty — and it happens in every
collection, look at `payload_locked_documents_rels` rather than at any one
collection. Opening a document writes a lock row through that table, and
Payload gives it one column per collection, so a single missing column there
breaks every document in the admin at once.

This happened: adding a collection and deploying before its SQL had run took
out every edit screen on the live site. That is the reason the `traffic` table
is not a Payload collection — nothing edits those rows, so being one bought
nothing and cost that. See the header of `add-traffic.sql`.

The general rule it leaves behind: **a new collection cannot be deployed before
its SQL has run.** Not "the new feature will be switched off until you run it" —
the admin will not open a document in any collection. Run the SQL first.

### What "switched off until you run it" actually costs

Worth knowing precisely, because the answer is different for the site and for
the admin, and guessing at it is how the outage above happened. Measured for
`add-page-builder.sql`, with the code deployed and the SQL not run:

| | Without the SQL |
| --- | --- |
| The site | Fine. Every page answers 200 and renders its coded version; the authored sections are simply absent. `getRouteLayout` catches and returns null. |
| Pages, in the admin | **Broken.** The list and every document fail — Payload selects `pages.layout_mode`, which is not there. |
| Every other collection | Fine. Posts, Events, Tenants and the rest all open. |

That last row is the difference from the outage. This adds fields to a
collection that already exists, not a new collection, so
`payload_locked_documents_rels` is untouched and the admin does not go down as
a whole. Running the SQL fixes the Pages screen immediately, with no redeploy.

Still: **run the SQL first.** "Only one admin screen is down" is a smaller
accident, not an acceptable one.

```bash
POSTGRES_URL='<connection string>' node scripts/probe-collections.mjs
```

It is the drift diff above, grouped by the screen each gap breaks:

```
FAIL  Pages  (1)
FAIL  Country copy  (8)

Pages:
  column pages_blocks_get_involved_cards.description does not exist
```

Read-only, and safe against the deployed database — two SELECTs against
`information_schema`. Exits non-zero if anything is missing, so it works in a
deploy check.

Plain `.mjs` with no Payload import, on purpose. Asking Payload the same
question means loading its config through a TypeScript loader, and
`payload/dist/bin/loadEnv.js` destructures a CommonJS default export that comes
back undefined under tsx — the diagnostic then fails for a reason that has
nothing to do with the database you came to inspect.

## The files

| File | What it does |
| --- | --- |
| `push-schema.mts` | Boots Payload in development so `push` builds the schema. **Never point at production.** |
| `inventory-schema.mjs` | Read-only. Prints every table, column and enum, for diffing. |
| `generate-catchup-sql.mjs` | Read-only. Writes the idempotent, additive DDL that brings one database up to another. Use it instead of writing migration SQL by hand. |
| `probe-collections.mjs` | Read-only. Names the collection whose admin screen each missing column breaks. |
| `schema.expected.txt` | Committed snapshot of what the collections currently describe. |
| `run-sql.mjs` | Applies a `.sql` file to the database in `POSTGRES_URL`. |
| `fix-tenants-schema.sql` | Adds `tenants.languages` and the other early missing columns. |
| `fix-tenant-footer-columns.sql` | Adds `tenants.org_name`, `address`, `contact_email`. |
| `add-continent-syndication.sql` | Adds the `shareWithContinents` tables for Posts and Events. |
| `catch-up-missing-collections.sql` | The big one. Four whole collections and 40 locale values that never reached the deployed database. |
| `add-internship-applications.sql` | Adds the Internship Applications collection. |
| `add-get-involved-card-description.sql` | Adds `description` to the Get Involved cards, and the message keys it introduced. |
| `add-admin-roles.sql` | Adds roles and per-country permissions to Users. **Run this before deploying the access rules** — without it nobody can sign in to /admin. |
| `add-traffic.sql` | Creates the `traffic` counter table behind /admin/traffic. Not a Payload collection, so `push` will not build it — run this locally as well as on the deployed database. Safe to deploy the code without it; the screen just says nothing has been counted yet. |
| `add-post-translations.sql` | Creates the `post_translations` table holding each article in each language. Not a Payload collection either, so run it locally too. Safe to deploy the code without it; articles just read in the language they were written in. |
| `add-page-builder.sql` | The page builder: 25 block tables, 111 types, and `pages.layout_mode`. Generated by `generate-catchup-sql.mjs`. **Run it before deploying** — see below. |
| `translate-posts.mjs` | Fills that table from a translation provider. Resumable, priced before it runs, and skips anything already done. See below. |
| `translate-messages.mjs` | Fills in the site's own wording — `messages/*.json` — in every language. Run it after changing an English string, having first deleted that key from the other locale files. See below. |
| `lib/translate.mjs` | The three translation providers, shared by both of the above so they cannot drift apart. |
| `copy-flags.mjs` | Copies country flag SVGs into `public/flags`. |
| `import-article-images.mjs` | Attaches an archive of article photographs to the posts already in the CMS. Dry-run by default. See below. |

## Importing the article image archive

The photographs for the back catalogue do **not** belong in `public/images`.
That folder is committed, so git would keep every one of them for good, and
they would ship inside every deployment. They belong in the `media` collection,
which puts them in Vercel Blob and generates the thumbnail, card and hero sizes
the site actually serves.

`import-article-images.mjs` does that. Run it with:

```bash
npm run import-images
```

It asks four questions — the folder, the website address, your admin email and
password — shows you what it found, and waits for a yes before uploading
anything:

```
Here is what I found:

  412 photos will become the main picture of an article.
  180 extra photos of those same articles will be uploaded, ready to use.
    6 could be one of two articles, so I left them alone.
   14 did not match any article, so I left them alone.

Upload 592 photos to https://… now? (yes/no)
```

It expects the archive laid out by date and named by article —
`2019/07/summer-retreat-in-busan.webp` — and matches each file against the
posts published that month, comparing the words in the filename with the words
in the headline. A match has to be good on its own *and* clearly ahead of the
runner-up, so two articles in one month with similar headlines are left alone
rather than guessed at. `import-manifest.csv` lists every file and what
happened to it.

Safe to stop and re-run: uploads are recorded in `import-state.json` and
skipped next time, so a second run retries only what failed. A post that
already has a cover image keeps it.

It goes over the REST API rather than booting Payload, for the reason at the
top of this file: a custom script that imports the TypeScript config under
`tsx` dies in `loadEnv`. That also means it runs against whichever server you
point it at — localhost to try it, the live address to do it for real.

Flags, if wanted: `--limit 20` to trial a handful, `--concurrency` for how many
upload at once, `--replace-covers` to overwrite covers that already exist,
`--root` to skip the first question.

One thing it deliberately does not do: an article with several photographs gets
the best-matching one as its `coverImage`, and the rest are uploaded and listed
in the manifest but not placed. `coverImage` holds one image; the others belong
in the article body, and where they go in the prose is an editorial decision.

## A note on connection strings

`vercel env pull` redacts variables marked sensitive, so a pulled `.env` can
contain the literal text `[SENSITIVE]` instead of a connection string. Both
scripts here reject that up front rather than letting it fail later as a DNS
error. Copy the real value from the Vercel dashboard under
Storage → your database → connection string.

## Translating the news articles

The articles are written in one language. The site is read in forty-seven.
`translate-posts.mjs` fills in the rest — headline, summary and body — into
the `post_translations` table, which the site reads through
`src/lib/postTranslations.ts`.

```bash
psql "$DATABASE_URI" -f scripts/add-post-translations.sql   # once, per database
npm run translate-posts -- --dry-run                        # what it would cost
npm run translate-posts                                     # do it
```

You need a provider and a key in `.env.local`:

```
TRANSLATE_PROVIDER=google      # or: deepl
TRANSLATE_API_KEY=...
```

Both bill roughly $20 per million characters, and the script prices the job
and asks before spending anything. It is resumable: each translation records a
digest of the English it was made from, so a second run does nothing except
pick up articles that are new or have been edited. Stop it with ctrl-C and
start it again and it carries on.

`--locales fr,de,ko` narrows it to particular languages, `--limit 25` to the
newest articles. Doing the languages that matter most first costs the same in
total and gets those country sites readable sooner.

**Correcting a translation.** Set `edited = true` on the row and the script
will never overwrite it — which matters for the doctrinal wording, where a
machine translation of a testimony or a statement of faith wants a human eye.

Two things it cannot do. A couple of the site's languages are not offered by
either provider (Fiji Hindi and Romansh, at the time of writing); the script
names them at startup and those articles stay in the language they were
written in. And it translates from the article's source language, so an
article authored on a country site in its own language should be run with that
language as the source rather than assumed to be English.

## Translating the site's own wording

The articles are one thing; the site's fixed text is another. Headings,
buttons, labels and the hero headlines live in `messages/en.json` and are
translated into the forty-seven files beside it. `src/i18n/request.ts` layers
each locale over English, so **a key missing from a locale falls back to
English** rather than showing a variable name — which is what makes this safe
to run in pieces.

```bash
npm run translate-messages -- --dry-run          # what it would cost
npm run translate-messages -- --keys Home.Hero   # just the hero
npm run translate-messages                       # everything missing
```

It uses the same `TRANSLATE_PROVIDER` and `TRANSLATE_API_KEY` as the article
translator, and defaults to `openai`.

**The case it exists for.** Changing a line of English leaves forty-seven
files still holding the *old* sentence, and because a present key wins over
English, every country site goes on showing the line you just replaced. That
is worse than showing the new one untranslated. So the procedure is:

1. Change the string in `messages/en.json`.
2. Delete that key from every other `messages/*.json`.
3. Run this to fill it back in.

Between 2 and 3 the site is correct everywhere, in English on the country
sites. That is the intended intermediate state, not a broken one.

**Marking a word for colour.** The hero headline picks one word out in blue,
written as a tag inside the string: `As the Father <hl>Sent</hl> Christ`. A
position could not survive translation — Korean and Arabic put that word
somewhere else in the sentence — so the tag travels with the word, and the
provider is told to keep it around whichever word carries the meaning.
`HeroSlides` splits on the tag; nothing is ever rendered as markup, so a stray
angle bracket in someone's copy is text rather than a hole.
