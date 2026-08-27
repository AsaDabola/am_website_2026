-- Adds "featured" to the Posts category enum.
--
-- The news section is presented in six divisions — News, Featured, Events,
-- Editorial, Photo News, Testimony — and Featured had been folded into the
-- news value, which is why one tab was doing the work of two. Splitting them
-- adds a value to enum_posts_category, and `push` is development-only, so the
-- deployed database needs this by hand. See scripts/README.md.
--
-- Until it runs, saving a post as Featured in /admin fails: Postgres rejects
-- a value the type does not have.
--
-- Safe to run more than once. Adds only; drops nothing, and changes no row.
--
-- ADD VALUE cannot run inside a transaction block in older Postgres, so this
-- is deliberately not wrapped in BEGIN/COMMIT.

ALTER TYPE public.enum_posts_category ADD VALUE IF NOT EXISTS 'featured' AFTER 'news';

-- Check afterwards — this should list news, featured, editorial, photo-news,
-- testimony:
--
--   SELECT enumlabel FROM pg_enum
--   WHERE enumtypid = 'public.enum_posts_category'::regtype
--   ORDER BY enumsortorder;
