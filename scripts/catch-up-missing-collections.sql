-- Catch-up migration: everything the deployed database is missing.
--
-- Generated, not hand-written. Produced by dumping the schema that Payload's
-- own `push` builds from the current collections, and verified by applying it
-- to a database cut back to the deployed shape and diffing the result — see
-- scripts/README.md.
--
-- Why any of this is missing: `push` is development-only. Four collections and
-- a widened enum were added to the code over time, created themselves on local
-- machines, and never reached Vercel. Every query touching them fails, and the
-- catch blocks around those queries turn the failure into an empty list, so
-- nothing ever looked broken:
--
--   * tenant_content        - the Country copy collection. This is why
--                             per-country wording has never worked.
--   * chapter_affiliations  - the chapter affiliation form has been writing
--     membership_applications  and the membership form too; both silently fail.
--   * campuses.tenant_id    - why chapters could not be attached to a country.
--   * enum_tenants_locale   - had only 8 of the 48 shipped languages, so the
--                             seed could not write the 34 countries whose
--                             language was not one of them. That is the whole
--                             of "why did it stop at 38".
--
-- Safe to run more than once. Adds only; drops nothing; touches no data.

-- ---------------------------------------------------------------------------
-- 1. The languages the site ships but the tenants table could not store.
--
-- Outside the transaction below, and one statement per value, because
-- ALTER TYPE ... ADD VALUE is not reversible by rollback. IF NOT EXISTS makes
-- each one a no-op if it is already there.
-- ---------------------------------------------------------------------------

ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'it';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ru';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'tr';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'id';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'nl';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'pl';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'uk';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'cs';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'sk';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'el';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'hu';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ro';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'sv';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'he';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ur';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'hi';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'bn';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ta';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ne';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'si';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'my';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'th';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'vi';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'fil';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ms';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'mn';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'kk';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'sw';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'am';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'af';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'zu';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'xh';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'rw';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'rn';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'mg';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'ht';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'fj';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'hif';
ALTER TYPE public.enum_tenants_locale ADD VALUE IF NOT EXISTS 'rm';

-- ---------------------------------------------------------------------------
-- 2. Enum types for the four missing collections.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  CREATE TYPE public.enum_chapter_affiliations_application_type AS ENUM (
    'Annual reaffirmation',
    'New chapter'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_chapter_affiliations_chartered AS ENUM (
    'Yes',
    'No'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_membership_applications_membership_tier AS ENUM (
    'Newcomer',
    'Registered',
    'Volunteer',
    'Staff',
    'Leader'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_membership_applications_statement_of_faith_agreement AS ENUM (
    'I agree and share the AM Statement of Faith'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_tenant_content_locale AS ENUM (
    'en',
    'es',
    'fr',
    'de',
    'pt',
    'ko',
    'ja',
    'zh',
    'it',
    'ru',
    'tr',
    'id',
    'nl',
    'pl',
    'uk',
    'cs',
    'sk',
    'el',
    'hu',
    'ro',
    'sv',
    'ar',
    'he',
    'ur',
    'hi',
    'bn',
    'ta',
    'ne',
    'si',
    'my',
    'th',
    'vi',
    'fil',
    'ms',
    'mn',
    'kk',
    'sw',
    'am',
    'af',
    'zu',
    'xh',
    'rw',
    'rn',
    'mg',
    'ht',
    'fj',
    'hif',
    'rm'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_tenant_content_overrides_key AS ENUM (
    'AboutPage.blockquote',
    'AboutPage.breadcrumb',
    'AboutPage.cardMissionStatementTitle',
    'AboutPage.cardStatementOfFaithTitle',
    'AboutPage.heroTitle',
    'AboutPage.or',
    'AboutPage.paragraph1',
    'AboutPage.paragraph2',
    'AboutPage.paragraph2Prefix',
    'AboutPage.paragraph3',
    'AboutPage.paragraph4',
    'AboutPage.paragraph5',
    'AboutPage.readStatementOfFaith',
    'AboutPage.traceHistory',
    'AboutSubNav.history',
    'AboutSubNav.leadership',
    'AboutSubNav.membership',
    'AboutSubNav.missionStatement',
    'AboutSubNav.ourFirstChairman',
    'AboutSubNav.statementOfFaith',
    'AboutSubNav.whoWeAre',
    'AnnouncementBar.amAcademy',
    'AnnouncementBar.tagline',
    'Common.clickHere',
    'Common.home',
    'Common.learnMore',
    'Common.readMore',
    'Common.tagline',
    'CountrySwitcher.international',
    'CountrySwitcher.label',
    'Footer.aboutAM',
    'Footer.amAcademy',
    'Footer.bibleStudyProgram',
    'Footer.chapterAffiliation',
    'Footer.connectGrowLeadSent',
    'Footer.contact',
    'Footer.contactUs',
    'Footer.copyright',
    'Footer.email',
    'Footer.events',
    'Footer.fourSpiritualThemes',
    'Footer.getInvolved',
    'Footer.give',
    'Footer.leadership',
    'Footer.legacyOfChairman',
    'Footer.media',
    'Footer.missionStatement',
    'Footer.news',
    'Footer.orgLocation',
    'Footer.orgName',
    'Footer.ourHistory',
    'Footer.ourMinistries',
    'Footer.ourNetwork',
    'Footer.statementOfFaith',
    'Footer.tagline',
    'Footer.whatWeDo',
    'Footer.whoWeAre',
    'GetInvolvedHub.connectHeading',
    'GetInvolvedHub.connectItems',
    'GetInvolvedHub.connectStep1Body',
    'GetInvolvedHub.connectStep1Title',
    'GetInvolvedHub.connectStep2BodyPrefix',
    'GetInvolvedHub.connectStep2BodySuffix',
    'GetInvolvedHub.connectStep2SignUp',
    'GetInvolvedHub.connectStep2Title',
    'GetInvolvedHub.connectStep3BodyPrefix',
    'GetInvolvedHub.connectStep3BodySuffix',
    'GetInvolvedHub.connectStep3SignUp',
    'GetInvolvedHub.connectStep3Title',
    'GetInvolvedHub.connectStep4BodyPrefix',
    'GetInvolvedHub.connectStep4BodySuffix',
    'GetInvolvedHub.connectStep4ContactHere',
    'GetInvolvedHub.connectStep4Title',
    'GetInvolvedHub.connectTag',
    'GetInvolvedHub.fruitfulBody',
    'GetInvolvedHub.fruitfulTitle',
    'GetInvolvedHub.growHeading',
    'GetInvolvedHub.growIntro',
    'GetInvolvedHub.growItems',
    'GetInvolvedHub.growTag',
    'GetInvolvedHub.leadHeading',
    'GetInvolvedHub.leadItems',
    'GetInvolvedHub.leadStep1Body',
    'GetInvolvedHub.leadStep1Title',
    'GetInvolvedHub.leadStep2Body',
    'GetInvolvedHub.leadStep2Title',
    'GetInvolvedHub.leadStep3Body',
    'GetInvolvedHub.leadStep3Title',
    'GetInvolvedHub.leadStep4Body',
    'GetInvolvedHub.leadStep4Title',
    'GetInvolvedHub.leadTag',
    'GetInvolvedHub.matureBody',
    'GetInvolvedHub.matureTitle',
    'GetInvolvedHub.navigatingBody',
    'GetInvolvedHub.navigatingTitle',
    'GetInvolvedHub.nextStepsBody',
    'GetInvolvedHub.nextStepsTitle',
    'GetInvolvedHub.rebornBody',
    'GetInvolvedHub.rebornTitle',
    'GetInvolvedHub.roadmapEyebrow',
    'GetInvolvedHub.roadmapHeading',
    'GetInvolvedHub.roadmapHeroTitle',
    'GetInvolvedHub.sentHeading',
    'GetInvolvedHub.sentItems',
    'GetInvolvedHub.sentLinkAlumniConnect',
    'GetInvolvedHub.sentLinkBibleTeachers',
    'GetInvolvedHub.sentLinkMissionaries',
    'GetInvolvedHub.sentLinkStaff',
    'GetInvolvedHub.sentParagraph1',
    'GetInvolvedHub.sentParagraph2',
    'GetInvolvedHub.sentParagraph3',
    'GetInvolvedHub.sentTag',
    'GetInvolvedSubNav.alumniConnect',
    'GetInvolvedSubNav.bibleStudies',
    'GetInvolvedSubNav.bibleTeacherTraining',
    'GetInvolvedSubNav.chapterStaff',
    'GetInvolvedSubNav.donate',
    'GetInvolvedSubNav.groupActivities',
    'GetInvolvedSubNav.internship',
    'GetInvolvedSubNav.onlineBibleStudy',
    'GetInvolvedSubNav.volunteer',
    'Header.connect',
    'Header.contactUs',
    'Header.getInvolved',
    'Header.getInvolvedMenu.bibleStudies',
    'Header.getInvolvedMenu.bibleTeacherTraining',
    'Header.getInvolvedMenu.chapterAffiliation',
    'Header.getInvolvedMenu.donate',
    'Header.getInvolvedMenu.groupActivities',
    'Header.getInvolvedMenu.internship',
    'Header.getInvolvedMenu.onlineBibleStudy',
    'Header.getInvolvedMenu.volunteer',
    'Header.give',
    'Header.groups.aboutAm.description',
    'Header.groups.aboutAm.title',
    'Header.groups.bibleStudy.description',
    'Header.groups.bibleStudy.title',
    'Header.groups.events.description',
    'Header.groups.events.title',
    'Header.groups.getInvolved.description',
    'Header.groups.getInvolved.title',
    'Header.groups.latestNews.description',
    'Header.groups.latestNews.title',
    'Header.groups.leadership.description',
    'Header.groups.leadership.title',
    'Header.groups.supportMission.description',
    'Header.groups.supportMission.title',
    'Header.groups.whatWeDo.description',
    'Header.groups.whatWeDo.title',
    'Header.megaMenu.aboutHeading',
    'Header.megaMenu.allArticles',
    'Header.megaMenu.ctaBibleStudy',
    'Header.megaMenu.ctaFindChapter',
    'Header.megaMenu.ctaGive',
    'Header.megaMenu.featuredHeading',
    'Header.megaMenu.whatWeDoHeading',
    'Header.mobile.back',
    'Header.mobile.close',
    'Header.mobile.menu',
    'Header.news',
    'Header.newsMenu.editorial',
    'Header.newsMenu.events',
    'Header.newsMenu.featured',
    'Header.newsMenu.photoNews',
    'Header.newsMenu.testimony',
    'Header.ourNetwork',
    'Header.toggleNav',
    'Header.whatWeDo',
    'Header.whatWeDoMenu.administration',
    'Header.whatWeDoMenu.amAcademy',
    'Header.whatWeDoMenu.bibleStudyProgram',
    'Header.whatWeDoMenu.fourSpiritualThemes',
    'Header.whatWeDoMenu.ourMinistries',
    'Header.whatWeDoMenu.pillarsOfMission',
    'Header.whoWeAre',
    'Header.whoWeAreMenu.history',
    'Header.whoWeAreMenu.membership',
    'Header.whoWeAreMenu.ourFirstChairmen',
    'Header.whoWeAreMenu.ourLeadership',
    'Header.whoWeAreMenu.ourMission',
    'Header.whoWeAreMenu.statementOfFaith',
    'Header.whoWeAreMenu.whoWeAre',
    'Home.BibleStudyProgram.cta',
    'Home.BibleStudyProgram.description',
    'Home.BibleStudyProgram.eyebrow',
    'Home.BibleStudyProgram.heading',
    'Home.Events.allEvents',
    'Home.Events.event1Date',
    'Home.Events.event1Title',
    'Home.Events.event2Date',
    'Home.Events.event2Title',
    'Home.Events.event3Date',
    'Home.Events.event3Title',
    'Home.Events.eyebrow',
    'Home.Events.heading',
    'Home.GetInvolved.bibleStudies',
    'Home.GetInvolved.eyebrow',
    'Home.GetInvolved.heading',
    'Home.GetInvolved.internship',
    'Home.GetInvolved.volunteer',
    'Home.Hero.dragToExplore',
    'Home.Hero.eyebrow',
    'Home.Hero.headingLine1',
    'Home.Hero.headingWeAre',
    'Home.Hero.headingWhere',
    'Home.Hero.joinBibleStudy',
    'Home.Hero.stat1Label',
    'Home.Hero.stat1Value',
    'Home.Hero.stat2Label',
    'Home.Hero.stat2Value',
    'Home.Hero.stat3Label',
    'Home.Hero.stat3Value',
    'Home.Hero.whoWeAre',
    'Home.HonoraryChairman.eyebrow',
    'Home.HonoraryChairman.followingLegacy',
    'Home.HonoraryChairman.name',
    'Home.HonoraryChairman.quoteLine1',
    'Home.HonoraryChairman.quoteLine2',
    'Home.HonoraryChairman.quoteLine3',
    'Home.HonoraryChairman.quoteReference',
    'Home.Media.eyebrow',
    'Home.Media.heading',
    'Home.Media.moreContents',
    'Home.Media.playVideo',
    'Home.Media.post1Date',
    'Home.Media.post1Title',
    'Home.Media.post2Date',
    'Home.Media.post2Title',
    'Home.Media.post3Date',
    'Home.Media.post3Title',
    'Home.Media.post4Date',
    'Home.Media.post4Title',
    'Home.Ministries.connectDescription',
    'Home.Ministries.connectTag',
    'Home.Ministries.connectTitle',
    'Home.Ministries.eyebrow',
    'Home.Ministries.getInvolved',
    'Home.Ministries.growDescription',
    'Home.Ministries.growTag',
    'Home.Ministries.growTitle',
    'Home.Ministries.heading',
    'Home.Ministries.leadDescription',
    'Home.Ministries.leadTag',
    'Home.Ministries.leadTitle',
    'Home.Ministries.learnMore',
    'Home.Ministries.sentDescription',
    'Home.Ministries.sentTag',
    'Home.Ministries.sentTitle',
    'Home.Newsletter.cta',
    'Home.Newsletter.description',
    'Home.Newsletter.heading',
    'Home.OurMission.eyebrow',
    'Home.OurMission.history',
    'Home.OurMission.nameOrigin',
    'Home.OurMission.ourHistory',
    'Home.OurMission.readFullStatement',
    'Home.OurMission.statementEmphasis',
    'Home.OurMission.statementPrefix',
    'Home.OurMission.statementSuffix',
    'Home.OurNetwork.description',
    'Home.OurNetwork.eyebrow',
    'Home.OurNetwork.heading',
    'Home.OurNetwork.noMatches',
    'Home.OurNetwork.searchPlaceholder',
    'Home.OurNetwork.startChapter',
    'Home.PartnerWithUs.description',
    'Home.PartnerWithUs.eyebrow',
    'Home.PartnerWithUs.giveToday',
    'Home.PartnerWithUs.heading',
    'Home.PartnerWithUs.talkToUs',
    'Home.QuickLinks.findCampusDescription',
    'Home.QuickLinks.findCampusTitle',
    'Home.QuickLinks.getInvolvedDescription',
    'Home.QuickLinks.getInvolvedTitle',
    'Home.QuickLinks.joinBibleStudyDescription',
    'Home.QuickLinks.joinBibleStudyTitle',
    'Home.QuickLinks.supportDescription',
    'Home.QuickLinks.supportTitle',
    'InPractice.bibleStudyDescription',
    'InPractice.bibleStudyTag',
    'InPractice.eyebrow',
    'InPractice.heading',
    'InPractice.internshipsTripsDescription',
    'InPractice.internshipsTripsTag',
    'InPractice.leadershipTrainingDescription',
    'InPractice.leadershipTrainingTag',
    'InPractice.onlineEducationDescription',
    'InPractice.onlineEducationTag',
    'LanguageSwitcher.label',
    'Logo.international',
    'Network.breadcrumb',
    'Network.chaptersHeading',
    'Network.chaptersSoon',
    'Network.communityEyebrow',
    'Network.continentSubtitle',
    'Network.countriesEyebrow',
    'Network.countriesHeading',
    'Network.countriesSubheading',
    'Network.exploreEyebrow',
    'Network.heading',
    'Network.joinChapter',
    'Network.map.captionEastCentralAsia',
    'Network.map.captionSouthAsia',
    'Network.map.captionSoutheastAsia',
    'Network.map.clear',
    'Network.map.hqBadge',
    'Network.map.loading',
    'Network.map.regionalHqBadge',
    'Network.map.regionAria',
    'Network.map.regionHint',
    'Network.map.world',
    'Network.map.worldAria',
    'Network.map.worldHint',
    'Network.map.zoomIn',
    'Network.noSitesBodyPrefix',
    'Network.noSitesBodySuffix',
    'Network.noSitesLink',
    'Network.noSitesTitle',
    'Network.partnerWithUs',
    'Network.regions.africa',
    'Network.regions.asia',
    'Network.regions.europe',
    'Network.regions.northamerica',
    'Network.regions.oceania',
    'Network.regions.southamerica',
    'Network.regionsHeading',
    'Network.regionsSubheading',
    'Network.siteCount',
    'Network.visitSite',
    'NewsSubNav.editorial',
    'NewsSubNav.events',
    'NewsSubNav.featuredNews',
    'NewsSubNav.photoNews',
    'NewsSubNav.testimony',
    'WhatWeDoSubNav.administration',
    'WhatWeDoSubNav.pillarsOfMission'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. The tables themselves, then their keys, indexes and foreign keys.
-- ---------------------------------------------------------------------------

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.chapter_affiliations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.membership_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.tenant_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public.chapter_affiliations (
    id integer NOT NULL,
    application_type public.enum_chapter_affiliations_application_type NOT NULL,
    city character varying NOT NULL,
    country character varying NOT NULL,
    target_university character varying NOT NULL,
    start_date character varying NOT NULL,
    member_count character varying NOT NULL,
    chartered public.enum_chapter_affiliations_chartered NOT NULL,
    charter_letter_id integer,
    constitution_file_id integer,
    delay_reason character varying,
    leader_name character varying NOT NULL,
    leader_role character varying NOT NULL,
    leader_email character varying NOT NULL,
    leader_phone character varying NOT NULL,
    leadership_changes character varying,
    attestation boolean DEFAULT false NOT NULL,
    member_list_file_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chapter_affiliations_additional_leaders (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying,
    role character varying,
    email character varying,
    phone character varying
);

CREATE TABLE IF NOT EXISTS public.chapter_affiliations_members (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying,
    email character varying
);

CREATE TABLE IF NOT EXISTS public.membership_applications (
    id integer NOT NULL,
    full_name character varying NOT NULL,
    phone character varying NOT NULL,
    email character varying NOT NULL,
    chapter character varying NOT NULL,
    membership_tier public.enum_membership_applications_membership_tier NOT NULL,
    statement_of_faith_agreement public.enum_membership_applications_statement_of_faith_agreement,
    message character varying,
    attestation boolean DEFAULT false NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tenant_content (
    id integer NOT NULL,
    label character varying,
    tenant_id integer NOT NULL,
    locale public.enum_tenant_content_locale,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tenant_content_overrides (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    key public.enum_tenant_content_overrides_key NOT NULL,
    value character varying NOT NULL,
    main_version character varying
);

ALTER SEQUENCE public.chapter_affiliations_id_seq OWNED BY public.chapter_affiliations.id;

ALTER SEQUENCE public.membership_applications_id_seq OWNED BY public.membership_applications.id;

ALTER SEQUENCE public.tenant_content_id_seq OWNED BY public.tenant_content.id;

ALTER TABLE ONLY public.chapter_affiliations ALTER COLUMN id SET DEFAULT nextval('public.chapter_affiliations_id_seq'::regclass);

ALTER TABLE ONLY public.membership_applications ALTER COLUMN id SET DEFAULT nextval('public.membership_applications_id_seq'::regclass);

ALTER TABLE ONLY public.tenant_content ALTER COLUMN id SET DEFAULT nextval('public.tenant_content_id_seq'::regclass);

-- Columns on tables that already exist.
ALTER TABLE public.campuses ADD COLUMN IF NOT EXISTS tenant_id integer;
ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS tenant_content_id integer;
ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS chapter_affiliations_id integer;
ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS membership_applications_id integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_additional_leaders_pkey') THEN
    ALTER TABLE ONLY public.chapter_affiliations_additional_leaders ADD CONSTRAINT chapter_affiliations_additional_leaders_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_members_pkey') THEN
    ALTER TABLE ONLY public.chapter_affiliations_members ADD CONSTRAINT chapter_affiliations_members_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_pkey') THEN
    ALTER TABLE ONLY public.chapter_affiliations ADD CONSTRAINT chapter_affiliations_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_applications_pkey') THEN
    ALTER TABLE ONLY public.membership_applications ADD CONSTRAINT membership_applications_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_content_overrides_pkey') THEN
    ALTER TABLE ONLY public.tenant_content_overrides ADD CONSTRAINT tenant_content_overrides_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_content_pkey') THEN
    ALTER TABLE ONLY public.tenant_content ADD CONSTRAINT tenant_content_pkey PRIMARY KEY (id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS chapter_affiliations_additional_leaders_order_idx ON public.chapter_affiliations_additional_leaders USING btree (_order);
CREATE INDEX IF NOT EXISTS chapter_affiliations_additional_leaders_parent_id_idx ON public.chapter_affiliations_additional_leaders USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS chapter_affiliations_charter_letter_idx ON public.chapter_affiliations USING btree (charter_letter_id);
CREATE INDEX IF NOT EXISTS chapter_affiliations_constitution_file_idx ON public.chapter_affiliations USING btree (constitution_file_id);
CREATE INDEX IF NOT EXISTS chapter_affiliations_created_at_idx ON public.chapter_affiliations USING btree (created_at);
CREATE INDEX IF NOT EXISTS chapter_affiliations_member_list_file_idx ON public.chapter_affiliations USING btree (member_list_file_id);
CREATE INDEX IF NOT EXISTS chapter_affiliations_members_order_idx ON public.chapter_affiliations_members USING btree (_order);
CREATE INDEX IF NOT EXISTS chapter_affiliations_members_parent_id_idx ON public.chapter_affiliations_members USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS chapter_affiliations_updated_at_idx ON public.chapter_affiliations USING btree (updated_at);
CREATE INDEX IF NOT EXISTS membership_applications_created_at_idx ON public.membership_applications USING btree (created_at);
CREATE INDEX IF NOT EXISTS membership_applications_updated_at_idx ON public.membership_applications USING btree (updated_at);
CREATE INDEX IF NOT EXISTS tenant_content_created_at_idx ON public.tenant_content USING btree (created_at);
CREATE INDEX IF NOT EXISTS tenant_content_overrides_order_idx ON public.tenant_content_overrides USING btree (_order);
CREATE INDEX IF NOT EXISTS tenant_content_overrides_parent_id_idx ON public.tenant_content_overrides USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS tenant_content_tenant_idx ON public.tenant_content USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_content_updated_at_idx ON public.tenant_content USING btree (updated_at);
CREATE INDEX IF NOT EXISTS campuses_tenant_idx ON public.campuses USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_tenant_content_id_idx ON public.payload_locked_documents_rels USING btree (tenant_content_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_chapter_affiliations_id_idx ON public.payload_locked_documents_rels USING btree (chapter_affiliations_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_membership_applications_id_idx ON public.payload_locked_documents_rels USING btree (membership_applications_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_additional_leaders_parent_id_fk') THEN
    ALTER TABLE ONLY public.chapter_affiliations_additional_leaders ADD CONSTRAINT chapter_affiliations_additional_leaders_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.chapter_affiliations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_charter_letter_id_media_id_fk') THEN
    ALTER TABLE ONLY public.chapter_affiliations ADD CONSTRAINT chapter_affiliations_charter_letter_id_media_id_fk FOREIGN KEY (charter_letter_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_constitution_file_id_media_id_fk') THEN
    ALTER TABLE ONLY public.chapter_affiliations ADD CONSTRAINT chapter_affiliations_constitution_file_id_media_id_fk FOREIGN KEY (constitution_file_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_member_list_file_id_media_id_fk') THEN
    ALTER TABLE ONLY public.chapter_affiliations ADD CONSTRAINT chapter_affiliations_member_list_file_id_media_id_fk FOREIGN KEY (member_list_file_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chapter_affiliations_members_parent_id_fk') THEN
    ALTER TABLE ONLY public.chapter_affiliations_members ADD CONSTRAINT chapter_affiliations_members_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.chapter_affiliations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_content_overrides_parent_id_fk') THEN
    ALTER TABLE ONLY public.tenant_content_overrides ADD CONSTRAINT tenant_content_overrides_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.tenant_content(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_content_tenant_id_tenants_id_fk') THEN
    ALTER TABLE ONLY public.tenant_content ADD CONSTRAINT tenant_content_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campuses_tenant_id_tenants_id_fk') THEN
    ALTER TABLE ONLY public.campuses ADD CONSTRAINT campuses_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_tenant_content_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_tenant_content_fk FOREIGN KEY (tenant_content_id) REFERENCES public.tenant_content(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_chapter_affiliations_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_chapter_affiliations_fk FOREIGN KEY (chapter_affiliations_id) REFERENCES public.chapter_affiliations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_membership_applications_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_membership_applications_fk FOREIGN KEY (membership_applications_id) REFERENCES public.membership_applications(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;

-- Check afterwards, from the repo root:
--   POSTGRES_URL='…' node scripts/inventory-schema.mjs | diff - scripts/schema.expected.txt
-- Silence means the deployed schema matches what the code expects.
