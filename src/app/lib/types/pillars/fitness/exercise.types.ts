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

/**
 * Exercise set interfaces
 */
export interface exercise_sub_set {
  sub_set_number: number;
  planned_reps: number;
  planned_load?: string | number;
  load_unit?: load_unit;
  planned_rest?: number;
  planned_tempo?: string;
  rpe?: number;
  rir?: number;
}

export interface exercise_set {
  set_number: number;
  planned_reps: number;
  planned_load?: string | number;
  load_unit?: load_unit;
  planned_rest?: number;
  planned_tempo?: string;
  rpe?: number;
  rir?: number;
  notes?: string;
  sub_sets?: exercise_sub_set[];
}

/**
 * Main exercise interface
 */
export interface exercise extends base_exercise {
  pairing: string;
  sets: number;
  planned_sets: exercise_set[];
  notes?: string;
  // UI state flags
  is_varied_sets: boolean;
  is_advanced_sets: boolean;
}

/**
 * Helper functions for exercise management
 */
export function create_exercise(
  base_exercise: Omit<base_exercise, 'is_varied_sets' | 'is_advanced_sets'>,
  is_varied_sets: boolean = false,
  is_advanced_sets: boolean = false,
  planned_sets: exercise_set[] = []
): exercise {
  return {
    ...base_exercise,
    pairing: '',
    sets: planned_sets.length || 0,
    is_varied_sets,
    is_advanced_sets,
    planned_sets: planned_sets.length > 0 ? planned_sets : []
  };
}

/**
 * React-specific types (remain in camelCase)
 */
export interface ExerciseFormData {
  id: string;
  name: string;
  exerciseId: number;
  source: 'exercise_library' | 'user_exercises';
  pairing: string;
  sets: number;
  reps: number;
  load: number | string;
  loadUnit?: 'kg' | 'lbs';
  tempo?: string;
  rest?: number;
  rpe?: number;
  rir?: number;
  notes?: string;
  isVariedSets: boolean;
  isAdvancedSets: boolean;
  plannedSets: exercise_set[];
}

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