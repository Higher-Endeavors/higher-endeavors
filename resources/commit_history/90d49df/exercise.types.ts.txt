import { z } from 'zod';
import { LoadUnit } from './index';
import { SingleValue, ActionMeta } from 'react-select';

/**
 * Regular expression patterns for validation
 */
const PAIRING_REGEX = /^([A-Z][1-2]|WU|CD)$/;
const TEMPO_REGEX = /^[0-9X][0-9][0-9X][0-9]$/;
const COLOR_REGEX = /^(red|blue|green|yellow|black|purple|orange|white|grey|gray|pink)$/i;

/**
 * Defines the possible sources of an exercise
 * @property library - Exercise from the standard exercise library
 * @property user - Custom exercise created by the user
 * @property custom - One-off exercise created for a specific program
 */
export type ExerciseSource = 'library' | 'user' | 'custom';

/**
 * Base properties shared by all exercise types
 * @property id - Unique identifier for the exercise
 * @property name - Display name of the exercise
 * @property pairing - Exercise grouping (A1, A2, B1, etc.) or special type (WU, CD)
 * @property sets - Number of sets to perform
 * @property reps - Number of repetitions per set
 * @property load - Weight/resistance (number for weight, string for bands/bodyweight)
 * @property tempo - Four-digit tempo code (eccentric-bottom-concentric-top)
 * @property rest - Rest period in seconds
 * @property notes - Optional exercise notes
 * @property rpe - Rate of Perceived Exertion (optional)
 * @property rir - Reps in Reserve (optional)
 * @property loadUnit - Unit of measurement for load (kg/lbs)
 * @property source - Origin of the exercise
 * @property libraryId - Reference to library exercise if applicable
 * @property userExerciseId - Reference to user-created exercise if applicable
 */
export interface BaseExercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number | string;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  loadUnit?: LoadUnit;
  source?: ExerciseSource;
  libraryId?: number;
  userExerciseId?: number;
}

/**
 * Exercise with uniform sets (all sets use the same parameters)
 * Extends BaseExercise with flags to indicate it's a regular exercise
 */
export interface RegularExercise extends BaseExercise {
  isVariedSets: false;
  isAdvancedSets: false;
  setDetails?: undefined;
}

/**
 * Represents a subset of an advanced set (e.g., drop set, cluster set)
 * @property reps - Number of repetitions for this subset
 * @property load - Weight/resistance for this subset
 * @property loadUnit - Unit of measurement (optional)
 * @property rest - Rest period in seconds before next subset
 */
export interface SubSet {
  reps: number;
  load: number | string;
  loadUnit?: LoadUnit;
  rest: number;
}

/**
 * Detailed information for a single set when using varied sets
 * @property setNumber - Order of the set in the exercise
 * @property reps - Number of repetitions for this set
 * @property load - Weight/resistance for this set
 * @property loadUnit - Unit of measurement (optional)
 * @property tempo - Four-digit tempo code for this set
 * @property rest - Rest period in seconds after this set
 * @property notes - Optional notes specific to this set
 * @property subSets - Array of subsets for advanced techniques
 */
export interface SetDetail {
  setNumber: number;
  reps: number;
  load: number | string;
  loadUnit?: LoadUnit;
  tempo: string;
  rest: number;
  notes?: string;
  subSets?: SubSet[];
}

/**
 * Exercise with varied sets (each set can have different parameters)
 * Extends BaseExercise with an array of set details
 */
export interface VariedExercise extends BaseExercise {
  isVariedSets: true;
  isAdvancedSets: boolean;
  setDetails: SetDetail[];
}

/**
 * Union type representing either a regular or varied exercise
 */
export type Exercise = RegularExercise | VariedExercise;

/**
 * Type guard to check if an exercise uses regular (uniform) sets
 */
export const isRegularExercise = (exercise: Exercise): exercise is RegularExercise => {
  return !exercise.isVariedSets;
};

/**
 * Type guard to check if an exercise uses varied sets
 */
export const isVariedExercise = (exercise: Exercise): exercise is VariedExercise => {
  return exercise.isVariedSets;
};

/**
 * Schema for validating load values
 * Accepts:
 * - Numbers (0-1500) for weight in kg/lbs
 * - Standard resistance band colors
 * - 'BW' for bodyweight exercises
 */
const loadSchema = z.union([
  z.number().min(0).max(1500),
  z.string().regex(COLOR_REGEX, {
    message: "Invalid band color. Please use standard color names."
  }),
  z.literal('BW')
]).transform(val => {
  if (typeof val === 'string' && val !== 'BW') {
    return val.toLowerCase();
  }
  return val;
});

/**
 * Schema for validating sub-sets in advanced exercises
 */
export const subSetSchema = z.object({
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  loadUnit: z.enum(['kg', 'lbs']).optional(),
  rest: z.number().int().min(0).max(600)
});

/**
 * Schema for validating individual set details in varied exercises
 */
export const setDetailsSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  loadUnit: z.enum(['kg', 'lbs']).optional(),
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
  loadUnit: z.enum(['kg', 'lbs']).optional(),
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
 * Helper function to create a new regular exercise
 * @param base - Base exercise properties
 * @returns A properly typed regular exercise
 */
export const createRegularExercise = (
  base: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> & { loadUnit?: LoadUnit }
): RegularExercise => ({
  ...base,
  isVariedSets: false,
  isAdvancedSets: false,
  setDetails: undefined
});

/**
 * Helper function to create a new varied exercise
 * @param base - Base exercise properties
 * @param setDetails - Array of set details
 * @returns A properly typed varied exercise
 */
export const createVariedExercise = (
  base: Omit<BaseExercise, 'isVariedSets' | 'isAdvancedSets'> & { loadUnit?: LoadUnit },
  setDetails: SetDetail[] = []
): VariedExercise => ({
  ...base,
  isVariedSets: true,
  isAdvancedSets: setDetails.some(set => (set.subSets?.length ?? 0) > 0),
  setDetails
});

/**
 * Helper function to validate an exercise pairing format
 * @param pairing - The pairing string to validate
 * @returns boolean indicating if the pairing is valid
 */
export const isValidPairing = (pairing: string): boolean => {
  return PAIRING_REGEX.test(pairing);
};

/**
 * Helper function to get the next available pairing
 * @param currentPairings - Array of existing pairings
 * @returns The next available pairing in sequence
 */
export const getNextPairing = (currentPairings: string[]): string => {
  const validPairings = currentPairings
    .filter(p => PAIRING_REGEX.test(p))
    .filter(p => !p.startsWith('WU') && !p.startsWith('CD'));

  if (validPairings.length === 0) return 'A1';

  const lastPairing = validPairings[validPairings.length - 1];
  const letter = lastPairing.charAt(0);
  const number = parseInt(lastPairing.charAt(1));

  if (number === 2) {
    return String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
  }
  return letter + '2';
};

/**
 * Type for react-select exercise options
 * Extends the base exercise data structure for use with react-select
 */
export interface ExerciseOption {
  value: string;
  label: string;
  data: {
    id: string;
    name: string;
    source: ExerciseSource;
    libraryId?: number;
  };
}

/**
 * Type for react-select's onChange handler for exercises
 */
export type ExerciseSelectHandler = (
  newValue: SingleValue<ExerciseOption>,
  actionMeta: ActionMeta<ExerciseOption>
) => void; 