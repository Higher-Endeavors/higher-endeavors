/**
 * Exercise Types - Casing Conventions
 * 
 * This file follows these casing conventions:
 * 1. snake_case:
 *    - All interfaces/types that map to database structures
 *    - Properties within these interfaces that map to database columns
 *    - Helper functions that work with database-mapped types
 * 
 * 2. camelCase:
 *    - React-specific interfaces (props, state)
 *    - React event handlers
 *    - TypeScript type guards
 * 
 * This approach minimizes data transformations between frontend and backend
 * while maintaining React/TypeScript conventional patterns where appropriate.
 */

import { z } from 'zod';
import { exerciseSchema, setDetailsSchema, subSetSchema, PhaseFocus, PeriodizationType, ProgressionFrequency } from './zod_schemas';

/**
 * Unit types for fitness measurements
 */
export type load_unit = 'lbs' | 'kg';    // Specifically for resistance training loads
export const default_load_unit: load_unit = 'lbs';

/**
 * Program types
 */
export type phase_focus_type = (typeof PhaseFocus)[keyof typeof PhaseFocus];
export type periodization_type_enum = (typeof PeriodizationType)[keyof typeof PeriodizationType];
export type progression_frequency_type = (typeof ProgressionFrequency)[keyof typeof ProgressionFrequency];

export { PhaseFocus, PeriodizationType, ProgressionFrequency };

/**
 * Type guards (remain in camelCase as per TypeScript conventions)
 */
export function isPhaseFocus(value: unknown): value is phase_focus_type {
  return typeof value === 'string' && Object.values(PhaseFocus).includes(value as phase_focus_type);
}

export function isPeriodizationType(value: unknown): value is periodization_type_enum {
  return typeof value === 'string' && Object.values(PeriodizationType).includes(value as periodization_type_enum);
}

export function isProgressionFrequency(value: unknown): value is progression_frequency_type {
  return typeof value === 'string' && Object.values(ProgressionFrequency).includes(value as progression_frequency_type);
}

/**
 * Defines the possible sources of an exercise
 */
export type exercise_source = 'library' | 'user';

/**
 * Base interface for exercise properties
 */
export interface base_exercise {
  id: number;
  exercise_id: number;
  name: string;
  source: 'exercise_library' | 'user_exercises';
}

export interface planned_exercise extends base_exercise {
  pairing: string;
  sets: number;
  is_varied_sets: boolean;
  is_advanced_sets: boolean;
  planned_sets?: planned_exercise_set[];
  notes?: string;
}

export interface varied_exercise extends base_exercise {
  pairing: string;
  is_varied_sets: true;
  is_advanced_sets: boolean;
  set_details: planned_exercise_set[];
  notes?: string;
}

export function is_varied_exercise(exercise: exercise): exercise is varied_exercise {
  return 'set_details' in exercise && exercise.set_details !== undefined;
}

export type exercise = planned_exercise | varied_exercise;

export interface planned_exercise_set {
  set_number: number;
  planned_reps: number;
  planned_load?: string | number;
  load_unit?: load_unit;
  planned_rest?: number;
  planned_tempo?: string;
  rpe?: number;
  rir?: number;
  notes?: string;
  sub_sets?: planned_exercise_sub_set[];
}

export interface planned_exercise_sub_set {
  sub_set_number: number;
  planned_reps: number;
  planned_load?: string | number;
  load_unit?: load_unit;
  planned_rest?: number;
  planned_tempo?: string;
  rpe?: number;
  rir?: number;
}

export interface week_exercise extends base_exercise {
  week_number: number;
  base_exercise_id: number;
  week_specific_id: number;
}

/**
 * Type for exercise options in react-select (React-specific, remains camelCase)
 */
export interface ExerciseOption {
  id: number;
  value: string;
  label: string;
  libraryId?: number;
  source: exercise_source;
  data: {
    id: number;
    name: string;
    source: exercise_source;
    difficulty?: string;
    target_muscle_group?: string;
    primary_equipment?: string;
    secondary_equipment?: string;
    exercise_family?: string;
    body_region?: string;
    movement_pattern?: string;
    movement_plane?: string;
    laterality?: string;
    library_id?: number;
  };
}

export type ExerciseSelectHandler = (
  newValue: ExerciseOption | null,
  actionMeta: { 
    action: string;
    option?: ExerciseOption;
    name?: string;
  }
) => void;

/**
 * Helper functions for exercise management
 */
export function create_planned_exercise(base_exercise: Omit<base_exercise, 'is_varied_sets' | 'is_advanced_sets'>): planned_exercise {
  return {
    ...base_exercise,
    pairing: '',
    sets: 0,
    is_varied_sets: false,
    is_advanced_sets: false
  };
}

export function create_varied_exercise(
  base_exercise: Omit<base_exercise, 'is_varied_sets' | 'is_advanced_sets'>,
  set_details: planned_exercise_set[]
): varied_exercise {
  return {
    ...base_exercise,
    pairing: '',
    is_varied_sets: true,
    is_advanced_sets: set_details.length > 0,
    set_details
  };
}

export function get_next_pairing(exercises: exercise[]): string {
  if (exercises.length === 0) return 'A1';
  
  const pairings = exercises.map(e => e.pairing).sort();
  const last_pairing = pairings[pairings.length - 1];
  
  if (!last_pairing) return 'A1';
  
  const letter = last_pairing.charAt(0);
  const number = parseInt(last_pairing.charAt(1));
  
  if (number === 2) {
    return String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
  }
  
  return letter + '2';
}

export function apply_linear_progression(
  exercise: exercise,
  week_number: number,
  volume_increment_percentage: number,
  load_increment_percentage: number
): exercise {
  if ('is_varied_sets' in exercise && exercise.is_varied_sets) {
    const varied_exercise = exercise as varied_exercise;
    const updated_sets = varied_exercise.set_details.map(set => {
      const base_reps = set.planned_reps;
      const base_load = typeof set.planned_load === 'number' ? set.planned_load : 0;

      const volume_multiplier = 1 + ((week_number - 1) * (volume_increment_percentage / 100));
      const load_multiplier = 1 + ((week_number - 1) * (load_increment_percentage / 100));

      return {
        ...set,
        planned_reps: Math.max(1, Math.round(base_reps * volume_multiplier)),
        planned_load: typeof set.planned_load === 'number' 
          ? Math.round(base_load * load_multiplier * 100) / 100 
          : set.planned_load
      };
    });

    return {
      ...exercise,
      set_details: updated_sets
    };
  }
  return exercise;
}

/**
 * Training session related types
 */
export interface session_set {
  id?: string;
  set_number: number;
  planned_reps: number;
  actual_reps?: number;
  planned_load: string | number | undefined;
  actual_load?: number | string;
  planned_tempo?: string;
  actual_tempo?: string;
  rest_time: number;
  rpe?: number;
  rir?: number;
  notes?: string;
}

export interface session_exercise {
  id?: string;
  exercise_library_id: number;
  name: string;
  pairing: string;
  planned_sets: number;
  actual_sets: session_set[];
  notes?: string;
}

export interface session_feedback {
  feeling?: 'Weak' | 'Average' | 'Strong';
  energy_level?: 'Fatigued' | 'Normal' | 'Energetic';
  muscle_pump?: 'Low' | 'Medium' | 'High';
  notes?: string;
  next_day_soreness?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  next_day_feeling?: 'Weak' | 'Average' | 'Strong';
  next_day_energy_level?: 'Fatigued' | 'Normal' | 'Energetic';
}

export interface training_session {
  id?: string;
  program_id: string;
  scheduled_date: string;
  actual_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';
  exercises: session_exercise[];
  feedback?: session_feedback;
}

export function is_valid_pairing(pairing: string): boolean {
  return /^([A-Z][1-2]|WU|CD)$/.test(pairing);
}

/**
 * React-specific types (remain in camelCase)
 */
export interface ExerciseFormData {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number | string | undefined;
  loadUnit?: load_unit;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  isVariedSets: boolean;
  isAdvancedSets: boolean;
  setDetails?: planned_exercise_set[];
}

export interface ExerciseItemProps {
  exercise: exercise;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface MenuState {
  [key: number]: boolean;
}

export interface ExerciseListProps {
  exercises: exercise[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface GroupedExercises {
  [key: string]: exercise[];
}