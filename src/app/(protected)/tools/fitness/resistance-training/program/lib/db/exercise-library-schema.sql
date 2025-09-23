-- Table: public.exercise_library

-- DROP TABLE IF EXISTS public.exercise_library;

CREATE TABLE IF NOT EXISTS public.exercise_library
(
    exercise_library_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    exercise_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
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
    exercise_modality_id integer,
    exercise_family character varying(50) COLLATE pg_catalog."default",
    exercise_family_id integer,
    CONSTRAINT exercise_library_pkey PRIMARY KEY (exercise_library_id),
    CONSTRAINT unique_exercise_name UNIQUE (exercise_name),
    CONSTRAINT exercise_library_body_region_id_fkey FOREIGN KEY (body_region_id)
        REFERENCES public.body_regions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_combination_exercise_id_fkey FOREIGN KEY (combination_exercise_id)
        REFERENCES public.combination_exercises (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_continuous_alternating_arms_id_fkey FOREIGN KEY (continuous_alternating_arms_id)
        REFERENCES public.continuous_alternating_arms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT exercise_library_difficulty_id_fkey FOREIGN KEY (difficulty_id)
        REFERENCES public.difficulties (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_ending_load_position_id_fkey FOREIGN KEY (ending_load_position_id)
        REFERENCES public.ending_load_positions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_exercise_modality_id_fkey FOREIGN KEY (exercise_modality_id)
        REFERENCES public.exercise_modalities (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_foot_elevation_id_fkey FOREIGN KEY (foot_elevation_id)
        REFERENCES public.foot_elevations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_force_type_id_fkey FOREIGN KEY (force_type_id)
        REFERENCES public.force_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_grip_id_fkey FOREIGN KEY (grip_id)
        REFERENCES public.grips (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_laterality_id_fkey FOREIGN KEY (laterality_id)
        REFERENCES public.lateralities (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_mechanics_id_fkey FOREIGN KEY (mechanics_id)
        REFERENCES public.mechanics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_move_pattern_1_id_fkey FOREIGN KEY (move_pattern_1_id)
        REFERENCES public.movement_patterns (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_move_pattern_2_id_fkey FOREIGN KEY (move_pattern_2_id)
        REFERENCES public.movement_patterns (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_move_pattern_3_id_fkey FOREIGN KEY (move_pattern_3_id)
        REFERENCES public.movement_patterns (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_move_plane_1_id_fkey FOREIGN KEY (move_plane_1_id)
        REFERENCES public.movement_planes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_move_plane_2_id_fkey FOREIGN KEY (move_plane_2_id)
        REFERENCES public.movement_planes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_move_plane_3_id_fkey FOREIGN KEY (move_plane_3_id)
        REFERENCES public.movement_planes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_posture_id_fkey FOREIGN KEY (posture_id)
        REFERENCES public.postures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_primary_equipment_id_fkey FOREIGN KEY (primary_equipment_id)
        REFERENCES public.equipment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_prime_mover_muscle_id_fkey FOREIGN KEY (prime_mover_muscle_id)
        REFERENCES public.muscles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_secondary_equipment_id_fkey FOREIGN KEY (secondary_equipment_id)
        REFERENCES public.equipment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_secondary_muscle_id_fkey FOREIGN KEY (secondary_muscle_id)
        REFERENCES public.muscles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_single_double_arm_id_fkey FOREIGN KEY (single_double_arm_id)
        REFERENCES public.single_double_arm (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_target_muscle_group_id_fkey FOREIGN KEY (target_muscle_group_id)
        REFERENCES public.muscle_groups (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT exercise_library_tertiary_muscle_id_fkey FOREIGN KEY (tertiary_muscle_id)
        REFERENCES public.muscles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_exercise_family FOREIGN KEY (exercise_family_id)
        REFERENCES public.exercise_family (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.exercise_library
    OWNER to postgres;