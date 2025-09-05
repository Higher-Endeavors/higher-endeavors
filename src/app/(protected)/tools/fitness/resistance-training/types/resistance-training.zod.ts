import { z } from 'zod';

// --- Template Info Schema ---
export const TemplateInfoSchema = z.object({
  tierContinuumId: z.number().int().optional(),
  tierContinuumName: z.string().optional(),
  categories: z.array(z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string().optional()
  })).optional()
});

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
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(), // ISO date
  rrule: z.string().optional(),
  duration: z.number().int().min(1).max(52).optional(),
  recurringEventPid: z.number().int().optional(),
  originalStart: z.string().optional(), // ISO date
  deleted: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  // Template information (only for templates)
  templateInfo: TemplateInfoSchema.optional(),
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

export const ProgramExercisesPlannedSchema = z.object({
  programExercisesPlannedId: z.number().int(), // Allow negative for temporary IDs
  resistanceProgramId: z.number().int(),
  exerciseSource: z.enum(['library', 'user', 'cme_library']),
  exerciseLibraryId: z.number().int().optional(),
  userExerciseLibraryId: z.number().int().optional(),
  pairing: z.string().optional(),
  plannedSets: z.array(z.lazy(() => ExerciseSetSchema)).optional(),
  actualSets: z.array(z.lazy(() => ExerciseSetSchema)).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

export const ProgramExercisesActualSchema = z.object({
  programExercisesActualId: z.number().int(),
  programExercisesPlannedId: z.number().int(),
  exercisesActualDate: z.string(),
  actualSets: z.array(z.lazy(() => ExerciseSetSchema)).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
}).strict();

// --- Exercise Schemas ---

export type ExerciseSet = {
  set?: number;
  reps?: number;
  load?: string;
  loadUnit?: string;
  restSec?: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  subSets?: ExerciseSet[];
  type?: 'varied' | 'advanced';
  repUnit?: string;
  distance?: number;
  distanceUnit?: string;
  duration?: number;
  durationUnit?: string;
  notes?: string;
  // Cycling-specific fields
  speed?: number | null;
  rpm?: number | null;
  watts?: number | null;
  resistance?: number | null;
  // Running-specific fields
  pace?: string;
  // Treadmill-specific fields
  incline?: number;
};

export const ExerciseSetSchema: z.ZodType<ExerciseSet> = z.lazy(() =>
  z.object({
    set: z.number().int().min(1).optional(),
    reps: z.number().int().min(0).optional(),
    load: z.string().optional(),
    loadUnit: z.string().optional(),
    restSec: z.number().int().min(0).optional(),
    rpe: z.number().int().min(0).max(20).optional(),
    rir: z.number().int().min(0).max(10).optional(),
    tempo: z.string().optional(),
    subSets: z.array(ExerciseSetSchema).optional(),
    type: z.enum(['varied', 'advanced']).optional(),
    repUnit: z.string().optional(),
    distance: z.number().int().min(0).optional(),
    distanceUnit: z.string().optional(),
    duration: z.number().int().min(0).optional(),
    durationUnit: z.string().optional(),
    notes: z.string().optional(),
    // Cycling-specific fields
    speed: z.number().int().min(0).nullable().optional(),
    rpm: z.number().int().min(0).nullable().optional(),
    watts: z.number().int().min(0).nullable().optional(),
    resistance: z.number().int().min(0).nullable().optional(),
    // Running-specific fields
    pace: z.string().optional(),
    // Treadmill-specific fields
    incline: z.number().int().min(0).max(15).optional(),
  }).strict()
);


export const UserExerciseSchema = z.object({
  userExerciseLibraryId: z.number().int(),
  userId: z.number().int(),
  exerciseName: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).strict();

export const ExerciseLibraryItemSchema = z.object({
  exerciseLibraryId: z.number().int().optional(),
  userExerciseLibraryId: z.number().int().optional(),
  name: z.string().min(1),
  difficulty: z.string().optional(),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  source: z.enum(['library', 'user', 'cme_library']),
  exercise_family: z.string().optional(),
  exercise_family_id: z.number().int().optional(),
  // User attribution fields for admin clarity when viewing other users' exercises
  createdByUserId: z.number().int().optional(),
  createdByUserName: z.string().optional(),
}).strict();

// Program list item for browser display
export const ProgramListItemSchema = z.object({
  resistanceProgramId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  phaseFocus: z.string().optional(),
  periodizationType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  exerciseCount: z.number().int(),
  exerciseSummary: z.object({
    totalExercises: z.number().int(),
    exercises: z.array(z.object({
      name: z.string()
    }))
  }).optional(),
  // Template information (only for templates)
  templateInfo: TemplateInfoSchema.optional(),
}).strict();

// --- Action Schemas ---

export const UpdateResistanceProgramSchema = z.object({
  programId: z.number().int(),
  userId: z.number().int(),
  programName: z.string().min(1),
  phaseFocus: z.string().optional(),
  periodizationType: z.string().optional(),
  progressionRules: z.any().optional(),
  programDuration: z.number().int().min(1).max(52),
  notes: z.string().optional(),
  weeklyExercises: z.array(z.array(z.object({
    exerciseSource: z.enum(['library', 'user', 'cme_library']),
    exerciseLibraryId: z.number().int().nullable().optional(),
    userExerciseLibraryId: z.number().int().nullable().optional(),
    pairing: z.string().optional(),
    plannedSets: z.array(z.any()).optional(),
    notes: z.string().optional(),
  })))
});

export const DuplicateResistanceProgramSchema = z.object({
  programId: z.number().int(),
  newProgramName: z.string().min(1),
});

export const DeleteResistanceProgramSchema = z.object({
  programId: z.number().int(),
});

// --- Types ---
export type ResistanceProgram = z.infer<typeof ResistanceProgramSchema>;
export type ResistanceProgramTemplate = z.infer<typeof ResistanceProgramTemplateSchema>;
export type ProgramExercisesPlanned = z.infer<typeof ProgramExercisesPlannedSchema>;
export type ProgramExercisesActual = z.infer<typeof ProgramExercisesActualSchema>;
export type UserExercise = z.infer<typeof UserExerciseSchema>;
export type ExerciseLibraryItem = z.infer<typeof ExerciseLibraryItemSchema>;
export type ProgramListItem = z.infer<typeof ProgramListItemSchema>;
export type UpdateResistanceProgramInput = z.infer<typeof UpdateResistanceProgramSchema>;
export type DuplicateResistanceProgramInput = z.infer<typeof DuplicateResistanceProgramSchema>;
export type DeleteResistanceProgramInput = z.infer<typeof DeleteResistanceProgramSchema>; 

