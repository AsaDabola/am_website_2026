-- Adds the Tenants columns the Payload config expects but the deployed
-- database is missing, after schema drift caused by `push` being a
-- development-only mechanism (see the note on it in src/payload.config.ts).
--
-- Safe to run more than once: every statement is guarded, and nothing here
-- drops or alters existing data.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "public"."enum_tenants_continent" AS ENUM('africa', 'asia', 'europe', 'northamerica', 'southamerica', 'oceania');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_tenants_locale" AS ENUM('en', 'es', 'fr', 'de', 'pt', 'ko', 'ja', 'zh', 'it', 'ru', 'tr', 'id', 'nl', 'pl', 'uk', 'cs', 'sk', 'el', 'hu', 'ro', 'sv', 'ar', 'he', 'ur', 'hi', 'bn', 'ta', 'ne', 'si', 'my', 'th', 'vi', 'fil', 'ms', 'mn', 'kk', 'sw', 'am', 'af', 'zu', 'xh', 'rw', 'rn', 'mg', 'ht', 'fj', 'hif', 'rm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_tenants_tier" AS ENUM('g20', 'm40');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "country" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "city" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "continent" "public"."enum_tenants_continent";
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "slug" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "locale" "public"."enum_tenants_locale" DEFAULT 'en';
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "country_codes" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "languages" varchar;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "tier" "public"."enum_tenants_tier";
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;

COMMIT;

-- Check afterwards:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'tenants' ORDER BY ordinal_position;
