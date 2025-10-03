-- Table: public.resist_programs

-- DROP TABLE IF EXISTS public.resist_programs;

CREATE TABLE IF NOT EXISTS public.resist_programs
(
    program_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    program_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    progression_rules jsonb,
    program_duration smallint,
    notes text COLLATE pg_catalog."default",
    start_date date,
    end_date date,
    rrule character varying(50) COLLATE pg_catalog."default",
    duration smallint,
    recurring_event_pid integer,
    original_start date,
    deleted boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    resist_phase_id integer,
    resist_periodization_id integer,
    CONSTRAINT resist_programs_pkey PRIMARY KEY (program_id),
    CONSTRAINT resist_programs_resist_periodization_id_fkey FOREIGN KEY (resist_periodization_id)
        REFERENCES public.resist_periodization_type (resist_periodization_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT resist_programs_resist_phase_id_fkey FOREIGN KEY (resist_phase_id)
        REFERENCES public.resist_phase (resist_phase_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT resist_programs_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resist_programs
    OWNER to postgres;


-- Table: public.resist_program_templates

-- DROP TABLE IF EXISTS public.resist_program_templates;

CREATE TABLE IF NOT EXISTS public.resist_program_templates
(
    program_template_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    template_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    program_id integer NOT NULL,
    tier_continuum_id integer NOT NULL,
    CONSTRAINT resist_program_templates_pkey PRIMARY KEY (program_template_id),
    CONSTRAINT resist_program_templates_program_id_fkey FOREIGN KEY (program_id)
        REFERENCES public.resist_programs (program_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT resist_program_templates_tier_continuum_id_fkey FOREIGN KEY (tier_continuum_id)
        REFERENCES public.highend_tier_continuum (tier_continuum_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resist_program_templates
    OWNER to postgres;


-- ───────────────────────────────────────────────────────────────────
-- 1) Planned exercises (hybrid defaults + JSONB detail)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resist_program_exercises (
  program_exercises_id INTEGER NOT NULL 
                                         GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                         PRIMARY KEY,
  program_id   INTEGER NOT NULL
    REFERENCES public.resist_programs(program_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
  program_instance SMALLINT,
  exercise_source     VARCHAR(20)  NOT NULL,
  exercise_library_id INTEGER      REFERENCES public.exercise_library(exercise_library_id)
                      ON UPDATE CASCADE ON DELETE SET NULL,
  user_exercise_library_id    INTEGER      REFERENCES public.resist_user_exercise_library(user_exercise_library_id)
                      ON UPDATE CASCADE ON DELETE SET NULL,
  pairing             VARCHAR(3),                -- e.g. 'A1','A2','WU','CD'
  notes               TEXT,
  planned_sets JSON NOT NULL DEFAULT '[]',
  actual_sets JSON NOT NULL DEFAULT '[]',
  /* sets is an array of ExerciseSets objects
    export interface ExerciseSets {
      set?: number;
      reps?: number;
      load?: string;
      loadUnit?: string;
      restSec?: number;
      rpe?: number;
      rir?: number;
      tempo?: string;
      subSets?: PlannedSet[]; // For advanced sets (one level)
      type?: 'varied' | 'advanced';
      repUnit?: string;
    }
  */
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resist_program_template_categories (
    resist_program_template_categories_id INTEGER NOT NULL 
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

ALTER TABLE public.resist_program_template_categories
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.resist_program_template_category_links (
    program_template_id INTEGER NOT NULL
        REFERENCES public.resist_program_templates(program_template_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    resist_program_template_categories_id INTEGER NOT NULL
        REFERENCES public.resist_program_template_categories(resist_program_template_categories_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (program_template_id, resist_program_template_categories_id),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resist_program_template_category_links
    OWNER TO postgres;

    -- Table: public.resist_phase

-- DROP TABLE IF EXISTS public.resist_phase;

CREATE TABLE IF NOT EXISTS public.resist_phase
(
    resist_phase_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    resist_phase_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT resist_phase_pkey PRIMARY KEY (resist_phase_id),
    CONSTRAINT resist_phase_resist_phase_name_key UNIQUE (resist_phase_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resist_phase
    OWNER to postgres;

-- Table: public.resist_periodization_type

-- DROP TABLE IF EXISTS public.resist_periodization_type;

CREATE TABLE IF NOT EXISTS public.resist_periodization_type
(
    resist_periodization_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    resist_periodization_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT resist_periodization_type_pkey PRIMARY KEY (resist_periodization_id),
    CONSTRAINT resist_periodization_type_resist_periodization_name_key UNIQUE (resist_periodization_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.resist_periodization_type
    OWNER to postgres;