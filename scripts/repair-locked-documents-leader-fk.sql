-- The foreign key that add-leaders.sql left behind.
--
-- Hand-written, unlike its neighbours, because it repairs a gap in an already
-- applied migration rather than describing a new field. It is three lines and
-- every one of them is checked before it runs.
--
-- What happened: the catch-up generator emitted the `leaders_id` column on
-- payload_locked_documents_rels, and its index, but not the constraint the
-- column is declared with. A column added to a table that already exists and a
-- constraint on that table are two different statements in pg_dump, and only
-- the first was being read. (Fixed in generate-catchup-sql.mjs, so the next
-- collection brings its keys with it.)
--
-- What it costs while missing: Payload writes a row here while someone has a
-- document open. Deleting the leader should take the lock row with it via
-- ON DELETE CASCADE; without the key it leaves a row pointing at nothing, and
-- the admin then has a lock it cannot resolve to a document.
--
-- Safe to run twice: the constraint is added only if no constraint of that
-- name exists, and only if both tables are there to hold it.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'payload_locked_documents_rels'
       AND column_name = 'leaders_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'leaders'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'payload_locked_documents_rels_leaders_fk'
       AND connamespace = 'public'::regnamespace
  ) THEN
    -- Any row already orphaned would block the constraint, so clear those
    -- first. A lock row whose leader is gone is stale by definition.
    DELETE FROM public.payload_locked_documents_rels r
     WHERE r.leaders_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.leaders l WHERE l.id = r.leaders_id);

    ALTER TABLE ONLY public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_leaders_fk
      FOREIGN KEY (leaders_id) REFERENCES public.leaders(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
