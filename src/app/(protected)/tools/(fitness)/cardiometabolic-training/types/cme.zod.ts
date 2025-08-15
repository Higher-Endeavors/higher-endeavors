import { z } from 'zod';
import type {
  CmeStepType,
  CmePlannedStep,
  CmeActualStep
} from './cme.types';

// --- Enums ---
export const CmeStepTypeEnum = z.enum(['Warm-Up', 'Work', 'Recovery', 'Cool-Down']);

// --- Program Schemas ---

export const CmeProgramSchema = z.object({
  cmeProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52).optional(),
  notes: z.string().optional(),
  templateId: z.number().int().optional(),
  startDate: z.string().optional(), // ISO date
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const CmeProgramTemplateSchema = z.object({
  cmeProgramTemplateId: z.number().int(),
  templateName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  progressionRules: z.any().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const CmePlannedStepSchema: z.ZodType<CmePlannedStep> = z.object({
  stepType: CmeStepTypeEnum,
  duration: z.number().int().min(1).optional(),
  intensity: z.union([z.string(), z.number()]).optional(),
  intensityMetric: z.string().optional(),
  notes: z.string().optional(),
  subSteps: z.array(z.lazy(() => CmePlannedStepSchema)).optional(),
});

export const CmeProgramDaySessionSchema = z.object({
  cmeProgramDaySessionId: z.number().int(),
  cmeProgramId: z.number().int(),
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  sessionType: z.string().min(1),
  sessionName: z.string().optional(),
  plannedDistance: z.number().optional(),
  plannedDuration: z.number().int().optional(),
  plannedIntensity: z.record(z.any()).optional(),
  detail: z.array(CmePlannedStepSchema).optional(),
  notes: z.string().optional(),
  orderIndex: z.number().int().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

// --- Actual/Performance Schemas ---

export const CmeActualStepSchema: z.ZodType<CmeActualStep> = z.object({
  stepType: CmeStepTypeEnum,
  duration: z.number().int().min(1).optional(),
  intensity: z.union([z.string(), z.number()]).optional(),
  intensityMetric: z.string().optional(),
  notes: z.string().optional(),
  subSteps: z.array(z.lazy(() => CmeActualStepSchema)).optional(),
});

export const CmeUserActualSessionSchema = z.object({
  cmeUserActualSessionId: z.number().int(),
  userId: z.number().int(),
  cmeProgramDaySessionId: z.number().int().optional(),
  sessionDate: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const CmeSessionIntervalPerfSchema = z.object({
  cmeSessionIntervalPerfId: z.number().int(),
  cmeUserActualSessionId: z.number().int(),
  stepNumber: z.number().int().min(1),
  stepType: CmeStepTypeEnum,
  actualDuration: z.number().int().optional(),
  actualDistance: z.number().optional(),
  actualIntensity: z.number().optional(),
  actualAvgSpeed: z.number().optional(),
  actualActiveCalories: z.number().optional(),
  actualAvgHeartRate: z.number().optional(),
  cmeMetricId: z.number().int().optional(),
  actualTempo: z.string().optional(),
  actualRest: z.number().int().optional(),
  detail: z.array(CmeActualStepSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

// --- Metrics Schemas ---

export const CmeMetricSchema = z.object({
  cmeMetricId: z.number().int(),
  metricName: z.string().min(1),
});

export const CmeIntervalMetricSchema = z.object({
  metricId: z.number().int(),
  cmeSessionIntervalPerfId: z.number().int(),
  cmeMetricId: z.number().int(),
  metricValue: z.number(),
  metricUnit: z.string().optional(),
  recordedOffsetSeconds: z.number().int().optional(),
  source: z.string().optional(),
  createdAt: z.string(),
});
