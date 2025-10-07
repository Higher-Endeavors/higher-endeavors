-- ───────────────────────────────────────────────────────────────────
-- Periodization Planning Schema
-- ───────────────────────────────────────────────────────────────────

-- NOTE:
--   • All identity columns follow the project convention of
--     GENERATED ALWAYS AS IDENTITY (increment by 1 starting at 1)
--   • Foreign keys reference existing tables inside the higher endeavors schema
--   • JSONB columns are used for modality-specific nested structures so that we
--     can store the full PlanningModal payload without data duplication.


-- ───────────────────────────────────────────────────────────────────
-- 1) Plans (top-level container)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.periodization_plans (
    periodization_plan_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    user_id               INTEGER NOT NULL
        REFERENCES public.users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    plan_name             VARCHAR(150) NOT NULL,
    plan_start_date       DATE         NOT NULL DEFAULT DATE_TRUNC('year', CURRENT_DATE),
    plan_end_date         DATE         NOT NULL DEFAULT (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day'),
    total_weeks           SMALLINT     NOT NULL CHECK (total_weeks BETWEEN 1 AND 104),
    settings              JSONB        DEFAULT '{}',
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.periodization_plans
    OWNER TO postgres;


-- ───────────────────────────────────────────────────────────────────
-- 2) Phases (shared structure across modalities)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.periodization_phases (
    periodization_phase_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_plan_id  INTEGER NOT NULL
        REFERENCES public.periodization_plans (periodization_plan_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    phase_name             VARCHAR(150) NOT NULL,
    phase_type             VARCHAR(25) NOT NULL CHECK (phase_type IN ('resistance', 'cme', 'recovery')),
    start_week             SMALLINT NOT NULL CHECK (start_week >= 0),
    duration_weeks         SMALLINT NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
    color_token            VARCHAR(30),
    sub_phase_config       JSONB,
    program_config         JSONB,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodization_plan_id, phase_name)
);

ALTER TABLE public.periodization_phases
    OWNER TO postgres;


-- ───────────────────────────────────────────────────────────────────
-- 3) Goals linked directly to a plan (legacy + new goals)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.periodization_goals (
    periodization_goal_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_plan_id INTEGER NOT NULL
        REFERENCES public.periodization_plans (periodization_plan_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    goal_type             VARCHAR(25) NOT NULL DEFAULT 'goal',
    item_type             VARCHAR(25) NOT NULL DEFAULT 'goal',
    goal_name             VARCHAR(150) NOT NULL,
    goal_description      TEXT,
    target_date           DATE,
    target_value          NUMERIC,
    current_value         NUMERIC,
    unit                  VARCHAR(50),
    status                VARCHAR(20) NOT NULL DEFAULT 'pending',
    color_token           VARCHAR(30),
    payload               JSONB,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.periodization_goals
    OWNER TO postgres;


-- ───────────────────────────────────────────────────────────────────
-- 4) Planning Items (hub table) + modality detail tables
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.periodization_planning_items (
    periodization_planning_item_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_plan_id          INTEGER NOT NULL
        REFERENCES public.periodization_plans (periodization_plan_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    user_id                        INTEGER NOT NULL
        REFERENCES public.users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    planning_type                  VARCHAR(25) NOT NULL CHECK (planning_type IN ('resistance', 'cardiometabolic', 'recovery', 'goal', 'milestone', 'event')),
    modality_context               VARCHAR(25),
    week_number                    SMALLINT CHECK (week_number >= 0),
    start_date                     DATE,
    end_date                       DATE,
    duration_weeks                 SMALLINT CHECK (duration_weeks BETWEEN 1 AND 52),
    notes                          TEXT,
    priority_level                 VARCHAR(15) DEFAULT 'medium',
    metadata                       JSONB,
    created_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.periodization_planning_items
    OWNER TO postgres;


-- 4a) Resistance Training planning details
CREATE TABLE IF NOT EXISTS public.periodization_resistance_items (
    periodization_resistance_item_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_planning_item_id   INTEGER NOT NULL
        REFERENCES public.periodization_planning_items (periodization_planning_item_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    phase_focus                      VARCHAR(120),
    phase_start_date                 DATE,
    phase_duration_weeks             SMALLINT CHECK (phase_duration_weeks BETWEEN 1 AND 52),
    phase_end_date                   DATE,
    periodization_type               VARCHAR(50),
    periodization_start_date         DATE,
    periodization_duration_weeks     SMALLINT CHECK (periodization_duration_weeks BETWEEN 1 AND 52),
    periodization_end_date           DATE,
    programming_rules                JSONB,
    volume_increment                 NUMERIC,
    load_increment                   NUMERIC,
    weekly_volumes                   JSONB,
    programs_config                  JSONB,
    intensity_score                  SMALLINT CHECK (intensity_score BETWEEN 1 AND 10),
    volume_target                    SMALLINT CHECK (volume_target >= 0),
    is_deload                        BOOLEAN DEFAULT FALSE,
    notes                            TEXT,
    created_at                       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodization_planning_item_id)
);

ALTER TABLE public.periodization_resistance_items
    OWNER TO postgres;


-- 4b) Cardiometabolic training details
CREATE TABLE IF NOT EXISTS public.periodization_cardiometabolic_items (
    periodization_cardiometabolic_item_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_planning_item_id        INTEGER NOT NULL
        REFERENCES public.periodization_planning_items (periodization_planning_item_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    macrocycle_phase                      VARCHAR(120),
    focus_block                           VARCHAR(120),
    start_date_override                   DATE,
    duration_weeks                        SMALLINT CHECK (duration_weeks BETWEEN 1 AND 52),
    end_date_override                     DATE,
    activity_type                         VARCHAR(40),
    weekly_volume_minutes                 SMALLINT CHECK (weekly_volume_minutes BETWEEN 0 AND 1000),
    intensity_distribution                JSONB,
    ramp_rate_percent                     NUMERIC,
    sessions_config                       JSONB,
    week_overrides                        JSONB,
    notes                                 TEXT,
    created_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodization_planning_item_id)
);

ALTER TABLE public.periodization_cardiometabolic_items
    OWNER TO postgres;


-- 4c) Recovery planning details
CREATE TABLE IF NOT EXISTS public.periodization_recovery_items (
    periodization_recovery_item_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_planning_item_id  INTEGER NOT NULL
        REFERENCES public.periodization_planning_items (periodization_planning_item_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    recovery_type                   VARCHAR(50),
    start_date_override             DATE,
    duration_weeks                  SMALLINT CHECK (duration_weeks BETWEEN 1 AND 52),
    end_date_override               DATE,
    notes                           TEXT,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodization_planning_item_id)
);

ALTER TABLE public.periodization_recovery_items
    OWNER TO postgres;


-- 4d) Goal, Milestone, Event (shared detail table)
CREATE TABLE IF NOT EXISTS public.periodization_lifestyle_event_items (
    periodization_lifestyle_event_item_id INTEGER NOT NULL
        GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
        PRIMARY KEY,
    periodization_planning_item_id  INTEGER NOT NULL
        REFERENCES public.periodization_planning_items (periodization_planning_item_id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    item_kind                       VARCHAR(20) NOT NULL CHECK (item_kind IN ('goal', 'milestone', 'event')),
    item_name                       VARCHAR(150) NOT NULL,
    description                     TEXT,
    start_date_override             DATE,
    end_date_override               DATE,
    duration_weeks                  SMALLINT CHECK (duration_weeks BETWEEN 1 AND 52),
    status                          VARCHAR(25),
    priority_level                  VARCHAR(15),
    goal_payload                    JSONB,
    event_payload                   JSONB,
    notes                           TEXT,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodization_planning_item_id)
);

ALTER TABLE public.periodization_lifestyle_event_items
    OWNER TO postgres;


-- ───────────────────────────────────────────────────────────────────
-- 5) Index recommendations
-- ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_periodization_plans_user ON public.periodization_plans (user_id);
CREATE INDEX IF NOT EXISTS idx_periodization_phases_plan ON public.periodization_phases (periodization_plan_id);
CREATE INDEX IF NOT EXISTS idx_periodization_goals_plan ON public.periodization_goals (periodization_plan_id);
CREATE INDEX IF NOT EXISTS idx_periodization_planning_items_plan ON public.periodization_planning_items (periodization_plan_id);
CREATE INDEX IF NOT EXISTS idx_periodization_planning_items_user ON public.periodization_planning_items (user_id);
CREATE INDEX IF NOT EXISTS idx_periodization_planning_items_type ON public.periodization_planning_items (planning_type);
CREATE INDEX IF NOT EXISTS idx_periodization_resistance_item ON public.periodization_resistance_items (periodization_planning_item_id);
CREATE INDEX IF NOT EXISTS idx_periodization_cardiometabolic_item ON public.periodization_cardiometabolic_items (periodization_planning_item_id);
CREATE INDEX IF NOT EXISTS idx_periodization_recovery_item ON public.periodization_recovery_items (periodization_planning_item_id);
CREATE INDEX IF NOT EXISTS idx_periodization_goal_event_item ON public.periodization_goal_event_items (item_kind);

