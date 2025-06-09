-- Table: public.cardio_programs

CREATE TABLE IF NOT EXISTS public.cardio_programs
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    program_name character varying(100) NOT NULL,
    goal character varying(100),
    periodization_type character varying(50),
    start_date date,
    end_date date,
    notes text,
    progression_rules jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cardio_programs_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: public.cardio_program_weeks

CREATE TABLE IF NOT EXISTS public.cardio_program_weeks
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cardio_program_id integer NOT NULL,
    week_number integer NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cardio_program_weeks_program_id_fkey FOREIGN KEY (cardio_program_id)
        REFERENCES public.cardio_programs (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: public.cardio_program_days

CREATE TABLE IF NOT EXISTS public.cardio_program_days
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cardio_program_week_id integer NOT NULL,
    day_number integer,
    day_name character varying(100),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cardio_program_days_week_id_fkey FOREIGN KEY (cardio_program_week_id)
        REFERENCES public.cardio_program_weeks (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: public.cardio_sessions

CREATE TABLE IF NOT EXISTS public.cardio_sessions
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cardio_program_day_id integer NOT NULL,
    session_type character varying(50) NOT NULL, -- e.g., run, bike, swim
    session_name character varying(100),
    planned_distance numeric(6,2),
    planned_duration integer, -- seconds
    planned_intensity jsonb, -- e.g., {"pace": "5:00/km", "hr_zone": 3, "power": 200}
    notes text,
    order_index integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cardio_sessions_day_id_fkey FOREIGN KEY (cardio_program_day_id)
        REFERENCES public.cardio_program_days (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: public.cardio_session_intervals

CREATE TABLE IF NOT EXISTS public.cardio_session_intervals
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cardio_session_id integer NOT NULL,
    interval_number integer NOT NULL,
    interval_type character varying(50), -- e.g., warm-up, interval, cool-down
    planned_distance numeric(6,2),
    planned_duration integer, -- seconds
    planned_intensity jsonb, -- e.g., {"pace": "4:30/km", "hr_zone": 4, "power": 250}
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT cardio_session_intervals_session_id_fkey FOREIGN KEY (cardio_session_id)
        REFERENCES public.cardio_sessions (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: public.cardio_session_metrics

CREATE TABLE IF NOT EXISTS public.cardio_session_metrics
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cardio_session_id integer NOT NULL,
    metric_type character varying(50) NOT NULL, -- e.g., pace, heart_rate, power, calories, elevation
    metric_value numeric(10,2),
    metric_unit character varying(20),
    source character varying(50), -- e.g., Garmin, manual
    recorded_at timestamp with time zone,
    CONSTRAINT cardio_session_metrics_session_id_fkey FOREIGN KEY (cardio_session_id)
        REFERENCES public.cardio_sessions (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_cardio_program_weeks_lookup
    ON public.cardio_program_weeks (cardio_program_id ASC NULLS LAST, week_number ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_cardio_program_days_lookup
    ON public.cardio_program_days (cardio_program_week_id ASC NULLS LAST, day_number ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_cardio_sessions_order
    ON public.cardio_sessions (cardio_program_day_id ASC NULLS LAST, order_index ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_cardio_session_metrics_type
    ON public.cardio_session_metrics (cardio_session_id ASC NULLS LAST, metric_type ASC NULLS LAST);
