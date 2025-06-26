// Resistance Training Types

// --- Program Structures ---

/**
 * Represents a resistance training program for a user.
 */
export interface ResistanceProgram {
  resistanceProgramId: number;
  userId: number;
  programName: string;
  phaseFocus: string;
  periodizationType: string;
  progressionRules?: any; // JSONB, can be further typed if needed
  programDuration?: number; // in weeks
  notes?: string;
  templateId?: number;
  startDate?: string; // ISO date
  createdAt: string;
  updatedAt?: string;
  days?: ProgramDay[]; // Optional, for future calendar functionality
}

/**
 * Represents a template for resistance training programs.
 */
export interface ResistanceProgramTemplate {
  resistanceProgramTemplateId: number;
  templateName: string;
  phaseFocus: string;
  periodizationType: string;
  progressionRules?: any;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a day in a resistance training program (future-proofed for calendar).
 */
export interface ProgramDay {
  weekNumber: number;
  dayNumber: number;
  exercises: PlannedExercise[];
}

// --- Exercise Structures ---

/**
 * Represents an exercise planned for a specific program day.
 */
export interface PlannedExercise {
  programDayExerciseId?: number;
  resistanceProgramId?: number;
  weekNumber: number;
  dayNumber: number;
  exerciseSource: 'library' | 'user';
  exerciseLibraryId?: number;
  userExerciseId?: number;
  pairing: string; // e.g. 'A1', 'B2', etc.
  setCount: number;
  defaultReps?: number;
  defaultLoad?: string;
  defaultRestSec?: number;
  tempoEccentric?: string;
  tempoPause1?: string;
  tempoConcentric?: string;
  tempoPause2?: string;
  defaultRpe?: number;
  defaultRir?: number;
  detail?: PlannedSet[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Represents a planned set (or sub-set for advanced/cluster sets).
 */
export interface PlannedSet {
  set?: number;
  reps?: number;
  load?: string;
  restSec?: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  subSets?: PlannedSet[]; // For advanced/cluster sets (one level)
  type?: 'varied' | 'advanced';
  repUnit?: string;
}

/**
 * Represents a user-defined custom exercise.
 */
export interface UserExercise {
  userExerciseId: number;
  userId: number;
  exerciseName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents an exercise from the central library.
 */
export type ExerciseLibraryItem = {
  exercise_library_id: number;
  name: string;
  source: 'library' | 'user';
  exercise_family: string | null;
  body_region: string | null;
  muscle_group: string | null;
  movement_pattern: string | null;
  movement_plane: string | null;
  equipment: string | null;
  laterality: string | null;
  difficulty: string | null;
};

// --- Performance Structures ---

/**
 * Represents actual performance of a planned exercise.
 */
export interface ExercisePerformance {
  perfId?: number;
  programDayExerciseId: number;
  performedAt: string; // ISO date
  setCount: number;
  actualReps?: number;
  actualLoad?: string;
  actualRestSec?: number;
  actualRpe?: number;
  actualRir?: number;
  detail?: PerformanceSet[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a performed set (mirrors PlannedSet, but for actuals).
 */
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
