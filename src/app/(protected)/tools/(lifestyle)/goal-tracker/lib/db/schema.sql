-- Table: public.user_goals

-- DROP TABLE IF EXISTS public.user_goals;

CREATE TABLE IF NOT EXISTS public.user_goals (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    parent_id integer,
    name character varying(100) NOT NULL,
    goal_focus character varying(50) NOT NULL,
    goal_type character varying(20) NOT NULL,
    goal_tracking character varying(30) NOT NULL,
    custom_metric character varying(50),
    goal_value numeric(8,2),
    start_date date NOT NULL,
    end_date date,
    ongoing boolean NOT NULL DEFAULT false,
    repeat_frequency character varying(20),
    repeat_interval integer,
    notes text,
    status character varying(20) NOT NULL DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_goals_parent_id_fkey FOREIGN KEY (parent_id)
        REFERENCES public.user_goals (id) ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals (user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_parent_id ON public.user_goals (parent_id);



-- Table: public.goal_body_composition_targets

-- DROP TABLE IF EXISTS public.goal_body_composition_targets;

CREATE TABLE IF NOT EXISTS public.goal_body_composition_targets (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    goal_id integer NOT NULL,
    target_body_weight numeric(6,2),
    target_body_fat_percentage numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT goal_body_comp_goal_id_fkey FOREIGN KEY (goal_id)
        REFERENCES public.user_goals (id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_goal_body_comp_goal_id ON public.goal_body_composition_targets (goal_id);



-- Table: public.goal_audit_log

-- DROP TABLE IF EXISTS public.goal_audit_log;

CREATE TABLE IF NOT EXISTS public.goal_audit_log (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    goal_id integer NOT NULL,
    user_id integer NOT NULL,
    action character varying(30) NOT NULL, -- e.g., 'created', 'updated', 'deleted'
    change_details jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT goal_audit_log_goal_id_fkey FOREIGN KEY (goal_id)
        REFERENCES public.user_goals (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT goal_audit_log_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_goal_audit_log_goal_id ON public.goal_audit_log (goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_audit_log_user_id ON public.goal_audit_log (user_id);