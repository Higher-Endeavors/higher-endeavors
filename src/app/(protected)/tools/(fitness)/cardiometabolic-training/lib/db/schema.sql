-- Table: public.cme_sessions

-- DROP TABLE IF EXISTS public.cme_sessions;

CREATE TABLE IF NOT EXISTS public.cme_sessions
(
    cme_session_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    session_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    macrocycle_phase character varying(100) COLLATE pg_catalog."default",
    focus_block character varying(100) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    start_date date,
    end_date date,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cme_sessions_pkey PRIMARY KEY (cme_session_id),
    CONSTRAINT cme_sessions_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.cme_sessions
    OWNER to postgres;


-- Table: public.cme_session_templates

-- DROP TABLE IF EXISTS public.cme_session_templates;

CREATE TABLE IF NOT EXISTS public.cme_session_templates
(
    cme_template_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    template_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    cme_session_id integer NOT NULL,
    tier_continuum_id integer,
    CONSTRAINT cme_session_templates_pkey PRIMARY KEY (cme_template_id),
    CONSTRAINT cme_session_templates_cme_session_id_fkey FOREIGN KEY (cme_session_id)
        REFERENCES public.cme_sessions (cme_session_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT cme_session_templates_tier_continuum_id_fkey FOREIGN KEY (tier_continuum_id)
        REFERENCES public.highend_tier_continuum (tier_continuum_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.cme_session_templates
    OWNER to postgres;


-- Table: public.cme_sessions_activities

-- DROP TABLE IF EXISTS public.cme_sessions_activities;

CREATE TABLE IF NOT EXISTS public.cme_sessions_activities
(
    cme_session_activity_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    cme_session_id integer NOT NULL,
    cme_activity_family_id integer,
    cme_activity_library_id integer,
    planned_steps jsonb DEFAULT '[]'::jsonb,
    actual_steps jsonb DEFAULT '[]'::jsonb,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cme_sessions_activities_pkey PRIMARY KEY (cme_session_activity_id),
    CONSTRAINT cme_sessions_activities_cme_activity_family_id_fkey FOREIGN KEY (cme_activity_family_id)
        REFERENCES public.cme_activity_family (cme_activity_family_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT cme_sessions_activities_cme_activity_library_id_fkey FOREIGN KEY (cme_activity_library_id)
        REFERENCES public.cme_activity_library (cme_activity_library_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT cme_sessions_activities_cme_session_id_fkey FOREIGN KEY (cme_session_id)
        REFERENCES public.cme_sessions (cme_session_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.cme_sessions_activities
    OWNER to postgres;
