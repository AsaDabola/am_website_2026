-- The translated wording for the sections a page is built from.
--
-- The site's built-in pages take their words from messages/*.json, which is
-- translated into all forty-eight languages. Rebuilding one of those pages out
-- of editable sections would replace that with whatever English is typed into
-- the block — and on sixty-eight country sites read in forty-seven languages,
-- that is a regression, not a feature.
--
-- This is what stops it. One row per page per language, holding the translated
-- value of every text field on every section of that page. A page with no row
-- for the language being read falls back to the words the section was written
-- in, so this can be run before or after the code ships, in either order,
-- without a broken page in between.
--
-- `values` is a map from a field's address to its translation:
--
--   {"<block id>.heading": "…", "<block id>.cards.<row id>.title": "…"}
--
-- Addressed by the ids Payload gives each block and each array row rather than
-- by position, so dragging a section into a different place — the whole point
-- of the page builder — does not shuffle the translations underneath it. A
-- value is usually a string; for a rich text field it is the whole translated
-- document, which is why the column is jsonb rather than text.
--
-- `source_hash` is a digest of the English it was translated from, so a second
-- run re-translates only what has actually been edited. `edited` is set by
-- hand when someone corrects a machine translation, and stops the next run
-- overwriting the correction. Both work exactly as they do for articles.
--
-- Like post_translations and the traffic counters, this is deliberately NOT a
-- Payload collection. Payload gives every collection a column on
-- payload_locked_documents_rels, and deploying that expectation before the SQL
-- has run blanks every document screen in the admin. It has happened once.
-- Nothing edits these rows through the admin, so a collection would buy
-- nothing and cost that.
--
-- Run it on your own machine as well as on the deployed database. Payload's
-- `push` builds the tables it knows about, and it does not know about this one.
--
--   node scripts/run-sql.mjs scripts/add-page-translations.sql
--
-- Safe to run more than once. Adds only; drops nothing.

CREATE TABLE IF NOT EXISTS "public"."page_translations" (
  "id" serial PRIMARY KEY,
  "page_id" integer NOT NULL,
  "locale" varchar NOT NULL,
  "values" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "source_hash" varchar NOT NULL DEFAULT '',
  "provider" varchar,
  "edited" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- One translation per page per language; what makes the upsert an update
-- rather than a pile of duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS "page_translations_page_locale_idx"
  ON "public"."page_translations" USING btree ("page_id", "locale");

-- Every read is "this page, this language".
CREATE INDEX IF NOT EXISTS "page_translations_locale_idx"
  ON "public"."page_translations" USING btree ("locale");

-- A translation of a deleted page is nothing, so it goes with it.
DO $$ BEGIN
  ALTER TABLE "public"."page_translations"
    ADD CONSTRAINT "page_translations_page_id_fk"
    FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
