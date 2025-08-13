-- Table: public.resist_programs
-- DROP TABLE IF EXISTS public.resist_programs;
CREATE TABLE IF NOT EXISTS public.resist_programs (
    program_id           INTEGER NOT NULL 
                                         GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                         PRIMARY KEY,
    user_id                         INTEGER       NOT NULL
                                         REFERENCES public.users(id)
                                           ON UPDATE CASCADE
                                           ON DELETE CASCADE,
    program_name                    VARCHAR(100)  NOT NULL,
    phase_focus                     VARCHAR(50),  -- or: INTEGER NOT NULL REFERENCES public.phases(id)
    periodization_type              VARCHAR(50),  -- or: INTEGER NOT NULL REFERENCES public.periodization_types(id)
    progression_rules               JSONB,
    program_duration                SMALLINT,
    notes                           TEXT,
    start_date                      DATE,
    end_date                        DATE,
    rrule                           VARCHAR(50),
    duration                        SMALLINT,
    recurring_event_pid             INTEGER,
    original_start                  DATE,
    deleted                         BOOLEAN,
    created_at                      TIMESTAMPTZ    DEFAULT now(),
    updated_at                      TIMESTAMPTZ
);

ALTER TABLE public.resist_programs
    OWNER TO postgres;


-- Table: public.resist_program_templates

-- DROP TABLE IF EXISTS public.resist_program_templates;

CREATE TABLE IF NOT EXISTS public.resist_program_templates
(
    program_template_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    template_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    difficulty_level character varying(50) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    program_id integer NOT NULL,
    CONSTRAINT resist_program_templates_pkey PRIMARY KEY (program_template_id),
    CONSTRAINT resist_program_templates_program_id_fkey FOREIGN KEY (program_id)
        REFERENCES public.resist_programs (program_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
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