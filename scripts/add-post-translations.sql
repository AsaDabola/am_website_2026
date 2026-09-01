-- The translated wording for news articles.
--
-- One row per article per language, holding the translated headline, summary
-- and body. Filled by `npm run translate-posts`; read by the site through
-- src/lib/postTranslations.ts.
--
-- Never required. An article with no row for the language being read falls
-- back to the words it was written in, which is exactly what the site did
-- before any of this existed — so this can be run before or after the code
-- ships, in either order, without a broken page in between.
--
-- Like the traffic counters, this is deliberately NOT a Payload collection.
-- Payload gives every collection a column on payload_locked_documents_rels,
-- and deploying that expectation before the SQL has run blanks every document
-- screen in the admin. It has already happened once. Nothing edits these rows
-- through the admin, so a collection would buy nothing and cost that.
--
-- `source_hash` is a digest of the English the translation was made from. It
-- is how the script knows an article has been edited since, and re-translates
-- only what actually changed rather than the whole catalogue every run.
--
-- Run it on your own machine as well as on the deployed database. Payload's
-- `push` builds the tables it knows about, and it does not know about this one.
--
--   psql "$DATABASE_URI" -f scripts/add-post-translations.sql
--
-- Safe to run more than once. Adds only; drops nothing.

CREATE TABLE IF NOT EXISTS "public"."post_translations" (
  "id" serial PRIMARY KEY,
  "post_id" integer NOT NULL,
  "locale" varchar NOT NULL,
  "title" varchar,
  "excerpt" text,
  "body" jsonb,
  "source_hash" varchar NOT NULL,
  "provider" varchar,
  -- Set by hand when someone corrects a machine translation, so the next run
  -- leaves it alone rather than overwriting the correction.
  "edited" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- One translation per article per language; what makes the script's upsert an
-- update rather than a pile of duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS "post_translations_post_locale_idx"
  ON "public"."post_translations" USING btree ("post_id", "locale");

-- Every read is "these articles, this language".
CREATE INDEX IF NOT EXISTS "post_translations_locale_idx"
  ON "public"."post_translations" USING btree ("locale");

-- A translation of a deleted article is nothing, so it goes with it.
DO $$ BEGIN
  ALTER TABLE "public"."post_translations"
    ADD CONSTRAINT "post_translations_post_id_fk"
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
