-- The traffic counters behind /admin/traffic.
--
-- One row is one number: "on this day, on this country site, this page was
-- opened 41 times". A page view does not add a row, it adds one to the rows
-- that already describe it, so the table stays small however busy the site
-- gets. The unique index on (day, site, kind, label) is what makes that
-- work — without it every view would insert instead of increment, and
-- /api/track's `ON CONFLICT` would have nothing to conflict against.
--
-- Nothing here identifies anybody: no address is stored, no cookie is set,
-- and a "visit" is counted from a flag that lives only in the reader's open
-- tab.
--
-- This table is deliberately NOT a Payload collection, and this file is the
-- only definition of it. Nothing edits these rows — /api/track writes them
-- with an upsert Payload has no equivalent for, and the Traffic screen reads
-- them with aggregates — so the only thing a collection would have added is
-- Payload's requirement that every collection have a column on
-- payload_locked_documents_rels. Deploying that requirement before this file
-- had run took the admin down once: every document you opened, in any
-- collection, went blank, because opening a document writes a lock row
-- through that table. Keeping the table out of the config means the site and
-- the whole admin work exactly the same whether this has run or not — until
-- it does, the Traffic screen simply says nothing has been counted yet.
--
-- If you ran the first version of this file, it also added a `traffic_id`
-- column to payload_locked_documents_rels. That column is now unused and
-- harmless; nothing needs to be undone.
--
-- Run it on your own machine as well as on the deployed database. Payload's
-- `push` builds the tables it knows about, and it does not know about this
-- one.
--
--   psql "$DATABASE_URI" -f scripts/add-traffic.sql
--
-- Safe to run more than once. Adds only; drops nothing.

DO $$ BEGIN
  CREATE TYPE "public"."enum_traffic_kind" AS ENUM ('total', 'page', 'referrer', 'country');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "public"."traffic" (
  "id" serial PRIMARY KEY,
  "day" varchar NOT NULL,
  "site" varchar DEFAULT '' NOT NULL,
  "kind" "public"."enum_traffic_kind" NOT NULL,
  "label" varchar DEFAULT '' NOT NULL,
  "views" numeric DEFAULT 0 NOT NULL,
  "visits" numeric DEFAULT 0 NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- What turns a view into an increment rather than a new row.
CREATE UNIQUE INDEX IF NOT EXISTS "day_site_kind_label_idx"
  ON "public"."traffic" USING btree ("day", "site", "kind", "label");
-- Every read on the Traffic screen is a range of days.
CREATE INDEX IF NOT EXISTS "traffic_day_idx"
  ON "public"."traffic" USING btree ("day");
