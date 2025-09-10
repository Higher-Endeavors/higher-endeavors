import { z } from 'zod';

// TIZ Breakdown Schema
export const TIZBreakdownSchema = z.object({
  z1: z.number().int().min(0),
  z2: z.number().int().min(0),
  z3: z.number().int().min(0),
  z4: z.number().int().min(0),
  z5: z.number().int().min(0),
});

// CME Activity Schema
export const CMEActivitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  modality: z.enum(['running', 'cycling', 'swimming', 'rowing', 'hiking', 'other']),
  baseVolume: z.number().int().min(0),
  volumePercentage: z.number().min(0).max(100),
  color: z.string().min(1),
  icon: z.string().min(1),
  weeklyVolumes: z.array(z.number().int().min(0)).optional(),
  weeklyTIZ: z.array(TIZBreakdownSchema).optional(),
});

// TIZ Targets Schema
export const TIZTargetsSchema = z.object({
  z1: z.number().int().min(0),
  z2: z.number().int().min(0),
  z3: z.number().int().min(0),
  z4: z.number().int().min(0),
  z5: z.number().int().min(0),
  total: z.number().int().min(0),
});

// CME Volume Settings Schema
export const CMEVolumeSettingsSchema = z.object({
  baselineVolume: z.number().int().min(0),
  peakVolume: z.number().int().min(0),
  rampRate: z.number().min(4).max(12),
  deloadEvery: z.number().int().min(2).max(5),
  deloadReduction: z.number().min(10).max(30),
  activities: z.array(CMEActivitySchema),
  tizTargets: TIZTargetsSchema,
  periodizationStyle: z.enum(['Linear', 'Undulating', 'Block', 'Reverse']),
  phaseDuration: z.number().int().min(2).max(12),
});

// CME Volume Plan Schema
export const CMEVolumePlanSchema = z.object({
  week: z.number().int().min(0),
  totalVolume: z.number().int().min(0),
  activities: z.record(z.string(), z.object({
    volume: z.number().int().min(0),
    tiz: TIZBreakdownSchema,
  })),
});

// CME Volume Context Schema
export const CMEVolumeContextSchema = z.object({
  planStartDate: z.date(),
  totalWeeks: z.number().int().min(1).max(52),
  currentWeek: z.number().int().min(0).optional(),
});

// Component Props Schemas
export const CMEVolumeSettingsPropsSchema = z.object({
  settings: CMEVolumeSettingsSchema,
  onSettingsChange: z.function(),
  isModal: z.boolean().optional(),
  onClose: z.function().optional(),
});

export const CMEVolumePlanPropsSchema = z.object({
  settings: CMEVolumeSettingsSchema,
  totalWeeks: z.number().int().min(1).max(52),
  onPlanChange: z.function().optional(),
});

// --- Types ---
export type CMEVolumeSettings = z.infer<typeof CMEVolumeSettingsSchema>;
export type CMEActivity = z.infer<typeof CMEActivitySchema>;
export type TIZTargets = z.infer<typeof TIZTargetsSchema>;
export type TIZBreakdown = z.infer<typeof TIZBreakdownSchema>;
export type CMEVolumePlan = z.infer<typeof CMEVolumePlanSchema>;
export type CMEVolumeContext = z.infer<typeof CMEVolumeContextSchema>;
export type CMEVolumeSettingsProps = z.infer<typeof CMEVolumeSettingsPropsSchema>;
export type CMEVolumePlanProps = z.infer<typeof CMEVolumePlanPropsSchema>;
