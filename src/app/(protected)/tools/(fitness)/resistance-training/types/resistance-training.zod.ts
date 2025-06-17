import { z } from 'zod';

import { PlannedSet, PerformanceSet } from './resistance-training.types';

// --- Program Schemas ---

export const ResistanceProgramSchema = z.object({
  resistanceProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  phaseFocus: z.string(),
  periodizationType: z.string(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52).optional(),
  notes: z.string().optional(),
  templateId: z.number().int().optional(),
  startDate: z.string().optional(), // ISO date
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  days: z.array(z.lazy(() => ProgramDaySchema)).optional(),
});

export const ResistanceProgramTemplateSchema = z.object({
  resistanceProgramTemplateId: z.number().int(),
  templateName: z.string().min(1),
  phaseFocus: z.string(),
  periodizationType: z.string(),
  progressionRules: z.any().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const ProgramDaySchema = z.object({
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  exercises: z.array(z.lazy(() => PlannedExerciseSchema)),
});

// --- Exercise Schemas ---

export const PlannedSetSchema: z.ZodType<PlannedSet> = z.object({
  set: z.number().int().min(1).optional(),
  reps: z.number().int().min(0).optional(),
  load: z.string().optional(),
  restSec: z.number().int().min(0).optional(),
  rpe: z.number().int().min(0).max(10).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  tempo: z.string().optional(),
  subSets: z.array(z.lazy(() => PlannedSetSchema)).optional(),
  type: z.enum(['varied', 'advanced']).optional(),
});

export const PlannedExerciseSchema = z.object({
  programDayExerciseId: z.number().int().optional(),
  resistanceProgramId: z.number().int().optional(),
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  exerciseSource: z.enum(['library', 'user']),
  exerciseLibraryId: z.number().int().optional(),
  userExerciseId: z.number().int().optional(),
  pairing: z.string().optional(),
  setCount: z.number().int().min(1),
  defaultReps: z.number().int().min(0).optional(),
  defaultLoad: z.string().optional(),
  defaultRestSec: z.number().int().min(0).optional(),
  tempoEccentric: z.string().optional(),
  tempoPause1: z.string().optional(),
  tempoConcentric: z.string().optional(),
  tempoPause2: z.string().optional(),
  defaultRpe: z.number().int().min(0).max(10).optional(),
  defaultRir: z.number().int().min(0).max(10).optional(),
  detail: z.array(PlannedSetSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const UserExerciseSchema = z.object({
  userExerciseId: z.number().int(),
  userId: z.number().int(),
  exerciseName: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ExerciseLibraryItemSchema = z.object({
  exerciseLibraryId: z.number().int(),
  name: z.string().min(1),
  targetMuscleGroup: z.string().optional(),
  primaryEquipment: z.string().optional(),
  difficulty: z.string().optional(),
});

// --- Performance Schemas ---

export const PerformanceSetSchema: z.ZodType<PerformanceSet> = z.object({
  set: z.number().int().min(1).optional(),
  reps: z.number().int().min(0).optional(),
  load: z.string().optional(),
  restSec: z.number().int().min(0).optional(),
  rpe: z.number().int().min(0).max(10).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  tempo: z.string().optional(),
  subSets: z.array(z.lazy(() => PerformanceSetSchema)).optional(),
  type: z.enum(['varied', 'advanced']).optional(),
});

export const ExercisePerformanceSchema = z.object({
  perfId: z.number().int().optional(),
  programDayExerciseId: z.number().int(),
  performedAt: z.string(),
  setCount: z.number().int().min(1),
  actualReps: z.number().int().min(0).optional(),
  actualLoad: z.string().optional(),
  actualRestSec: z.number().int().min(0).optional(),
  actualRpe: z.number().int().min(0).max(10).optional(),
  actualRir: z.number().int().min(0).max(10).optional(),
  detail: z.array(PerformanceSetSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}); 