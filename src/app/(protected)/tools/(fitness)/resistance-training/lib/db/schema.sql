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
CREATE TABLE IF NOT EXISTS public.resist_program_templates (
    program_template_id  INTEGER NOT NULL 
                                         GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                         PRIMARY KEY,
    template_name                   VARCHAR(100)  NOT NULL,
    phase_focus                     VARCHAR(50),  -- or: INTEGER NOT NULL REFERENCES public.phases(id)
    periodization_type              VARCHAR(50),  -- or: INTEGER NOT NULL REFERENCES public.periodization_types(id)
    progression_rules               JSONB,
    difficulty_level                VARCHAR(50),
    notes                           TEXT,
    created_at                      TIMESTAMPTZ    DEFAULT now(),
    updated_at                      TIMESTAMPTZ
);

ALTER TABLE public.resist_program_templates
    OWNER TO postgres;


-- ───────────────────────────────────────────────────────────────────
-- 1) Planned exercises (hybrid defaults + JSONB detail)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resist_program_exercises_planned (
  program_exercises_planned_id INTEGER NOT NULL 
                                         GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                         PRIMARY KEY,
  program_id   INTEGER NOT NULL
    REFERENCES public.resist_programs(program_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,

  exercise_source     VARCHAR(20)  NOT NULL,
  exercise_library_id INTEGER      REFERENCES public.exercise_library(exercise_library_id)
                      ON UPDATE CASCADE ON DELETE SET NULL,
  user_exercise_library_id    INTEGER      REFERENCES public.resist_user_exercise_library(user_exercise_library_id)
                      ON UPDATE CASCADE ON DELETE SET NULL,
  pairing             VARCHAR(3),                -- e.g. 'A1','A2','WU','CD'
  notes               TEXT,

  planned_sets JSON NOT NULL DEFAULT '[]',
  /* sets is an array of ExerciseSets objects
    export interface ExerciseSets {
      set?: number;
      reps?: number;
      load?: string;
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


-- Table: public.resist_user_exercise_library
-- DROP TABLE IF EXISTS public.resist_user_exercise_library;
CREATE TABLE IF NOT EXISTS public.resist_user_exercise_library (
    user_exercise_library_id  INTEGER NOT NULL 
                                         GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                         PRIMARY KEY,
    user_id             INTEGER NOT NULL
                          REFERENCES public.users(id)
                            ON UPDATE CASCADE
                            ON DELETE CASCADE,
    exercise_name       VARCHAR(100) NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ,

    UNIQUE (user_id, exercise_name)
);

ALTER TABLE public.resist_user_exercise_library
    OWNER TO postgres;



-- ───────────────────────────────────────────────────────────────────
-- 2) Actual performance (same hybrid pattern)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resist_program_exercises_actual (
  program_exercises_actual_id            INTEGER NOT NULL 
                                         GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                         PRIMARY KEY,
  program_exercises_planned_id  INTEGER NOT NULL
    REFERENCES public.resist_program_exercises_planned(program_exercises_planned_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
  exercises_actual_date             TIMESTAMPTZ NOT NULL DEFAULT now(),
  pairing             VARCHAR(3),                -- e.g. 'A1','A2','WU','CD'
  notes                           TEXT,


  actual_sets JSON NOT NULL DEFAULT '[]',
  /* sets is an array of ExerciseSets objects
    export interface ExerciseSets {
      set?: number;
      reps?: number;
      load?: string;
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