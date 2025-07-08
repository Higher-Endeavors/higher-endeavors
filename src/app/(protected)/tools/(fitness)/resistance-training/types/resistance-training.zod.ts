import { z } from 'zod';

// --- Program Schemas ---

export const ResistanceProgramSchema = z.object({
  resistanceProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  phaseFocus: z.string().optional(),
  periodizationType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52).optional(),
  notes: z.string().optional(),
  templateId: z.number().int().optional(),
  startDate: z.string().optional(), // ISO date
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  days: z.array(z.lazy(() => ProgramDaySchema)).optional(),
}).strict();

export const ResistanceProgramTemplateSchema = z.object({
  resistanceProgramTemplateId: z.number().int(),
  templateName: z.string().min(1),
  phaseFocus: z.string().optional(),
  periodizationType: z.string().optional(),
  progressionRules: z.any().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const ProgramDaySchema = z.object({
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  exercises: z.array(z.lazy(() => PlannedExerciseSchema)),
}).strict();

// --- Exercise Schemas ---

export interface PlannedSet {
  set?: number;
  reps?: number;
  load?: string;
  restSec?: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  subSets?: PlannedSet[];
  type?: 'varied' | 'advanced';
}

export const PlannedSetSchema: z.ZodType<PlannedSet> = z.lazy(() => z.object({
  set: z.number().int().min(1).optional(),
  reps: z.number().int().min(0).optional(),
  load: z.string().optional(),
  restSec: z.number().int().min(0).optional(),
  rpe: z.number().int().min(0).max(10).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  tempo: z.string().optional(),
  subSets: z.array(PlannedSetSchema).optional(),
  type: z.enum(['varied', 'advanced']).optional(),
}).strict());

export const PlannedExerciseSchema = z.object({
  programExercisesPlannedId: z.number().int().optional(),
  resistanceProgramId: z.number().int().optional(),
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  exerciseSource: z.enum(['library', 'user']),
  exerciseLibraryId: z.number().int().optional(),
  userExerciseLibraryId: z.number().int().optional(),
  pairing: z.string().optional(),
  plannedSets: z.array(PlannedSetSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const UserExerciseSchema = z.object({
  userExerciseLibraryId: z.number().int(),
  userId: z.number().int(),
  exerciseName: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const ExerciseLibraryItemSchema = z.object({
  exerciseLibraryId: z.number().int(),
  name: z.string().min(1),
  difficulty: z.string().optional(),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
}).strict();

// --- Performance Schemas ---

export interface PerformanceSet {
  set?: number;
  reps?: number;
  load?: string;
  restSec?: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  subSets?: PerformanceSet[];
  type?: 'varied' | 'advanced';
}

export const PerformanceSetSchema: z.ZodType<PerformanceSet> = z.lazy(() => z.object({
  set: z.number().int().min(1).optional(),
  reps: z.number().int().min(0).optional(),
  load: z.string().optional(),
  restSec: z.number().int().min(0).optional(),
  rpe: z.number().int().min(0).max(10).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  tempo: z.string().optional(),
  subSets: z.array(PerformanceSetSchema).optional(),
  type: z.enum(['varied', 'advanced']).optional(),
}).strict());

export const ExercisePerformanceSchema = z.object({
  programExercisesActualId: z.number().int().optional(),
  programExercisesPlannedId: z.number().int(),
  performedAt: z.string(),
  actualSets: z.array(PerformanceSetSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

// --- Types ---
export type ResistanceProgram = z.infer<typeof ResistanceProgramSchema>;
export type ResistanceProgramTemplate = z.infer<typeof ResistanceProgramTemplateSchema>;
export type ProgramDay = z.infer<typeof ProgramDaySchema>;
export type PlannedExercise = z.infer<typeof PlannedExerciseSchema>;
export type UserExercise = z.infer<typeof UserExerciseSchema>;
export type ExerciseLibraryItem = z.infer<typeof ExerciseLibraryItemSchema>;
export type ExercisePerformance = z.infer<typeof ExercisePerformanceSchema>; 