-- Adds any enum values the deployed database is missing.
--
-- fix-tenants-schema.sql could not do this: its CREATE TYPE statements are
-- skipped when the type already exists, so a type created before a locale was
-- added never gains that value. Seeding a country whose locale is missing then
-- fails with 'invalid input value for enum', which is what stopped the tenant
-- seed part-way through.
--
-- Deliberately not wrapped in a transaction: ADD VALUE and using the value
-- cannot share one.

ALTER TYPE "public"."enum_tenants_continent" ADD VALUE IF NOT EXISTS 'africa';
ALTER TYPE "public"."enum_tenants_continent" ADD VALUE IF NOT EXISTS 'asia';
ALTER TYPE "public"."enum_tenants_continent" ADD VALUE IF NOT EXISTS 'europe';
ALTER TYPE "public"."enum_tenants_continent" ADD VALUE IF NOT EXISTS 'northamerica';
ALTER TYPE "public"."enum_tenants_continent" ADD VALUE IF NOT EXISTS 'southamerica';
ALTER TYPE "public"."enum_tenants_continent" ADD VALUE IF NOT EXISTS 'oceania';

ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'en';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'es';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'fr';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'de';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'pt';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ko';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ja';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'zh';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'it';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ru';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'tr';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'id';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'nl';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'pl';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'uk';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'cs';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'sk';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'el';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'hu';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ro';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'sv';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'he';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ur';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'hi';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'bn';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ta';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ne';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'si';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'my';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'th';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'vi';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'fil';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ms';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'mn';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'kk';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'sw';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'am';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'af';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'zu';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'xh';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'rw';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'rn';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'mg';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'ht';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'fj';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'hif';
ALTER TYPE "public"."enum_tenants_locale" ADD VALUE IF NOT EXISTS 'rm';

ALTER TYPE "public"."enum_tenants_tier" ADD VALUE IF NOT EXISTS 'g20';
ALTER TYPE "public"."enum_tenants_tier" ADD VALUE IF NOT EXISTS 'm40';
