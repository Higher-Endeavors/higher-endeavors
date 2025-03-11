CREATE TABLE public.user_settings (
    user_id             INTEGER NOT NULL,

    -- Example stable "general" settings
    height_unit         VARCHAR(20) DEFAULT 'imperial',
    weight_unit         VARCHAR(20) DEFAULT 'lbs',
    temperature_unit    VARCHAR(5)  DEFAULT 'F',
    time_format         VARCHAR(5)  DEFAULT '12h',
    date_format         VARCHAR(10) DEFAULT 'MM/DD/YYYY',
    language            VARCHAR(10) DEFAULT 'en',
    notifications_email BOOLEAN     DEFAULT TRUE,
    notifications_text  BOOLEAN     DEFAULT FALSE,
    notifications_app   BOOLEAN     DEFAULT FALSE,

    -- JSONB for frequently evolving “pillar” settings
    pillar_settings     JSONB       NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Primary key on user_id
    CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),

    -- Foreign key referencing existing "users" table
    CONSTRAINT user_settings_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.users (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);