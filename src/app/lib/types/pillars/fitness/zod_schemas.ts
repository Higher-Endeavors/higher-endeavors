/**
 * Zod Schemas - Casing Conventions
 * 
 * This file follows these casing conventions:
 * 1. snake_case:
 *    - Types/interfaces that map to database structures
 *    - Properties within these types that map to database columns
 * 
 * 2. camelCase:
 *    - Zod schema definitions (as they're primarily for React form validation)
 *    - React-specific types and validation rules
 *    - TypeScript type guards and utility types
 */

import { z } from 'zod';
import { exercise, load_unit } from './exercise.types';

/**
 * Regular expression patterns for validation
 */
const PAIRING_REGEX = /^([A-Z]\d{1,2}|WU|CD)$/;
const TEMPO_REGEX = /^[0-9X][0-9][0-9X][0-9]$/;
const COLOR_REGEX = /^(red|blue|green|yellow|black|purple|orange|white|grey|gray|pink)$/i;

/**
 * Enums for program settings
 */
export const PhaseFocus = {
  GPP: 'GPP',
  Hypertrophy: 'Hypertrophy',
  Strength: 'Strength',
  Power: 'Power',
  Endurance: 'Endurance',
  Maintenance: 'Maintenance'
} as const;

export const PeriodizationType = {
  None: 'None',
  Linear: 'Linear',
  Undulating: 'Undulating',
  Block: 'Block',
  Conjugate: 'Conjugate',
  Custom: 'Custom'
} as const;

export const ProgressionFrequency = {
  PerSession: 'PerSession',
  PerWeek: 'PerWeek',
  PerCycle: 'PerCycle'
} as const;

/**
 * Base schema for load validation
 */
export const loadSchema = z.union([
  z.number(),
  z.string().regex(/^[0-9]+(\.[0-9]+)?$/).transform(Number),
  z.string().regex(/^(BW|[A-Z][0-9]?)$/)
]);

/**
 * Schema for validating sub-sets within a set
 */
export const subSetSchema = z.object({
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  load_unit: z.enum(['kg', 'lbs'] as const).optional(),
  notes: z.string().optional(),
  rest: z.number().int().min(0).max(600).optional()
});

/**
 * Schema for validating individual set details in varied exercises
 */
export const setDetailsSchema = z.object({
  set_number: z.number().int().min(1),
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  load_unit: z.enum(['kg', 'lbs'] as const).optional(),
  tempo: z.string().regex(TEMPO_REGEX, {
    message: "Tempo must be 4 digits with optional 'X' in position 3"
  }),
  rest: z.number().int().min(0).max(600),
  notes: z.string().optional(),
  sub_sets: z.array(subSetSchema).optional()
});

/**
 * Base schema for exercise validation
 */
const baseExerciseSchema = {
  id: z.string(),
  name: z.string().min(1, "Exercise name is required"),
  pairing: z.string().regex(PAIRING_REGEX, {
    message: "Pairing must be a letter followed by 1-2, or WU/CD"
  }),
  sets: z.number().int().min(1).max(99),
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  load_unit: z.enum(['kg', 'lbs'] as const).optional(),
  tempo: z.string().regex(TEMPO_REGEX, {
    message: "Tempo must be 4 digits with optional 'X' in position 3"
  }),
  rest: z.number().int().min(0).max(600),
  notes: z.string().optional(),
  rpe: z.number().optional(),
  rir: z.number().optional(),
  source: z.enum(['library', 'user', 'custom']).optional(),
  library_id: z.number().optional(),
  user_exercise_id: z.number().optional(),
};

/**
 * Main schema for validating exercises
 * Uses discriminated union to handle both regular and varied exercises
 */
export const exerciseSchema = z.discriminatedUnion('is_varied_sets', [
  // Regular exercise schema
  z.object({
    ...baseExerciseSchema,
    is_varied_sets: z.literal(false),
    is_advanced_sets: z.literal(false),
    set_details: z.undefined()
  }),
  // Varied exercise schema
  z.object({
    ...baseExerciseSchema,
    is_varied_sets: z.literal(true),
    is_advanced_sets: z.boolean(),
    set_details: z.array(setDetailsSchema).min(1)
  })
]).refine(
  (data) => {
    if (data.source === 'library') return data.library_id !== undefined;
    if (data.source === 'user') return data.user_exercise_id !== undefined;
    return true;
  },
  {
    message: "Library exercises must have library_id and user exercises must have user_exercise_id"
  }
);

/**
 * Schema for validating program settings
 */
export const programSettingsSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  phase_focus: z.enum(Object.values(PhaseFocus) as [string, ...string[]]),
  periodization_type: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
  notes: z.string().optional(),
  progression_rules: z.object({
    type: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
    load_increment: z.number().optional(),
    frequency: z.enum(Object.values(ProgressionFrequency) as [string, ...string[]]).optional(),
    settings: z.object({
      volume_increment_percentage: z.number().optional(),
      load_increment_percentage: z.number().optional(),
      program_length: z.number().optional(),
      weekly_volume_percentages: z.array(z.number()).optional()
    }).optional()
  }),
  volume_targets: z.array(z.object({
    muscle_group: z.string(),
    min_sets: z.number().int().min(0),
    max_sets: z.number().int().min(0),
    frequency: z.number().int().min(1).max(7),
  })).optional(),
});

/**
 * Schema for validating complete programs
 */
export const programSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string().min(1, "Program name is required"),
  phase_focus: z.enum(Object.values(PhaseFocus) as [string, ...string[]]),
  periodization_type: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
  notes: z.string().optional(),
  progression_rules: programSettingsSchema.shape.progression_rules,
  volume_targets: programSettingsSchema.shape.volume_targets,
  exercises: z.array(exerciseSchema),
  created_at: z.date(),
  updated_at: z.date()
});

/**
 * Types for progression settings and rules
 */
export type progression_settings = {
  volume_increment_percentage?: number;
  load_increment_percentage?: number;
  program_length?: number;
  weekly_volume_percentages?: number[];
};

export type progression_rules = {
  type: keyof typeof PeriodizationType;
  load_increment?: number;
  frequency?: keyof typeof ProgressionFrequency;
  settings?: progression_settings;
};

export type volume_target = {
  muscle_group: string;
  min_sets: number;
  max_sets: number;
  frequency: number;
};

export type program = {
  id: string;
  user_id: string;
  name: string;
  phase_focus: keyof typeof PhaseFocus;
  periodization_type: keyof typeof PeriodizationType;
  notes?: string;
  progression_rules: progression_rules;
  volume_targets?: volume_target[];
  exercises: exercise[];
  created_at: Date;
  updated_at: Date;
};

/**
 * Saved program structure (for API responses)
 */
export interface saved_program {
  id: string;
  user_id: string;
  program_name: string;
  phase_focus: keyof typeof PhaseFocus;
  periodization_type: keyof typeof PeriodizationType;
  notes?: string;
  progression_rules: progression_rules;
  volume_targets?: volume_target[];
  exercises?: exercise[];
  created_at: string;
  updated_at: string;
}

export interface saved_program_with_optional extends Omit<saved_program, 'progression_rules'> {
  progression_rules?: progression_rules;
}