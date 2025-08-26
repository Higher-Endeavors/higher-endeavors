CREATE TABLE public.user_bio (
    id                  integer GENERATED ALWAYS AS IDENTITY
                               (START WITH 1 INCREMENT BY 1) NOT NULL,
    user_id             integer NOT NULL,
    address_line_1      varchar(255) ,
    address_line_2      varchar(255),
    city                varchar(255) ,
    state_province      varchar(255),
    postal_code         varchar(50)  ,
    country             varchar(50)  ,
    phone_number        varchar(20)  ,
    date_of_birth       date NOT NULL,
    gender              varchar(20) NOT NULL,
    height              varchar(50) NOT NULL,
    created_date        timestamp with time zone NOT NULL DEFAULT now(),
    updated_date        timestamp with time zone,
    CONSTRAINT user_bio_pkey PRIMARY KEY (id),
    CONSTRAINT user_bio_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT user_bio_user_id_uk UNIQUE (user_id),
    CONSTRAINT user_bio_phone_number_uk UNIQUE (phone_number)
);

-- Table: public.user_bio_hr_zones
-- Heart Rate Zones table for storing user's HR zone configurations
CREATE TABLE public.user_bio_hr_zones (
    hr_zone_id          integer NOT NULL
                                GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 )
                                PRIMARY KEY,
    user_id             integer NOT NULL
                            REFERENCES public.users (id)
                                ON UPDATE CASCADE
                                ON DELETE CASCADE,
    calculation_method  varchar(50) NOT NULL, -- 'age', 'karvonen', 'manual', 'custom'
    activity_type       varchar(50) NOT NULL DEFAULT 'general', -- 'general', 'running', 'cycling', 'swimming', 'rowing'
    zone_ranges         JSONB NOT NULL DEFAULT '[]',
    max_heart_rate      integer, -- Stored for reference
    resting_heart_rate  integer, -- Stored for Karvonen method
    created_date        timestamp with time zone NOT NULL DEFAULT now(),
    updated_date        timestamp with time zone,
    
        
    CONSTRAINT user_bio_hr_zones_user_activity_uk 
        UNIQUE (user_id, activity_type),
    CONSTRAINT user_bio_hr_zones_calculation_method_check 
        CHECK (calculation_method IN ('age', 'karvonen', 'manual', 'custom')),
    CONSTRAINT user_bio_hr_zones_activity_type_check 
        CHECK (activity_type IN ('general', 'running', 'cycling', 'swimming', 'rowing'))
);

-- Example of zone_ranges JSON structure:
-- [
--   {
--     "id": 1,
--     "minBpm": 95,
--     "maxBpm": 114
--   },
--   {
--     "id": 2,
--     "minBpm": 114,
--     "maxBpm": 133
--   }
--   ... etc for all 5 zones
-- ]
-- 
-- Note: Zone names, descriptions, and colors are handled by the frontend
-- and reconstructed from the zone ID when loading data.