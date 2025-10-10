import { z } from 'zod';

// --- Measurement Schemas ---
export const CircumferenceMeasurementsSchema = z.object({
  neck: z.number(),
  shoulders: z.number(),
  chest: z.number(),
  waist: z.number(),
  hips: z.number(),
  leftBicepRelaxed: z.number(),
  leftBicepFlexed: z.number(),
  rightBicepRelaxed: z.number(),
  rightBicepFlexed: z.number(),
  leftForearm: z.number(),
  rightForearm: z.number(),
  leftThigh: z.number(),
  rightThigh: z.number(),
  leftCalf: z.number(),
  rightCalf: z.number(),
}).strict();

export const SkinfoldMeasurementsSchema = z.object({
  chest: z.number(),
  abdomen: z.number(),
  thigh: z.number(),
  triceps: z.number(),
  axilla: z.number(),
  subscapula: z.number(),
  suprailiac: z.number(),
}).strict();

// --- Entry Schemas ---
export const BodyCompositionEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  weight: z.number(),
  bodyFatPercentage: z.number().nullable(),
  fatMass: z.number().nullable(),
  fatFreeMass: z.number().nullable(),
  circumferenceMeasurements: CircumferenceMeasurementsSchema.partial().optional(),
  skinfoldMeasurements: SkinfoldMeasurementsSchema.partial().optional(),
}).strict();

// --- Action Input Schemas ---
export const SaveBodyCompositionInputSchema = z.object({
  userId: z.number().int(),
  weight: z.number().positive(),
  bodyFatMethod: z.enum(['manual', 'skinfold']),
  manualBodyFat: z.number().min(0).max(100).optional(),
  skinfoldMeasurements: SkinfoldMeasurementsSchema.optional(),
  circumferenceMeasurements: CircumferenceMeasurementsSchema.optional(),
  age: z.number().int().min(1).max(150),
  isMale: z.boolean(),
});

export const GetBodyCompositionEntriesInputSchema = z.object({
  userId: z.number().int(),
});

// --- Inferred Types ---
export type CircumferenceMeasurements = z.infer<typeof CircumferenceMeasurementsSchema>;
export type SkinfoldMeasurements = z.infer<typeof SkinfoldMeasurementsSchema>;
export type BodyCompositionEntry = z.infer<typeof BodyCompositionEntrySchema>;
export type SaveBodyCompositionInput = z.infer<typeof SaveBodyCompositionInputSchema>;
export type GetBodyCompositionEntriesInput = z.infer<typeof GetBodyCompositionEntriesInputSchema>;


