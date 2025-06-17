-- Table: public.resistance_programs
-- DROP TABLE IF EXISTS public.resistance_programs;
CREATE TABLE IF NOT EXISTS public.resist_resistance_programs (
    resistance_program_id           SERIAL PRIMARY KEY,
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
    template_id                     INTEGER
                                         REFERENCES public.resistance_program_templates(resistance_program_template_id)
                                           ON UPDATE CASCADE
                                           ON DELETE SET NULL,
    start_date                      DATE,
    created_at                      TIMESTAMPTZ    DEFAULT now(),
    updated_at                      TIMESTAMPTZ
);

ALTER TABLE public.resist_resistance_programs
    OWNER TO postgres;


-- Table: public.resistance_program_templates
-- DROP TABLE IF EXISTS public.resistance_program_templates;
CREATE TABLE IF NOT EXISTS public.resist_resistance_program_templates (
    resistance_program_template_id  SERIAL PRIMARY KEY,
    template_name                   VARCHAR(100)  NOT NULL,
    phase_focus                     VARCHAR(50),  -- or: INTEGER NOT NULL REFERENCES public.phases(id)
    periodization_type              VARCHAR(50),  -- or: INTEGER NOT NULL REFERENCES public.periodization_types(id)
    progression_rules               JSONB,
    notes                           TEXT,
    created_at                      TIMESTAMPTZ    DEFAULT now(),
    updated_at                      TIMESTAMPTZ
);

ALTER TABLE public.resist_resistance_program_templates
    OWNER TO postgres;


-- ───────────────────────────────────────────────────────────────────
-- 1) Planned exercises (hybrid defaults + JSONB detail)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resist_program_day_exercises (
  program_day_exercise_id SERIAL PRIMARY KEY,
  resistance_program_id   INTEGER NOT NULL
    REFERENCES public.resist_resistance_programs(resistance_program_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,

  week_number  SMALLINT NOT NULL CHECK (week_number  > 0),
  day_number   SMALLINT NOT NULL CHECK (day_number   > 0),

  exercise_source     VARCHAR(20)  NOT NULL,
  exercise_library_id INTEGER      REFERENCES public.exercise_library(exercise_library_id)
                      ON UPDATE CASCADE ON DELETE SET NULL,
  user_exercise_id    INTEGER      REFERENCES public.user_exercises(user_exercise_id)
                      ON UPDATE CASCADE ON DELETE SET NULL,
  pairing             VARCHAR(3),                -- e.g. 'A1','A2','WU','CD'

  -- ── uniform/planned defaults ──
  set_count        SMALLINT    NOT NULL CHECK (set_count > 0),
  default_reps     SMALLINT,                 -- if every set uses same reps
default_load     VARCHAR(20),             -- e.g. "100", "band-red"
  default_rest_sec INTEGER,                  -- uniform rest
  tempo_eccentric  VARCHAR(2),                -- always present together
  tempo_pause_1    VARCHAR(2),
  tempo_concentric VARCHAR(2),
  tempo_pause_2    VARCHAR(2),
  default_rpe      SMALLINT,                 -- uniform RPE
  default_rir      SMALLINT,                 -- uniform RIR

  -- Each object in `detail` must include a "type" field: "standard" | "varied" | "advanced"
  -- ── catch-all for any per-set or per-cluster overrides ──
  detail JSONB NOT NULL DEFAULT '[]',
  /* examples:
     -- varied:
     [
       { "set":1, "reps":12, "load":90 },
       { "set":2, "reps":10, "load":100 },
       { "set":3, "reps": 8, "load":110 }
     ]
     -- advanced:
     [
       { "cluster":1, "reps":5, "load":80,  "rest_sec":10 },
       { "cluster":1, "reps":5, "load":80,  "rest_sec":120 },
       { "cluster":2, "reps":5, "load":80,  "rest_sec":10 },
       { "cluster":2, "reps":5, "load":80,  "rest_sec":120 }
     ]
  */

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Table: public.user_exercises
-- DROP TABLE IF EXISTS public.user_exercises;
CREATE TABLE IF NOT EXISTS public.resist_user_exercises (
    user_exercises_id  SERIAL PRIMARY KEY,  -- was integer GENERATED … + PRIMARY KEY(id)
    user_id             INTEGER NOT NULL
                          REFERENCES public.users(id)
                            ON UPDATE CASCADE
                            ON DELETE CASCADE,
    exercise_name       VARCHAR(100) NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ

    UNIQUE (user_id, exercise_name)
);

ALTER TABLE public.resist_user_exercises
    OWNER TO postgres;



-- ───────────────────────────────────────────────────────────────────
-- 2) Actual performance (same hybrid pattern)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resist_program_day_exercise_perfs (
  perf_id                  SERIAL PRIMARY KEY,
  program_day_exercise_id  INTEGER NOT NULL
    REFERENCES public.resist_program_day_exercises(program_day_exercise_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
  performed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ── actual defaults ──
  set_count        SMALLINT    NOT NULL CHECK (set_count > 0),
  actual_reps      SMALLINT,                 -- if every performed set used same reps
  actual_load      VARCHAR(20),             -- e.g. "88", "band-blue"
  actual_rest_sec  INTEGER,                  -- uniform rest in performance
  actual_rpe       SMALLINT,                 -- if uniform
  actual_rir       SMALLINT,                 -- if uniform

  -- Each object in `detail` must include a "type" field: "standard" | "varied" | "advanced"
  -- ── catch-all JSONB for any per-set/per-cluster variation in performance ──
  detail JSONB NOT NULL DEFAULT '[]',
  /* e.g. [
       { "set":1, "reps":12, "load":88,  "rest_sec":60, "rpe":8,  "rir":2 },
       { "set":2, "reps":10, "load":90,  "rest_sec":60, "rpe":8,  "rir":1 },
       …
     ]
  */

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Table: public.user_actual_sessions
-- DROP TABLE IF EXISTS public.user_actual_sessions;
CREATE TABLE IF NOT EXISTS public.resist_user_actual_sessions (
    user_actual_session_id  SERIAL PRIMARY KEY,

    user_id                 INTEGER NOT NULL
                               REFERENCES public.users(user_id)
                                 ON UPDATE CASCADE
                                 ON DELETE CASCADE,

    program_day_id          INTEGER, -- no FK (program_days table removed)

    session_date            DATE NOT NULL,
    notes                   TEXT,

    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ
)
TABLESPACE pg_default;

ALTER TABLE public.resist_user_actual_sessions
    OWNER TO postgres;



-- function to auto-update `updated_at`
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to update `updated_at` on change
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN ARRAY[
    'resist_resistance_programs',
    'resist_resistance_program_templates',
    'resist_program_day_exercises',
    'resist_user_exercises',
    'resist_program_day_exercise_perfs',
    'resist_user_actual_sessions'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%s_timestamp ON public.%s;', tbl, tbl);
    EXECUTE format('
      CREATE TRIGGER set_%s_timestamp
      BEFORE UPDATE ON public.%s
      FOR EACH ROW
      EXECUTE PROCEDURE public.trigger_set_timestamp();',
      tbl, tbl
    );
  END LOOP;
END;
$$;