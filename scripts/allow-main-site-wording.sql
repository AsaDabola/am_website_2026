-- Lets a Page wording entry apply to the main amintl.org site.
--
-- The collection used to insist on a country (`tenant` was `required`), which
-- Payload's Postgres adapter turns into NOT NULL on the column. That is the
-- one thing standing between the deployed database and an entry with the
-- country left empty — the entry that changes the main site, and with it every
-- country following it.
--
-- Needed because `push` is development-only, so a field that stops being
-- required on your machine stays required on the deployed database. See
-- scripts/README.md.
--
-- Verified by pushing the schema into a throwaway database before and after
-- the change: tenant_content.tenant_id goes from NOT NULL to nullable, and
-- nothing else about the schema moves.
--
-- Safe to run more than once. Adds nothing, drops nothing, removes one
-- constraint.

ALTER TABLE "public"."tenant_content"
  ALTER COLUMN "tenant_id" DROP NOT NULL;
