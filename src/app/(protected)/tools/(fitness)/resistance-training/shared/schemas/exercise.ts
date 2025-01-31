import { z } from 'zod';

/**
 * Regular expression patterns for validation
 */
// Validates exercise pairing format: single letter A-Z followed by 1-2 digits, or WU/CD for warm-up/cool-down
const PAIRING_REGEX = /^([A-Z]\d{1,2}|WU|CD)$/;

// Validates tempo format: 4 digits where 'X' is allowed (typically in third position for explosive movements)
const TEMPO_REGEX = /^[0-9X][0-9][0-9X][0-9]$/;

// Validates resistance band colors (case-insensitive)
const COLOR_REGEX = /^(red|blue|green|yellow|black|purple|orange|white|grey|gray|pink)$/i;

/**
 * Load Schema: Handles both numeric weights, resistance band colors, and bodyweight
 * - Numeric: 0-1500 (accommodating both kg and lbs)
 * - String: Must match standard resistance band colors or 'BW' for bodyweight
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
 * Optional Number Schema: Used for RPE and RIR fields
 * - Allows undefined/null values
 * - Transforms 0 to undefined (since 0 is not a valid RPE/RIR value)
 * - Used for both exercise-level and set-level RPE/RIR tracking
 */
const optionalNumberSchema = z.number()
  .optional()
  .nullable()
  .transform(val => val === null || val === 0 ? undefined : val);

/**
 * Sub-Set Schema: Defines the structure for advanced set variations
 * Used within individual sets when breaking down a set into components
 * Example: Drop sets, super sets, or other advanced training techniques
 */
export const subSetSchema = z.object({
  reps: z.number().int().min(1).max(99),
  load: loadSchema,
  loadUnit: z.enum(['kg', 'lbs']).optional(),
  rest: z.number().int().min(0).max(600) // Rest in seconds, max 10 minutes
});

/**
 * Set Details Schema: Defines the structure for individual sets when using varied sets
 * Used to track specific details for each set when they differ from the base exercise values
 * Includes optional RPE/RIR tracking per set and potential sub-sets for advanced techniques
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
  rpe: optionalNumberSchema,
  rir: optionalNumberSchema,
  subSets: z.array(subSetSchema).optional()
});

/**
 * Base Exercise Schema: Common properties for all exercises
 * These properties are shared between both standard and varied-set exercises
 * For standard exercises: these values apply to all sets
 * For varied sets: these values serve as defaults/reference values
 */
const baseExerciseSchema = {
  id: z.string(),
  name: z.string().min(1, "Exercise name is required"),
  pairing: z.string().regex(PAIRING_REGEX, {
    message: "Pairing must be a letter followed by 1-2 digits, or WU/CD"
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
  rpe: optionalNumberSchema,
  rir: optionalNumberSchema,
  isAdvancedSets: z.boolean().default(false),
};

/**
 * Main Exercise Schema: Uses discriminated union based on 'isVariedSets'
 * This creates two distinct types of exercises with different validation rules:
 * 
 * 1. Standard Exercise (isVariedSets: false):
 *    - All sets use the same values from baseExerciseSchema
 *    - setDetails must be undefined
 * 
 * 2. Varied Sets Exercise (isVariedSets: true):
 *    - Base values serve as defaults/reference
 *    - Must have setDetails array with at least one set
 *    - Each set can have its own specific values
 */
export const exerciseSchema = z.discriminatedUnion('isVariedSets', [
  // Standard exercise (no varied sets)
  z.object({
    ...baseExerciseSchema,
    isVariedSets: z.literal(false).default(false),
    setDetails: z.undefined()
  }),
  // Exercise with varied sets
  z.object({
    ...baseExerciseSchema,
    isVariedSets: z.literal(true),
    setDetails: z.array(setDetailsSchema).min(1)
  })
]);

// TypeScript type inference from Zod schemas
export type SubSet = z.infer<typeof subSetSchema>;
export type SetDetails = z.infer<typeof setDetailsSchema>;
export type Exercise = z.infer<typeof exerciseSchema>; 