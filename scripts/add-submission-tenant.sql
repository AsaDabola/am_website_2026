-- Which country site a submission came in from.
--
-- The enquiry forms, the applications and the donation flow had no country on
-- their records, so every one of them belonged to nobody in particular and
-- only a super admin could read them: a national office could not see its own
-- enquiries, and granting it the section would have shown it every country's,
-- names and addresses included. The forms record the country site they were
-- sent from now, and this is where it is kept.
--
-- Nullable on all seven, and every submission already there keeps a NULL,
-- which reads as the main site's own — they arrived before the country was
-- recorded, so none of them is attributed to a country rather than guessed at.
--
-- Additive only, and safe to run twice.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'contact_messages',
    'bible_study_signups',
    'volunteer_applications',
    'internship_applications',
    'chapter_affiliations',
    'membership_applications',
    'donation_intents'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id integer', t);

    BEGIN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) '
        'REFERENCES public.tenants(id) ON DELETE SET NULL',
        t, t || '_tenant_id_tenants_id_fk');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN duplicate_table THEN NULL;
    END;

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I USING btree (tenant_id)',
      t || '_tenant_idx', t);
  END LOOP;
END $$;
