-- Who uploaded a file, so the shared library can be added to without being
-- rearranged.
--
-- Media is granted to a country admin now, which it was not before: a country
-- team could use the images already in the library but could not add one, so
-- putting a photograph on their own page needed a super admin. Reading stays
-- wide — the main site's logos and photography are what a country page is
-- assembled from — and only changing is scoped, which needs the file to
-- remember whose it is.
--
-- Nullable, and every file already there keeps a NULL, which reads as the main
-- site's own. Additive only, and safe to run twice.

ALTER TABLE public.media ADD COLUMN IF NOT EXISTS tenant_id integer;

DO $$
BEGIN
  ALTER TABLE public.media
    ADD CONSTRAINT media_tenant_id_tenants_id_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN duplicate_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS media_tenant_idx ON public.media USING btree (tenant_id);
