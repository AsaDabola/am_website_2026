-- Tables behind the InternshipApplications collection, which backs the
-- application form on /get-involved/internship.
--
-- Generated, not hand-written: dumped from the schema Payload's own `push`
-- builds from the collection, then verified by applying it to a copy of the
-- deployed schema and diffing the result. See scripts/README.md.
--
-- Needed because `push` is development-only. Until this runs, the form posts
-- to /api/internship-applications and every submission fails — and, being a
-- new collection rather than a new column, /admin will not list it either.
--
-- Safe to run more than once. Adds only; drops nothing.

DO $$
BEGIN
  CREATE TYPE public.enum_internship_applications_program AS ENUM (
    'summer',
    'short-term',
    'long-term'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_internship_applications_education_level AS ENUM (
    'high-school',
    'some-college',
    'undergraduate',
    'postgraduate',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.internship_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.internship_applications (
    id integer NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    street_address character varying NOT NULL,
    city character varying NOT NULL,
    state_province character varying NOT NULL,
    zip_code character varying NOT NULL,
    country character varying NOT NULL,
    date_of_birth character varying NOT NULL,
    program public.enum_internship_applications_program NOT NULL,
    preferred_start_date character varying NOT NULL,
    how_did_you_hear character varying NOT NULL,
    education_level public.enum_internship_applications_education_level NOT NULL,
    church_name character varying NOT NULL,
    leader_name character varying NOT NULL,
    leader_contact character varying NOT NULL,
    faith_journey character varying NOT NULL,
    why_this_program character varying NOT NULL,
    reference1_name character varying NOT NULL,
    reference1_email character varying NOT NULL,
    reference1_phone character varying NOT NULL,
    reference1_relationship character varying NOT NULL,
    reference2_name character varying NOT NULL,
    reference2_email character varying NOT NULL,
    reference2_phone character varying NOT NULL,
    reference2_relationship character varying NOT NULL,
    confirms_accurate boolean DEFAULT false NOT NULL,
    agrees_to_terms boolean DEFAULT false NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

ALTER SEQUENCE public.internship_applications_id_seq OWNED BY public.internship_applications.id;

ALTER TABLE ONLY public.internship_applications ALTER COLUMN id SET DEFAULT nextval('public.internship_applications_id_seq'::regclass);

-- Payload's document-lock table gains a column per collection.
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS internship_applications_id integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'internship_applications_pkey') THEN
    ALTER TABLE ONLY public.internship_applications ADD CONSTRAINT internship_applications_pkey PRIMARY KEY (id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS internship_applications_created_at_idx ON public.internship_applications USING btree (created_at);
CREATE INDEX IF NOT EXISTS internship_applications_updated_at_idx ON public.internship_applications USING btree (updated_at);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_internship_applications_id_idx
  ON public.payload_locked_documents_rels USING btree (internship_applications_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'payload_locked_documents_rels_internship_applications_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_internship_applications_fk
      FOREIGN KEY (internship_applications_id)
      REFERENCES public.internship_applications(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;

-- Check afterwards, from the repo root:
--   POSTGRES_URL='…' node scripts/inventory-schema.mjs | diff - scripts/schema.expected.txt
