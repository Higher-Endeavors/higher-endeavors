-- Drop existing objects first
DROP TRIGGER IF EXISTS sync_bio_from_intake_trigger ON public.user_intake;
DROP FUNCTION IF EXISTS sync_bio_from_intake();
DROP TABLE IF EXISTS public.user_intake;

-- Create the table
CREATE TABLE public.user_intake (
    id                  integer GENERATED ALWAYS AS IDENTITY
                               (START WITH 1 INCREMENT BY 1) NOT NULL,
    user_id             integer NOT NULL,
    intake_responses    jsonb NOT NULL,
    submitted_date      timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_intake_pkey PRIMARY KEY (id),
    CONSTRAINT user_intake_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT user_intake_user_id_uk UNIQUE (user_id)
);