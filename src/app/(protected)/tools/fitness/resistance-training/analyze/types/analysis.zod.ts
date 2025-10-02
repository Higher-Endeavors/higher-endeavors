import { z } from 'zod';

// Volume Analysis Schemas
export const VolumeDataPointSchema = z.object({
  week: z.number().int().min(1),
  plannedVolume: z.number().min(0),
  actualVolume: z.number().min(0).nullable(),
  volumeDifference: z.number().nullable(), // actual - planned
  volumePercentage: z.number().nullable(), // (actual / planned) * 100
});

export const ExerciseVolumeDataSchema = z.object({
  exerciseName: z.string().min(1),
  exerciseId: z.number().int(),
  weeklyData: z.array(VolumeDataPointSchema),
  totalPlannedVolume: z.number().min(0),
  totalActualVolume: z.number().min(0).nullable(),
  averageVolumePercentage: z.number().nullable(),
});

export const ProgramVolumeAnalysisSchema = z.object({
  programId: z.number().int(),
  programName: z.string().min(1),
  totalWeeks: z.number().int().min(1),
  exerciseData: z.array(ExerciseVolumeDataSchema),
  overallVolumeData: z.array(VolumeDataPointSchema),
  totalPlannedVolume: z.number().min(0),
  totalActualVolume: z.number().min(0).nullable(),
  averageVolumePercentage: z.number().nullable(),
});

export const VolumeProgressionSchema = z.object({
  isProgressive: z.boolean(),
  progressionType: z.enum(['linear', 'undulating', 'mixed', 'none']),
  averageWeeklyIncrease: z.number(),
  consistency: z.number().min(0).max(100),
});

// Program Selection Schemas
export const ProgramForAnalysisSchema = z.object({
  resistanceProgramId: z.number().int(),
  programName: z.string().min(1),
  programDuration: z.number().int().min(1),
  resistPhaseId: z.number().int().nullable(),
  resistPhaseName: z.string().nullable(),
  resistPeriodizationId: z.number().int().nullable(),
  resistPeriodizationName: z.string().nullable(),
  createdAt: z.string(),
  hasActualData: z.boolean(),
  exerciseCount: z.number().int().min(0),
});

// Analysis Settings Schemas
export const AnalysisSettingsSchema = z.object({
  loadUnit: z.enum(['lbs', 'kg']),
  selectedExercises: z.array(z.number().int()),
  showPlannedOnly: z.boolean().optional(),
  showActualOnly: z.boolean().optional(),
  showDifferences: z.boolean().optional(),
});

// Chart Configuration Schemas
export const ChartConfigSchema = z.object({
  chartType: z.enum(['line', 'bar', 'area']).optional(),
  showGrid: z.boolean().optional(),
  showLegend: z.boolean().optional(),
  showTooltips: z.boolean().optional(),
  colorScheme: z.enum(['default', 'colorblind', 'monochrome']).optional(),
});

// Export TypeScript types
export type VolumeDataPoint = z.infer<typeof VolumeDataPointSchema>;
export type ExerciseVolumeData = z.infer<typeof ExerciseVolumeDataSchema>;
export type ProgramVolumeAnalysis = z.infer<typeof ProgramVolumeAnalysisSchema>;
export type VolumeProgression = z.infer<typeof VolumeProgressionSchema>;
export type ProgramForAnalysis = z.infer<typeof ProgramForAnalysisSchema>;
export type AnalysisSettings = z.infer<typeof AnalysisSettingsSchema>;
export type ChartConfig = z.infer<typeof ChartConfigSchema>;
