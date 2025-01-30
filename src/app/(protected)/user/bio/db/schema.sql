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