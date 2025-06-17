-- CME Metrics Reference Table
CREATE TABLE IF NOT EXISTS public.cme_metrics (
    cme_metric_id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL UNIQUE
);

-- ENUM for Step Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cme_step_type') THEN
        CREATE TYPE cme_step_type AS ENUM ('Warm-Up', 'Work', 'Recovery', 'Cool-Down');
    END IF;
END$$;

-- Table: public.cme_programs
CREATE TABLE IF NOT EXISTS public.cme_programs (
    cme_program_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    program_name VARCHAR(100) NOT NULL,
    goal VARCHAR(100),
    periodization_type VARCHAR(50),
    progression_rules JSONB,
    program_duration SMALLINT,
    notes TEXT,
    template_id INTEGER REFERENCES public.cme_program_templates(cme_program_template_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- Table: public.cme_program_templates
CREATE TABLE IF NOT EXISTS public.cme_program_templates (
    cme_program_template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    goal VARCHAR(100),
    periodization_type VARCHAR(50),
    progression_rules JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);


-- Table: public.cme_program_day_sessions (planned sessions for a day)
CREATE TABLE IF NOT EXISTS public.cme_program_day_sessions (
    cme_program_day_session_id SERIAL PRIMARY KEY,
    cme_program_id  INTEGER NOT NULL
        REFERENCES public.cme_programs(cme_program_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    week_number     SMALLINT NOT NULL CHECK (week_number > 0),
    day_number      SMALLINT NOT NULL CHECK (day_number > 0),
    session_type VARCHAR(50) NOT NULL, -- e.g., run, bike, swim
    session_name VARCHAR(100),
    planned_distance NUMERIC(6,2),
    planned_duration INTEGER, -- seconds
    planned_intensity JSONB, -- e.g., {"pace": "5:00/km", "hr_zone": 3, "power": 200}
    -- Catch-all for per-step details; each object must include a "type": "Warm-Up" | "Work" | "Recovery" | "Cool-Down"
    detail JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    order_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);


-- Table: public.cme_user_actual_sessions (completed session logs)
CREATE TABLE IF NOT EXISTS public.cme_user_actual_sessions (
    cme_user_actual_session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES public.users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    cme_program_day_session_id INTEGER
        REFERENCES public.cme_program_day_sessions(cme_program_day_session_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    session_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- Table: public.cme_session_interval_perfs (actual performance for each interval/step)
CREATE TABLE IF NOT EXISTS public.cme_session_interval_perfs (
    cme_session_interval_perf_id SERIAL PRIMARY KEY,
    cme_user_actual_session_id INTEGER NOT NULL
        REFERENCES public.cme_user_actual_sessions(cme_user_actual_session_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    step_number SMALLINT NOT NULL CHECK (step_number > 0),
    step_type cme_step_type NOT NULL,
    actual_duration INTEGER, -- seconds
    actual_distance       NUMERIC(8,2),    -- e.g. meters or miles
    actual_intensity NUMERIC(10,2),
    actual_avg_speed      NUMERIC(6,3),    -- m/s or min/km (convert as needed)
    actual_active_calories INTEGER,        -- kcal
    actual_avg_heart_rate SMALLINT,        -- bpm
    cme_metric_id INTEGER REFERENCES public.cme_metrics(cme_metric_id),
    actual_tempo VARCHAR(20),
    actual_rest INTEGER, -- seconds
    detail JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);


CREATE TABLE public.cme_interval_metrics (
  metric_id                         SERIAL PRIMARY KEY,
  cme_session_interval_perf_id      INTEGER NOT NULL
    REFERENCES public.cme_session_interval_perfs(cme_session_interval_perf_id)
      ON UPDATE CASCADE ON DELETE CASCADE,
  cme_metric_id                     INTEGER     NOT NULL
    REFERENCES public.cme_metrics(cme_metric_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
  metric_value                      NUMERIC(10,3) NOT NULL,
  metric_unit                       VARCHAR(20),           -- 'bpm','W','rpm','m/s'
  recorded_offset_seconds           INTEGER,               -- sec since interval start
  source                            VARCHAR(50),           -- 'Garmin','Apple','manual'
  created_at                        TIMESTAMPTZ DEFAULT now()
);

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
    'cme_programs',
    'cme_program_templates',
    'cme_program_day_sessions',
    'cme_user_actual_sessions',
    'cme_session_interval_perfs'
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
