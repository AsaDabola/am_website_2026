-- Lets the events page be ordered by the list the events came from.
--
-- The events arrived as a list of titles with a bracketed "Dec. 6-7" and no
-- year anywhere. The order of that list is the only thing known about when
-- they happened, so it is what the page is ordered by, and `sortOrder` on the
-- Events collection is where it lives. `startDate` becomes optional for the
-- same reason: an event whose year nobody knows must still be storable, and
-- Payload's Postgres adapter writes a required date as NOT NULL.
--
-- Needed because `push` is development-only: a field added to a collection
-- reaches a local database by itself and never the deployed one, and until it
-- does, every query that selects it fails. See scripts/README.md.
--
-- Verified by pushing the schema into a throwaway database and reading the
-- table back: events gains a nullable numeric sort_order with an index on it,
-- and start_date is nullable. Nothing else about events moves.
--
-- Safe to run more than once. Adds one column and one index, drops nothing.

ALTER TABLE "public"."events"
  ADD COLUMN IF NOT EXISTS "sort_order" numeric;

CREATE INDEX IF NOT EXISTS "events_sort_order_idx"
  ON "public"."events" USING btree ("sort_order");

ALTER TABLE "public"."events"
  ALTER COLUMN "start_date" DROP NOT NULL;
