import { z } from 'zod';
import { Exercise, LoadUnit } from './exercise.types';

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
  loadUnit: z.enum(['kg', 'lbs'] as const).optional(),
  notes: z.string().optional(),
  rest: z.number().int().min(0).max(600).optional()
});

/**
 * Schema for validating individual set details in varied exercises
 */
export const setDetailsSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  loadUnit: z.enum(['kg', 'lbs'] as const).optional(),
  tempo: z.string().regex(TEMPO_REGEX, {
    message: "Tempo must be 4 digits with optional 'X' in position 3"
  }),
  rest: z.number().int().min(0).max(600),
  notes: z.string().optional(),
  subSets: z.array(subSetSchema).optional()
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
  loadUnit: z.enum(['kg', 'lbs'] as const).optional(),
  tempo: z.string().regex(TEMPO_REGEX, {
    message: "Tempo must be 4 digits with optional 'X' in position 3"
  }),
  rest: z.number().int().min(0).max(600),
  notes: z.string().optional(),
  rpe: z.number().optional(),
  rir: z.number().optional(),
  source: z.enum(['library', 'user', 'custom']).optional(),
  libraryId: z.number().optional(),
  userExerciseId: z.number().optional(),
};

/**
 * Main schema for validating exercises
 * Uses discriminated union to handle both regular and varied exercises
 */
export const exerciseSchema = z.discriminatedUnion('isVariedSets', [
  // Regular exercise schema
  z.object({
    ...baseExerciseSchema,
    isVariedSets: z.literal(false),
    isAdvancedSets: z.literal(false),
    setDetails: z.undefined()
  }),
  // Varied exercise schema
  z.object({
    ...baseExerciseSchema,
    isVariedSets: z.literal(true),
    isAdvancedSets: z.boolean(),
    setDetails: z.array(setDetailsSchema).min(1)
  })
]);

/**
 * Schema for validating program settings
 */
export const programSettingsSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  phaseFocus: z.enum(Object.values(PhaseFocus) as [string, ...string[]]),
  periodizationType: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
  notes: z.string().optional(),
  progressionRules: z.object({
    type: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
    loadIncrement: z.number().optional(),
    frequency: z.enum(Object.values(ProgressionFrequency) as [string, ...string[]]).optional(),
    settings: z.object({
      volumeIncrementPercentage: z.number().optional(),
      loadIncrementPercentage: z.number().optional(),
      programLength: z.number().optional(),
      weeklyVolumePercentages: z.array(z.number()).optional()
    }).optional()
  }),
  volumeTargets: z.array(z.object({
    muscleGroup: z.string(),
    minSets: z.number().int().min(0),
    maxSets: z.number().int().min(0),
    frequency: z.number().int().min(1).max(7),
  })).optional(),
});

/**
 * Schema for validating complete programs
 */
export const programSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, "Program name is required"),
  phaseFocus: z.enum(Object.values(PhaseFocus) as [string, ...string[]]),
  periodizationType: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
  notes: z.string().optional(),
  progressionRules: programSettingsSchema.shape.progressionRules,
  volumeTargets: programSettingsSchema.shape.volumeTargets,
  exercises: z.array(exerciseSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Types for progression settings and rules
 */
export type ProgressionSettings = {
  volumeIncrementPercentage?: number;
  loadIncrementPercentage?: number;
  programLength?: number;
  weeklyVolumePercentages?: number[];
};

export type ProgressionRules = {
  type: keyof typeof PeriodizationType;
  loadIncrement?: number;
  frequency?: keyof typeof ProgressionFrequency;
  settings?: ProgressionSettings;
};

export type VolumeTarget = {
  muscleGroup: string;
  minSets: number;
  maxSets: number;
  frequency: number;
};

export type Program = {
  id: string;
  userId: string;
  name: string;
  phaseFocus: keyof typeof PhaseFocus;
  periodizationType: keyof typeof PeriodizationType;
  notes?: string;
  progressionRules: ProgressionRules;
  volumeTargets?: VolumeTarget[];
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Saved program structure (for API responses)
 */
export interface SavedProgram {
  id: string;
  userId: string;
  program_name: string;
  phase_focus: keyof typeof PhaseFocus;
  periodization_type: keyof typeof PeriodizationType;
  notes?: string;
  progression_rules: ProgressionRules;
  volumeTargets?: VolumeTarget[];
  exercises?: Exercise[];
  created_at: string;
  updated_at: string;
}

export interface SavedProgramWithOptional extends Omit<SavedProgram, 'progression_rules'> {
  progression_rules?: ProgressionRules;
}