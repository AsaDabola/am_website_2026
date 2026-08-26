-- Columns for the per-country footer fields added to the Tenants collection
-- (orgName, address, contactEmail). Payload maps camelCase to snake_case.
--
-- Needed because `push` is development-only: a field added to a collection
-- reaches a local database by itself and never reaches the deployed one, and
-- until it does, every query selecting it fails — which is why the country
-- switcher emptied out.
--
-- Safe to run more than once. Adds only; drops nothing.

BEGIN;

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "org_name" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "address" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "contact_email" varchar;

COMMIT;

-- Check afterwards:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'tenants' ORDER BY ordinal_position;
