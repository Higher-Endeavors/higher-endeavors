-- Table: public.program_day_exercise_sets

-- DROP TABLE IF EXISTS public.program_day_exercise_sets;

CREATE TABLE IF NOT EXISTS public.program_day_exercise_sets
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    program_day_exercise_id integer NOT NULL,
    set_number integer NOT NULL,
    planned_reps integer NOT NULL,
    planned_load text COLLATE pg_catalog."default",
    load_unit character varying(20) COLLATE pg_catalog."default",
    planned_rest integer,
    planned_tempo character varying(20) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    rpe numeric(3,1),
    rir integer,
    CONSTRAINT program_day_exercise_sets_pkey PRIMARY KEY (id),
    CONSTRAINT program_day_exercise_sets_day_exercise_id_fkey FOREIGN KEY (program_day_exercise_id)
        REFERENCES public.program_day_exercises (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.program_day_exercise_sets
    OWNER to postgres;

COMMENT ON COLUMN public.program_day_exercise_sets.rpe
    IS 'Rating of Perceived Exertion (1-10 scale, with .5 increments)';

COMMENT ON COLUMN public.program_day_exercise_sets.rir
    IS 'Reps in Reserve (0-5 typically)';
-- Index: idx_exercise_sets_load_tracking

-- DROP INDEX IF EXISTS public.idx_exercise_sets_load_tracking;

CREATE INDEX IF NOT EXISTS idx_exercise_sets_load_tracking
    ON public.program_day_exercise_sets USING btree
    (program_day_exercise_id ASC NULLS LAST, planned_load COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE planned_load IS NOT NULL;


-- Table: public.program_day_exercise_sub_sets

-- DROP TABLE IF EXISTS public.program_day_exercise_sub_sets;

CREATE TABLE IF NOT EXISTS public.program_day_exercise_sub_sets
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    program_day_exercise_set_id integer NOT NULL,
    sub_set_number integer NOT NULL,
    planned_reps integer NOT NULL,
    planned_load numeric(6,2),
    load_unit character varying(20) COLLATE pg_catalog."default",
    planned_rest integer,
    planned_tempo character varying(20) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    rpe numeric(3,1),
    rir integer,
    CONSTRAINT program_day_exercise_sub_sets_pkey PRIMARY KEY (id),
    CONSTRAINT program_day_exercise_sub_sets_program_day_exercise_set_id_fkey FOREIGN KEY (program_day_exercise_set_id)
        REFERENCES public.program_day_exercise_sets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.program_day_exercise_sub_sets
    OWNER to postgres;

COMMENT ON COLUMN public.program_day_exercise_sub_sets.rpe
    IS 'Rating of Perceived Exertion (1-10 scale, with .5 increments)';

COMMENT ON COLUMN public.program_day_exercise_sub_sets.rir
    IS 'Reps in Reserve (0-5 typically)';


-- Table: public.program_day_exercises

-- DROP TABLE IF EXISTS public.program_day_exercises;

CREATE TABLE IF NOT EXISTS public.program_day_exercises
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    program_day_id integer NOT NULL,
    exercise_source character varying(20) COLLATE pg_catalog."default" NOT NULL,
    exercise_library_id integer,
    user_exercise_id integer,
    custom_exercise_name character varying(100) COLLATE pg_catalog."default",
    pairing character varying(10) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    order_index integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT program_day_exercises_pkey PRIMARY KEY (id),
    CONSTRAINT program_day_exercises_day_fkey FOREIGN KEY (program_day_id)
        REFERENCES public.program_days (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT program_day_exercises_exercise_library_id_fkey FOREIGN KEY (exercise_library_id)
        REFERENCES public.exercise_library (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT program_day_exercises_user_exercise_id_fkey FOREIGN KEY (user_exercise_id)
        REFERENCES public.user_exercises (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT program_day_exercises_exercise_source_check CHECK (exercise_source::text = ANY (ARRAY['library'::character varying, 'user'::character varying]::text[])),
    CONSTRAINT program_day_exercises_pairing_check CHECK (pairing IS NULL OR pairing::text ~ '^([A-Z]\d{1,2}|WU|CD)$'::text)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.program_day_exercises
    OWNER to postgres;
-- Index: idx_exercise_order

-- DROP INDEX IF EXISTS public.idx_exercise_order;

CREATE INDEX IF NOT EXISTS idx_exercise_order
    ON public.program_day_exercises USING btree
    (program_day_id ASC NULLS LAST, order_index ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_program_day_exercises_analysis

-- DROP INDEX IF EXISTS public.idx_program_day_exercises_analysis;

CREATE INDEX IF NOT EXISTS idx_program_day_exercises_analysis
    ON public.program_day_exercises USING btree
    (exercise_library_id ASC NULLS LAST, exercise_source COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE exercise_source::text = 'library'::text;


    -- Table: public.program_days

-- DROP TABLE IF EXISTS public.program_days;

CREATE TABLE IF NOT EXISTS public.program_days
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    program_week_id integer NOT NULL,
    day_number integer,
    day_name character varying(100) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT program_days_pkey PRIMARY KEY (id),
    CONSTRAINT program_days_program_week_id_fkey FOREIGN KEY (program_week_id)
        REFERENCES public.program_weeks (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.program_days
    OWNER to postgres;
-- Index: idx_program_days_lookup

-- DROP INDEX IF EXISTS public.idx_program_days_lookup;

CREATE INDEX IF NOT EXISTS idx_program_days_lookup
    ON public.program_days USING btree
    (program_week_id ASC NULLS LAST, day_number ASC NULLS LAST)
    TABLESPACE pg_default;


    -- Table: public.program_weeks

-- DROP TABLE IF EXISTS public.program_weeks;

CREATE TABLE IF NOT EXISTS public.program_weeks
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    resistance_program_id integer NOT NULL,
    week_number integer NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT program_weeks_pkey PRIMARY KEY (id),
    CONSTRAINT program_weeks_resistance_program_id_fkey FOREIGN KEY (resistance_program_id)
        REFERENCES public.resistance_programs (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.program_weeks
    OWNER to postgres;
-- Index: idx_program_weeks_lookup

-- DROP INDEX IF EXISTS public.idx_program_weeks_lookup;

CREATE INDEX IF NOT EXISTS idx_program_weeks_lookup
    ON public.program_weeks USING btree
    (resistance_program_id ASC NULLS LAST, week_number ASC NULLS LAST)
    TABLESPACE pg_default;


    -- Table: public.resistance_program_templates

-- DROP TABLE IF EXISTS public.resistance_program_templates;

CREATE TABLE IF NOT EXISTS public.resistance_program_templates
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    template_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    periodization_type character varying(50) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT resistance_program_templates_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resistance_program_templates
    OWNER to postgres;
-- Index: idx_program_templates_search

-- DROP INDEX IF EXISTS public.idx_program_templates_search;

CREATE INDEX IF NOT EXISTS idx_program_templates_search
    ON public.resistance_program_templates USING btree
    (template_name COLLATE pg_catalog."default" ASC NULLS LAST, periodization_type COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;


    -- Table: public.resistance_programs

-- DROP TABLE IF EXISTS public.resistance_programs;

CREATE TABLE IF NOT EXISTS public.resistance_programs
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    program_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    periodization_type character varying(50) COLLATE pg_catalog."default",
    template_id integer,
    start_date date,
    end_date date,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    phase_focus character varying(50) COLLATE pg_catalog."default",
    progression_rules jsonb,
    CONSTRAINT resistance_programs_pkey PRIMARY KEY (id),
    CONSTRAINT resistance_programs_template_id_fkey FOREIGN KEY (template_id)
        REFERENCES public.resistance_program_templates (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT resistance_programs_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resistance_programs
    OWNER to postgres;
-- Index: idx_resistance_programs_search

-- DROP INDEX IF EXISTS public.idx_resistance_programs_search;

CREATE INDEX IF NOT EXISTS idx_resistance_programs_search
    ON public.resistance_programs USING btree
    (user_id ASC NULLS LAST, program_name COLLATE pg_catalog."default" ASC NULLS LAST, periodization_type COLLATE pg_catalog."default" ASC NULLS LAST, start_date ASC NULLS LAST, end_date ASC NULLS LAST)
    TABLESPACE pg_default;


    -- Table: public.user_exercises

-- DROP TABLE IF EXISTS public.user_exercises;

CREATE TABLE IF NOT EXISTS public.user_exercises
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    exercise_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT user_exercises_pkey PRIMARY KEY (id),
    CONSTRAINT user_exercises_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_exercises
    OWNER to postgres;
-- Index: idx_user_exercises_search

-- DROP INDEX IF EXISTS public.idx_user_exercises_search;

CREATE INDEX IF NOT EXISTS idx_user_exercises_search
    ON public.user_exercises USING btree
    (user_id ASC NULLS LAST, exercise_name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;