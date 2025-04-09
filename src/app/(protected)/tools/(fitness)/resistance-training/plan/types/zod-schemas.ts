import { z } from 'zod';

/**
 * Regular expression patterns for validation
 */
// const PAIRING_REGEX = /^([A-Z]\d{1,2}|WU|CD)$/;
// const TEMPO_REGEX = /^[0-9X][0-9][0-9X][0-9]$/;
// const COLOR_REGEX = /^(red|blue|green|yellow|black|purple|orange|white|grey|gray|pink)$/i;

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
 * Schema for validating program settings
 */
export const ProgramSettingsSchema = z.object({
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
export const ProgramSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, "Program name is required"),
  phaseFocus: z.enum(Object.values(PhaseFocus) as [string, ...string[]]),
  periodizationType: z.enum(Object.values(PeriodizationType) as [string, ...string[]]),
  notes: z.string().optional(),
  progressionRules: ProgramSettingsSchema.shape.progressionRules,
  volumeTargets: ProgramSettingsSchema.shape.volumeTargets,
  exercises: z.array(ExerciseSchema),
});

/**
 * Types for progression settings and rules
 */
// export type ProgressionSettings = {
//   volumeIncrementPercentage?: number;
//   loadIncrementPercentage?: number;
//   programLength?: number;
//   weeklyVolumePercentages?: number[];
// };

// export type ProgressionRules = {
//   type: keyof typeof PeriodizationType;
//   loadIncrement?: number;
//   frequency?: keyof typeof ProgressionFrequency;
//   settings?: ProgressionSettings;
// };

// export type VolumeTarget = {
//   muscleGroup: string;
//   minSets: number;
//   maxSets: number;
//   frequency: number;
// };

// export type program = {
//   id: string;
//   userId: string;
//   name: string;
//   phaseFocus: keyof typeof PhaseFocus;
//   periodizationType: keyof typeof PeriodizationType;
//   notes?: string;
//   progressionRules: ProgressionRules;
//   volumeTargets?: VolumeTarget[];
//   exercises: Exercise[];
//   // created_at: Date;
//   // updated_at: Date;
// };

/**
 * Saved program structure (for API responses)
 */
// export interface saved_program {
//   id: string;
//   user_id: string;
//   program_name: string;
//   phase_focus: keyof typeof PhaseFocus;
//   periodization_type: keyof typeof PeriodizationType;
//   notes?: string;
//   progression_rules: progression_rules;
//   volume_targets?: volume_target[];
//   exercises?: exercise[];
//   created_at: string;
//   updated_at: string;
// }

// export interface saved_program_with_optional extends Omit<saved_program, 'progression_rules'> {
//   progression_rules?: progression_rules;
// }