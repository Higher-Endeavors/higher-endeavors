-- Table: public.user_settings

DROP TABLE IF EXISTS public.user_settings;

CREATE TABLE IF NOT EXISTS public.user_settings
(
    user_settings_id INTEGER NOT NULL 
               GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
               PRIMARY KEY,
    user_id INTEGER NOT NULL
                REFERENCES public.users(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
    height_unit character varying(20) COLLATE pg_catalog."default" DEFAULT 'imperial'::character varying,
    weight_unit character varying(20) COLLATE pg_catalog."default" DEFAULT 'lbs'::character varying,
    temperature_unit character varying(5) COLLATE pg_catalog."default" DEFAULT 'F'::character varying,
    time_format character varying(5) COLLATE pg_catalog."default" DEFAULT '12h'::character varying,
    date_format character varying(10) COLLATE pg_catalog."default" DEFAULT 'MM/DD/YYYY'::character varying,
    language character varying(10) COLLATE pg_catalog."default" DEFAULT 'en'::character varying,
    sidebar_expand_mode character varying(10) COLLATE pg_catalog."default" DEFAULT 'hover'::character varying,
    notifications_email boolean DEFAULT true,
    notifications_text boolean DEFAULT false,
    notifications_app boolean DEFAULT false,
    garmin_connect_settings json DEFAULT NULL,
    fitness_settings json NOT NULL DEFAULT '{}'::json,
    health_settings json NOT NULL DEFAULT '{}'::json,
    lifestyle_settings json NOT NULL DEFAULT '{}'::json,
    nutrition_settings json NOT NULL DEFAULT '{}'::json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_settings
    OWNER to postgres;