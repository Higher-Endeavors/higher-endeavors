/* Stores user-defined exercises that are not in exercise_library. References public.users(id). */

CREATE TABLE public.user_exercises (
    id                  integer NOT NULL,
    user_id             integer NOT NULL,
    exercise_name       character varying(100) NOT NULL,
    description         text,
    created_at          timestamp with time zone DEFAULT now(),
    updated_at          timestamp with time zone
);

ALTER TABLE public.user_exercises OWNER TO postgres;

-- Use GENERATED ALWAYS AS IDENTITY for primary key
ALTER TABLE public.user_exercises
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.user_exercises_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

-- Primary Key
ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_pkey PRIMARY KEY (id);

-- Foreign key to users
ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

/* Holds reusable "stock" program templates that a user can copy. */

CREATE TABLE public.resistance_program_templates (
    id                  integer NOT NULL,
    template_name       character varying(100) NOT NULL,
    periodization_type  character varying(50),
    notes               text,
    created_at          timestamp with time zone DEFAULT now(),
    updated_at          timestamp with time zone
);

ALTER TABLE public.resistance_program_templates OWNER TO postgres;

ALTER TABLE public.resistance_program_templates
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.resistance_program_templates_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.resistance_program_templates
    ADD CONSTRAINT resistance_program_templates_pkey PRIMARY KEY (id);

/* Each user's actual, individualized program. Optionally references a template. */

CREATE TABLE public.resistance_programs (
    id                  integer NOT NULL,
    user_id             integer NOT NULL,
    program_name        character varying(100) NOT NULL,
    periodization_type  character varying(50),
    phase_focus         character varying(50),
    template_id         integer,
    start_date          date,
    end_date            date,
    notes               text,
    progression_rules   JSONB,
    created_at          timestamp with time zone DEFAULT now(),
    updated_at          timestamp with time zone
);

ALTER TABLE public.resistance_programs OWNER TO postgres;

ALTER TABLE public.resistance_programs
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.resistance_programs_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.resistance_programs
    ADD CONSTRAINT resistance_programs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.resistance_programs
    ADD CONSTRAINT resistance_programs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

ALTER TABLE ONLY public.resistance_programs
    ADD CONSTRAINT resistance_programs_template_id_fkey
    FOREIGN KEY (template_id) REFERENCES public.resistance_program_templates(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

/* Breaks each user's program into discrete weeks (Week 1, Week 2, etc.). */

CREATE TABLE public.program_weeks (
    id                      integer NOT NULL,
    resistance_program_id   integer NOT NULL,
    week_number             integer NOT NULL,
    notes                   text,
    created_at              timestamp with time zone DEFAULT now(),
    updated_at              timestamp with time zone
);

ALTER TABLE public.program_weeks OWNER TO postgres;

ALTER TABLE public.program_weeks
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.program_weeks_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.program_weeks
    ADD CONSTRAINT program_weeks_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.program_weeks
    ADD CONSTRAINT program_weeks_resistance_program_id_fkey
    FOREIGN KEY (resistance_program_id) REFERENCES public.resistance_programs(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

/* Each week can have multiple days (e.g., Day 1, Day 2). */

CREATE TABLE public.program_days (
    id                 integer NOT NULL,
    program_week_id    integer NOT NULL,
    day_number         integer,
    day_name           character varying(100),
    notes              text,
    created_at         timestamp with time zone DEFAULT now(),
    updated_at         timestamp with time zone
);

ALTER TABLE public.program_days OWNER TO postgres;

ALTER TABLE public.program_days
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.program_days_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.program_days
    ADD CONSTRAINT program_days_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.program_days
    ADD CONSTRAINT program_days_program_week_id_fkey
    FOREIGN KEY (program_week_id) REFERENCES public.program_weeks(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

/* Planned exercises for each day. May reference exercise_library or user_exercises. */

CREATE TABLE public.program_day_exercises (
    id                      integer NOT NULL,
    program_day_id          integer NOT NULL,
    exercise_source         character varying(20) NOT NULL
      CHECK (exercise_source IN ('library', 'user')),
    exercise_library_id     integer,
    user_exercise_id        integer,
    custom_exercise_name    character varying(100),
    pairing                 character varying(10)
      CHECK (pairing IS NULL OR pairing ~ '^([A-Z]\d{1,2}|WU|CD)$'),  -- Validates A1, A2, A3, etc., or WU, CD format
    notes                   text,
    order_index            integer,
    created_at             timestamp with time zone DEFAULT now(),
    updated_at             timestamp with time zone
);

ALTER TABLE public.program_day_exercises OWNER TO postgres;

ALTER TABLE public.program_day_exercises
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.program_day_exercises_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.program_day_exercises
    ADD CONSTRAINT program_day_exercises_pkey PRIMARY KEY (id);

-- Link to the day
ALTER TABLE ONLY public.program_day_exercises
    ADD CONSTRAINT program_day_exercises_day_fkey
    FOREIGN KEY (program_day_id) REFERENCES public.program_days(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

-- If referencing the standard exercise library
ALTER TABLE ONLY public.program_day_exercises
    ADD CONSTRAINT program_day_exercises_exercise_library_id_fkey
    FOREIGN KEY (exercise_library_id) REFERENCES public.exercise_library(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- If referencing a user-defined exercise
ALTER TABLE ONLY public.program_day_exercises
    ADD CONSTRAINT program_day_exercises_user_exercise_id_fkey
    FOREIGN KEY (user_exercise_id) REFERENCES public.user_exercises(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

/* The planned sets, reps, load, rest, etc. for each exercise on that day. */

CREATE TABLE public.program_day_exercise_sets (
    id                       integer NOT NULL,
    program_day_exercise_id  integer NOT NULL,
    set_number               integer NOT NULL,
    planned_reps             integer NOT NULL,
    planned_load             numeric(6,2),
    load_unit                character varying(20),
    planned_rest             integer,    -- in seconds
    planned_tempo            character varying(20),
    rpe                      numeric(3,1),  -- Rating of Perceived Exertion (1-10 scale, with .5 increments)
    rir                      integer,       -- Reps in Reserve (0-5 typically)
    notes                    text,
    created_at               timestamp with time zone DEFAULT now(),
    updated_at               timestamp with time zone
);

ALTER TABLE public.program_day_exercise_sets OWNER TO postgres;

ALTER TABLE public.program_day_exercise_sets
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.program_day_exercise_sets_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.program_day_exercise_sets
    ADD CONSTRAINT program_day_exercise_sets_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.program_day_exercise_sets
    ADD CONSTRAINT program_day_exercise_sets_day_exercise_id_fkey
    FOREIGN KEY (program_day_exercise_id) REFERENCES public.program_day_exercises(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

/* Advanced sets are sets that are part of a Drop set, Cluster set, or Rest-Pause set. */

CREATE TABLE public.program_day_exercise_sub_sets (
    id                            integer NOT NULL,
    program_day_exercise_set_id   integer NOT NULL,
    sub_set_number               integer NOT NULL,
    planned_reps                 integer NOT NULL,
    planned_load                 numeric(6,2),
    load_unit                    character varying(20),
    planned_rest                 integer,
    planned_tempo                character varying(20),
    rpe                         numeric(3,1),  -- Rating of Perceived Exertion
    rir                         integer,       -- Reps in Reserve
    created_at                   timestamp with time zone DEFAULT now(),
    updated_at                   timestamp with time zone
);

ALTER TABLE public.program_day_exercise_sub_sets OWNER TO postgres;

ALTER TABLE public.program_day_exercise_sub_sets
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.program_day_exercise_sub_sets_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.program_day_exercise_sub_sets
    ADD CONSTRAINT program_day_exercise_sub_sets_pkey PRIMARY KEY (id);

/* When a user performs a workout (one day in the program), we store that event here. */

CREATE TABLE public.user_actual_sessions (
    id                  integer NOT NULL,
    user_id             integer NOT NULL,
    program_day_id      integer,            -- optional if you want to allow "ad-hoc" workouts
    session_date        date NOT NULL,
    notes               text,
    created_at          timestamp with time zone DEFAULT now(),
    updated_at          timestamp with time zone
);

ALTER TABLE public.user_actual_sessions OWNER TO postgres;

ALTER TABLE public.user_actual_sessions
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.user_actual_sessions_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.user_actual_sessions
    ADD CONSTRAINT user_actual_sessions_pkey PRIMARY KEY (id);

-- The user who performed this session
ALTER TABLE ONLY public.user_actual_sessions
    ADD CONSTRAINT user_actual_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

-- If the session is tied to a planned day, reference it
ALTER TABLE ONLY public.user_actual_sessions
    ADD CONSTRAINT user_actual_sessions_program_day_id_fkey
    FOREIGN KEY (program_day_id) REFERENCES public.program_days(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

/* Stores the actual sets a user performed. May link back to the "planned" set for easy Plan vs. Actual comparisons. */

CREATE TABLE public.user_actual_exercise_sets (
    id                           integer NOT NULL,
    user_actual_session_id       integer NOT NULL,
    program_day_exercise_set_id  integer,    -- link to planned set
    actual_set_number            integer,
    actual_reps                  integer,
    actual_load                  numeric(6,2),
    load_unit                    character varying(20),
    actual_rest                  integer,    -- in seconds
    actual_tempo                 character varying(20),
    notes                        text,
    created_at                   timestamp with time zone DEFAULT now(),
    updated_at                   timestamp with time zone
);

ALTER TABLE public.user_actual_exercise_sets OWNER TO postgres;

ALTER TABLE public.user_actual_exercise_sets
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
        SEQUENCE NAME public.user_actual_exercise_sets_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    );

ALTER TABLE ONLY public.user_actual_exercise_sets
    ADD CONSTRAINT user_actual_exercise_sets_pkey PRIMARY KEY (id);

-- Session reference
ALTER TABLE ONLY public.user_actual_exercise_sets
    ADD CONSTRAINT user_actual_exercise_sets_session_id_fkey
    FOREIGN KEY (user_actual_session_id) REFERENCES public.user_actual_sessions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

-- Optional reference to the planned set (if any)
ALTER TABLE ONLY public.user_actual_exercise_sets
    ADD CONSTRAINT user_actual_exercise_sets_planned_set_fkey
    FOREIGN KEY (program_day_exercise_set_id) REFERENCES public.program_day_exercise_sets(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- For finding programs by name, type, and date ranges
CREATE INDEX idx_resistance_programs_search 
ON public.resistance_programs (user_id, program_name, periodization_type, start_date, end_date);

-- For template-based searches
CREATE INDEX idx_program_templates_search 
ON public.resistance_program_templates (template_name, periodization_type);

-- For querying session performance
CREATE INDEX idx_user_actual_sessions_analysis
ON public.user_actual_sessions (user_id, session_date);

-- For exercise performance tracking
CREATE INDEX idx_program_day_exercises_analysis
ON public.program_day_exercises (exercise_library_id, exercise_source)
WHERE exercise_source = 'library';  -- Partial index for library exercises

-- For comparing planned vs actual performance
CREATE INDEX idx_actual_exercise_sets_comparison
ON public.user_actual_exercise_sets (user_actual_session_id, program_day_exercise_set_id);

-- For tracking load progression over time
CREATE INDEX idx_exercise_sets_load_tracking
ON public.program_day_exercise_sets (program_day_exercise_id, planned_load)
WHERE planned_load IS NOT NULL;

-- For retrieving weekly programs
CREATE INDEX idx_program_weeks_lookup
ON public.program_weeks (resistance_program_id, week_number);

-- For retrieving daily workouts
CREATE INDEX idx_program_days_lookup
ON public.program_days (program_week_id, day_number);

-- For exercise ordering within a day
CREATE INDEX idx_exercise_order
ON public.program_day_exercises (program_day_id, order_index);

-- For user exercise searches
CREATE INDEX idx_user_exercises_search
ON public.user_exercises (user_id, exercise_name);

