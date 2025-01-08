--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Postgres.app)
-- Dumped by pg_dump version 16.6 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    "providerAccountId" character varying(255) NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    id_token text,
    scope text,
    session_state text,
    token_type text
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: body_regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.body_regions (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.body_regions OWNER TO postgres;

--
-- Name: body_regions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.body_regions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.body_regions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: combination_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.combination_exercises (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.combination_exercises OWNER TO postgres;

--
-- Name: combination_exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.combination_exercises ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.combination_exercises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: continuous_alternating_arms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.continuous_alternating_arms (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.continuous_alternating_arms OWNER TO postgres;

--
-- Name: continuous_alternating_arms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.continuous_alternating_arms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.continuous_alternating_arms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: difficulties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.difficulties (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.difficulties OWNER TO postgres;

--
-- Name: difficulties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.difficulties ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.difficulties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_contacts (
    id bigint NOT NULL,
    first_name character varying(75) NOT NULL,
    last_name character varying(75) NOT NULL,
    email_address character varying(50) NOT NULL,
    contact_message text NOT NULL,
    contact_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_contacts OWNER TO postgres;

--
-- Name: email_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.email_contacts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.email_contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ending_load_positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ending_load_positions (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.ending_load_positions OWNER TO postgres;

--
-- Name: ending_load_positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ending_load_positions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ending_load_positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exercise_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_library (
    id integer NOT NULL,
    exercise_name character varying(100) NOT NULL,
    difficulty_id integer,
    target_muscle_group_id integer,
    prime_mover_muscle_id integer,
    secondary_muscle_id integer,
    tertiary_muscle_id integer,
    primary_equipment_id integer,
    secondary_equipment_id integer,
    posture_id integer,
    single_double_arm_id integer,
    continuous_alternating_arms_id integer,
    grip_id integer,
    ending_load_position_id integer,
    foot_elevation_id integer,
    combination_exercise_id integer,
    move_pattern_1_id integer,
    move_pattern_2_id integer,
    move_pattern_3_id integer,
    move_plane_1_id integer,
    move_plane_2_id integer,
    move_plane_3_id integer,
    body_region_id integer,
    force_type_id integer,
    mechanics_id integer,
    laterality_id integer,
    exercise_modality_id integer
);


ALTER TABLE public.exercise_library OWNER TO postgres;

--
-- Name: exercise_library_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.exercise_library ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercise_library_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exercise_library_input; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_library_input (
    id integer NOT NULL,
    exercise_name character varying(100) NOT NULL,
    difficulty character varying(50),
    target_muscle_group character varying(50),
    prime_mover_muscle character varying(50),
    secondary_muscle character varying(50),
    tertiary_muscle character varying(50),
    primary_equipment character varying(50),
    secondary_equipment character varying(50),
    posture character varying(50),
    single_double_arm character varying(50),
    continuous_alternating_arms character varying(50),
    grip character varying(50),
    ending_load_position character varying(50),
    foot_elevation character varying(50),
    combination_exercise character varying(50),
    move_pattern_1 character varying(50),
    move_pattern_2 character varying(50),
    move_pattern_3 character varying(50),
    move_plane_1 character varying(50),
    move_plane_2 character varying(50),
    move_plane_3 character varying(50),
    body_region character varying(50),
    force_type character varying(50),
    mechanics character varying(50),
    laterality character varying(50),
    exercise_modality character varying(50)
);


ALTER TABLE public.exercise_library_input OWNER TO postgres;

--
-- Name: exercise_library_input_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.exercise_library_input ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercise_library_input_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exercise_modalities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_modalities (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.exercise_modalities OWNER TO postgres;

--
-- Name: foot_elevations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foot_elevations (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.foot_elevations OWNER TO postgres;

--
-- Name: force_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.force_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.force_types OWNER TO postgres;

--
-- Name: grips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grips (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.grips OWNER TO postgres;

--
-- Name: lateralities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lateralities (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.lateralities OWNER TO postgres;

--
-- Name: mechanics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mechanics (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.mechanics OWNER TO postgres;

--
-- Name: movement_patterns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movement_patterns (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.movement_patterns OWNER TO postgres;

--
-- Name: movement_planes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movement_planes (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.movement_planes OWNER TO postgres;

--
-- Name: muscle_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muscle_groups (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.muscle_groups OWNER TO postgres;

--
-- Name: muscles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muscles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.muscles OWNER TO postgres;

--
-- Name: postures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postures (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.postures OWNER TO postgres;

--
-- Name: single_double_arm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.single_double_arm (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.single_double_arm OWNER TO postgres;

--
-- Name: exercise_library_list; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.exercise_library_list AS
 SELECT exercise_library.exercise_name,
    difficulties.name AS difficulty,
    muscle_groups.name AS target_muscle_group,
    prime_mover_muscle.name AS primary_mover_muscle,
    secondary_muscle.name AS secondary_muscle,
    tertiary_muscle.name AS tertiary_muscle,
    primary_equipment.name AS primary_equipment,
    secondary_equipment.name AS secondary_equipment,
    postures.name AS posture,
    single_double_arm.name AS single_double_arm,
    continuous_alternating_arms.name AS continuous_alternating_arms,
    grips.name AS grip,
    ending_load_positions.name AS ending_load_position,
    foot_elevations.name AS foot_elevation,
    combination_exercises.name AS combination_exercise,
    movement_pattern_1.name AS movement_pattern_1,
    movement_pattern_2.name AS movement_pattern_2,
    movement_pattern_3.name AS movement_pattern_3,
    movement_plane_1.name AS movement_plane_1,
    movement_plane_2.name AS movement_plane_2,
    movement_plane_3.name AS movement_plane_3,
    body_regions.name AS body_region,
    force_types.name AS force_type,
    mechanics.name AS mechanics,
    lateralities.name AS laterality,
    exercise_modalities.name AS exercise_modality
   FROM (((((((((((((((((((((((((public.exercise_library
     LEFT JOIN public.difficulties ON ((exercise_library.difficulty_id = difficulties.id)))
     LEFT JOIN public.muscle_groups ON ((exercise_library.target_muscle_group_id = muscle_groups.id)))
     LEFT JOIN public.muscles prime_mover_muscle ON ((exercise_library.prime_mover_muscle_id = prime_mover_muscle.id)))
     LEFT JOIN public.muscles secondary_muscle ON ((exercise_library.secondary_muscle_id = secondary_muscle.id)))
     LEFT JOIN public.muscles tertiary_muscle ON ((exercise_library.tertiary_muscle_id = tertiary_muscle.id)))
     LEFT JOIN public.equipment primary_equipment ON ((exercise_library.primary_equipment_id = primary_equipment.id)))
     LEFT JOIN public.equipment secondary_equipment ON ((exercise_library.secondary_equipment_id = secondary_equipment.id)))
     LEFT JOIN public.postures ON ((exercise_library.posture_id = postures.id)))
     LEFT JOIN public.single_double_arm ON ((exercise_library.single_double_arm_id = single_double_arm.id)))
     LEFT JOIN public.continuous_alternating_arms ON ((exercise_library.continuous_alternating_arms_id = continuous_alternating_arms.id)))
     LEFT JOIN public.grips ON ((exercise_library.grip_id = grips.id)))
     LEFT JOIN public.ending_load_positions ON ((exercise_library.ending_load_position_id = ending_load_positions.id)))
     LEFT JOIN public.foot_elevations ON ((exercise_library.foot_elevation_id = foot_elevations.id)))
     LEFT JOIN public.combination_exercises ON ((exercise_library.combination_exercise_id = combination_exercises.id)))
     LEFT JOIN public.movement_patterns movement_pattern_1 ON ((exercise_library.move_pattern_1_id = movement_pattern_1.id)))
     LEFT JOIN public.movement_patterns movement_pattern_2 ON ((exercise_library.move_pattern_2_id = movement_pattern_2.id)))
     LEFT JOIN public.movement_patterns movement_pattern_3 ON ((exercise_library.move_pattern_3_id = movement_pattern_3.id)))
     LEFT JOIN public.movement_planes movement_plane_1 ON ((exercise_library.move_plane_1_id = movement_plane_1.id)))
     LEFT JOIN public.movement_planes movement_plane_2 ON ((exercise_library.move_plane_2_id = movement_plane_2.id)))
     LEFT JOIN public.movement_planes movement_plane_3 ON ((exercise_library.move_plane_3_id = movement_plane_3.id)))
     LEFT JOIN public.body_regions ON ((exercise_library.body_region_id = body_regions.id)))
     LEFT JOIN public.force_types ON ((exercise_library.force_type_id = force_types.id)))
     LEFT JOIN public.mechanics ON ((exercise_library.mechanics_id = mechanics.id)))
     LEFT JOIN public.lateralities ON ((exercise_library.laterality_id = lateralities.id)))
     LEFT JOIN public.exercise_modalities ON ((exercise_library.exercise_modality_id = exercise_modalities.id)))
  ORDER BY exercise_library.id;


ALTER VIEW public.exercise_library_list OWNER TO postgres;

--
-- Name: exercise_modalities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.exercise_modalities ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exercise_modalities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: foot_elevations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.foot_elevations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.foot_elevations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: force_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.force_types ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.force_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: grips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.grips ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.grips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lateralities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.lateralities ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.lateralities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mechanics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mechanics ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mechanics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: movement_patterns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.movement_patterns ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.movement_patterns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: movement_planes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.movement_planes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.movement_planes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: muscle_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.muscle_groups ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.muscle_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: muscles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.muscles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.muscles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: postures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.postures ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.postures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    expires timestamp with time zone NOT NULL,
    "sessionToken" character varying(255) NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: single_double_arm_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.single_double_arm ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.single_double_arm_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: struct_bal_ref_lifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.struct_bal_ref_lifts (
    id integer NOT NULL,
    struct_bal_ref_lift_load integer NOT NULL,
    exercise_library_id integer NOT NULL,
    struct_bal_ref_lift_note text
);


ALTER TABLE public.struct_bal_ref_lifts OWNER TO postgres;

--
-- Name: struct_bal_ref_lifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.struct_bal_ref_lifts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.struct_bal_ref_lifts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: struct_bal_ref_lifts_list; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.struct_bal_ref_lifts_list AS
 SELECT struct_bal_ref_lifts.id,
    exercise_library.exercise_name,
    struct_bal_ref_lifts.struct_bal_ref_lift_load,
    struct_bal_ref_lifts.struct_bal_ref_lift_note
   FROM (public.struct_bal_ref_lifts
     JOIN public.exercise_library ON ((struct_bal_ref_lifts.exercise_library_id = exercise_library.id)))
  ORDER BY exercise_library.exercise_name;


ALTER VIEW public.struct_bal_ref_lifts_list OWNER TO postgres;

--
-- Name: struct_balanced_lifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.struct_balanced_lifts (
    struct_balanced_user_id integer NOT NULL,
    id integer NOT NULL,
    struct_balanced_reference_lift_id integer NOT NULL,
    struct_balanced_load integer,
    struct_balanced_load_unit character varying(5),
    struct_balanced_reference_lift_reps integer,
    struct_balanced_lifts_created_date timestamp with time zone DEFAULT now()
);


ALTER TABLE public.struct_balanced_lifts OWNER TO postgres;

--
-- Name: struct_balanced_lifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.struct_balanced_lifts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.struct_balanced_lifts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    "emailVerified" timestamp with time zone,
    image text,
    first_name character varying(255),
    last_name character varying(255),
    role character varying(25),
    stripe_cust_id character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_token (
    identifier text NOT NULL,
    expires timestamp with time zone NOT NULL,
    token text NOT NULL
);


ALTER TABLE public.verification_token OWNER TO postgres;

--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: body_regions body_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.body_regions
    ADD CONSTRAINT body_regions_pkey PRIMARY KEY (id);


--
-- Name: combination_exercises combination_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combination_exercises
    ADD CONSTRAINT combination_exercises_pkey PRIMARY KEY (id);


--
-- Name: continuous_alternating_arms continuous_alternating_arms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.continuous_alternating_arms
    ADD CONSTRAINT continuous_alternating_arms_pkey PRIMARY KEY (id);


--
-- Name: difficulties difficulties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.difficulties
    ADD CONSTRAINT difficulties_pkey PRIMARY KEY (id);


--
-- Name: email_contacts email_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_pkey PRIMARY KEY (id);


--
-- Name: ending_load_positions ending_load_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ending_load_positions
    ADD CONSTRAINT ending_load_positions_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: exercise_library_input exercise_library_input_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library_input
    ADD CONSTRAINT exercise_library_input_pkey PRIMARY KEY (id);


--
-- Name: exercise_library exercise_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_pkey PRIMARY KEY (id);


--
-- Name: exercise_modalities exercise_modalities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_modalities
    ADD CONSTRAINT exercise_modalities_pkey PRIMARY KEY (id);


--
-- Name: foot_elevations foot_elevations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foot_elevations
    ADD CONSTRAINT foot_elevations_pkey PRIMARY KEY (id);


--
-- Name: force_types force_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.force_types
    ADD CONSTRAINT force_types_pkey PRIMARY KEY (id);


--
-- Name: grips grips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grips
    ADD CONSTRAINT grips_pkey PRIMARY KEY (id);


--
-- Name: lateralities lateralities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lateralities
    ADD CONSTRAINT lateralities_pkey PRIMARY KEY (id);


--
-- Name: mechanics mechanics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT mechanics_pkey PRIMARY KEY (id);


--
-- Name: movement_patterns movement_pattern_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movement_patterns
    ADD CONSTRAINT movement_pattern_pkey PRIMARY KEY (id);


--
-- Name: movement_planes movement_planes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movement_planes
    ADD CONSTRAINT movement_planes_pkey PRIMARY KEY (id);


--
-- Name: muscle_groups muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_pkey PRIMARY KEY (id);


--
-- Name: muscles muscles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscles
    ADD CONSTRAINT muscles_pkey PRIMARY KEY (id);


--
-- Name: postures postures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postures
    ADD CONSTRAINT postures_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: single_double_arm single_double_arm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.single_double_arm
    ADD CONSTRAINT single_double_arm_pkey PRIMARY KEY (id);


--
-- Name: struct_balanced_lifts struct_bal_lift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.struct_balanced_lifts
    ADD CONSTRAINT struct_bal_lift_pkey PRIMARY KEY (id, struct_balanced_user_id);


--
-- Name: struct_bal_ref_lifts struct_bal_ref_lift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.struct_bal_ref_lifts
    ADD CONSTRAINT struct_bal_ref_lift_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_token verification_token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_token
    ADD CONSTRAINT verification_token_pkey PRIMARY KEY (identifier, token);


--
-- Name: exercise_library exercise_library_body_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_body_region_id_fkey FOREIGN KEY (body_region_id) REFERENCES public.body_regions(id);


--
-- Name: exercise_library exercise_library_combination_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_combination_exercise_id_fkey FOREIGN KEY (combination_exercise_id) REFERENCES public.combination_exercises(id);


--
-- Name: exercise_library exercise_library_continuous_alternating_arms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_continuous_alternating_arms_id_fkey FOREIGN KEY (continuous_alternating_arms_id) REFERENCES public.continuous_alternating_arms(id) NOT VALID;


--
-- Name: exercise_library exercise_library_difficulty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_difficulty_id_fkey FOREIGN KEY (difficulty_id) REFERENCES public.difficulties(id);


--
-- Name: exercise_library exercise_library_ending_load_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_ending_load_position_id_fkey FOREIGN KEY (ending_load_position_id) REFERENCES public.ending_load_positions(id);


--
-- Name: exercise_library exercise_library_exercise_modality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_exercise_modality_id_fkey FOREIGN KEY (exercise_modality_id) REFERENCES public.exercise_modalities(id);


--
-- Name: exercise_library exercise_library_foot_elevation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_foot_elevation_id_fkey FOREIGN KEY (foot_elevation_id) REFERENCES public.foot_elevations(id);


--
-- Name: exercise_library exercise_library_force_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_force_type_id_fkey FOREIGN KEY (force_type_id) REFERENCES public.force_types(id);


--
-- Name: exercise_library exercise_library_grip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_grip_id_fkey FOREIGN KEY (grip_id) REFERENCES public.grips(id);


--
-- Name: exercise_library exercise_library_laterality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_laterality_id_fkey FOREIGN KEY (laterality_id) REFERENCES public.lateralities(id);


--
-- Name: exercise_library exercise_library_mechanics_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_mechanics_id_fkey FOREIGN KEY (mechanics_id) REFERENCES public.mechanics(id);


--
-- Name: exercise_library exercise_library_move_pattern_1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_move_pattern_1_id_fkey FOREIGN KEY (move_pattern_1_id) REFERENCES public.movement_patterns(id);


--
-- Name: exercise_library exercise_library_move_pattern_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_move_pattern_2_id_fkey FOREIGN KEY (move_pattern_2_id) REFERENCES public.movement_patterns(id);


--
-- Name: exercise_library exercise_library_move_pattern_3_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_move_pattern_3_id_fkey FOREIGN KEY (move_pattern_3_id) REFERENCES public.movement_patterns(id);


--
-- Name: exercise_library exercise_library_move_plane_1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_move_plane_1_id_fkey FOREIGN KEY (move_plane_1_id) REFERENCES public.movement_planes(id);


--
-- Name: exercise_library exercise_library_move_plane_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_move_plane_2_id_fkey FOREIGN KEY (move_plane_2_id) REFERENCES public.movement_planes(id);


--
-- Name: exercise_library exercise_library_move_plane_3_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_move_plane_3_id_fkey FOREIGN KEY (move_plane_3_id) REFERENCES public.movement_planes(id);


--
-- Name: exercise_library exercise_library_posture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_posture_id_fkey FOREIGN KEY (posture_id) REFERENCES public.postures(id);


--
-- Name: exercise_library exercise_library_primary_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_primary_equipment_id_fkey FOREIGN KEY (primary_equipment_id) REFERENCES public.equipment(id);


--
-- Name: exercise_library exercise_library_prime_mover_muscle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_prime_mover_muscle_id_fkey FOREIGN KEY (prime_mover_muscle_id) REFERENCES public.muscles(id);


--
-- Name: exercise_library exercise_library_secondary_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_secondary_equipment_id_fkey FOREIGN KEY (secondary_equipment_id) REFERENCES public.equipment(id);


--
-- Name: exercise_library exercise_library_secondary_muscle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_secondary_muscle_id_fkey FOREIGN KEY (secondary_muscle_id) REFERENCES public.muscles(id);


--
-- Name: exercise_library exercise_library_single_double_arm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_single_double_arm_id_fkey FOREIGN KEY (single_double_arm_id) REFERENCES public.single_double_arm(id);


--
-- Name: exercise_library exercise_library_target_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_target_muscle_group_id_fkey FOREIGN KEY (target_muscle_group_id) REFERENCES public.muscle_groups(id);


--
-- Name: exercise_library exercise_library_tertiary_muscle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_library
    ADD CONSTRAINT exercise_library_tertiary_muscle_id_fkey FOREIGN KEY (tertiary_muscle_id) REFERENCES public.muscles(id);


--
-- Name: struct_balanced_lifts struct_balanced_ref_lift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.struct_balanced_lifts
    ADD CONSTRAINT struct_balanced_ref_lift_id_fkey FOREIGN KEY (struct_balanced_reference_lift_id) REFERENCES public.struct_bal_ref_lifts(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;


--
-- Name: struct_balanced_lifts struct_balanced_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.struct_balanced_lifts
    ADD CONSTRAINT struct_balanced_user_id_fkey FOREIGN KEY (struct_balanced_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- PostgreSQL database dump complete
--

