-- Lets the admin list the pages the site builds in code.
--
-- Pages opened empty while the site had thirty pages, because those are built
-- in React rather than stored as records. The admin now carries one entry per
-- page so the list is the site; `built_in` marks such an entry, which hides
-- the body and section fields on it — filling those in would do nothing, since
-- the layout is code.
--
-- Needed because `push` is development-only: a field added to a collection
-- reaches a local database by itself and never the deployed one, and until it
-- does, every query that selects it fails — which takes out the whole Pages
-- collection, not just the new field. See scripts/README.md.
--
-- Verified by pushing the schema into a throwaway database and reading the
-- column back: a boolean defaulting to false, and nothing else about pages
-- moves.
--
-- Safe to run more than once. Adds one column, drops nothing.

ALTER TABLE "public"."pages"
  ADD COLUMN IF NOT EXISTS "built_in" boolean DEFAULT false;
