import { z } from 'zod';

// Adjustment Type Schema
export const AdjustmentTypeSchema = z.enum(['temporary', 'structural', 'recovery', 'emergency']);

// Activity Override Schema
export const ActivityOverrideSchema = z.object({
  enabled: z.boolean(),
  volumeMultiplier: z.number().min(0).max(1),
  substituteActivity: z.string().optional(),
});

// Volume Adjustment Schema
export const VolumeAdjustmentSchema = z.object({
  id: z.string().min(1),
  type: AdjustmentTypeSchema,
  weekNumber: z.number().int().min(0),
  reason: z.string().min(1),
  description: z.string().min(1),
  appliedAt: z.date(),
  expiresAt: z.date().optional(),
  volumeMultiplier: z.number().min(0).max(1),
  activityOverrides: z.record(z.string(), ActivityOverrideSchema).optional(),
  tizMultiplier: z.number().min(0).max(1).optional(),
  intensityReduction: z.number().min(0).max(10).optional(),
  isRecoveryPeriod: z.boolean().optional(),
  recoveryDuration: z.number().int().min(1).optional(),
  gradualReturn: z.boolean().optional(),
  createdBy: z.enum(['user', 'system', 'coach']),
  notes: z.string().optional(),
});

// Volume Adjustment Context Schema
export const VolumeAdjustmentContextSchema = z.object({
  currentWeek: z.number().int().min(0),
  totalWeeks: z.number().int().min(1).max(52),
  planStartDate: z.date(),
  adjustments: z.array(VolumeAdjustmentSchema),
  baseSettings: z.any(), // Original CME settings
});

// Quick Adjustment Options Schema
export const QuickAdjustmentOptionsSchema = z.object({
  volumeReduction: z.number().min(0).max(100),
  activitySubstitutions: z.record(z.string(), z.string()),
  duration: z.number().int().min(1).max(12),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

// Structural Adjustment Options Schema
export const StructuralAdjustmentOptionsSchema = z.object({
  newBaselineVolume: z.number().int().min(0),
  newPeakVolume: z.number().int().min(0),
  newRampRate: z.number().min(4).max(12),
  newDeloadFrequency: z.number().int().min(2).max(5),
  newTIZTargets: z.any(),
  recalculateFromWeek: z.number().int().min(0),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

// --- Types ---
export type AdjustmentType = z.infer<typeof AdjustmentTypeSchema>;
export type VolumeAdjustment = z.infer<typeof VolumeAdjustmentSchema>;
export type VolumeAdjustmentContext = z.infer<typeof VolumeAdjustmentContextSchema>;
export type QuickAdjustmentOptions = z.infer<typeof QuickAdjustmentOptionsSchema>;
export type StructuralAdjustmentOptions = z.infer<typeof StructuralAdjustmentOptionsSchema>;
