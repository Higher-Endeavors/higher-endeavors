import { z } from 'zod';

/**
 * Regular expression patterns for validation
 */
const PAIRING_REGEX = /^([A-Z]\d{1,2}|WU|CD)$/;
const TEMPO_REGEX = /^[0-9X][0-9][0-9X][0-9]$/;

/**
 * Enum for load Unit
 */
export const LoadUnit = [ 'kg', 'lbs' ] as const;

/**
 * Enum for Exercise Source
 */
export const ExerciseSource = [ 'library', 'user' ] as const;

/**
 * Base schema for load validation
 */
export const LoadSchema = z.union([
  z.number(),
  z.string().regex(/^[0-9]+(\.[0-9]+)?$/).transform(Number),
  z.string().regex(/^(BW|[A-Z][0-9]?)$/)
]);

/**
 * Base schema for RPE validation
 */
export const RpeSchema = z
  .number()
  .refine(
    (val) => (val >= 0 && val <= 10) || (val >= 6 && val <= 20),
    {
      message: 'RPE must be between 0-10 (modified) or 6-20 (Borg scale)',
    }
  );

/**
 * Schema for validating sub-sets within a set
 */
export const SubSetSchema = z.object({
  subSetNumber: z.number().int().min(1),
  plannedReps: z.number().int().min(1).max(99),
  plannedLoad: LoadSchema.optional(),
  loadUnit: z.enum(LoadUnit).optional(),
  plannedTempo: z.string().regex(TEMPO_REGEX).optional(),
  plannedRest: z.number().int().min(0).max(600).optional(),
  rpe: RpeSchema.optional(),
  rir: z.number().min(0).max(10).optional()
});

/**
 * Schema for validating individual set details
 */
export const SetDetailsSchema = z.object({
  setNumber: z.number().int().min(1),
  plannedReps: z.number().int().min(1).max(99),
  plannedLoad: LoadSchema.optional(),
  loadUnit: z.enum(LoadUnit).optional(),
  plannedTempo: z.string().regex(TEMPO_REGEX).optional(),
  plannedRest: z.number().int().min(0).max(600).optional(),
  rpe: RpeSchema.optional(),
  rir: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  subSets: z.array(SubSetSchema).optional()
});

/**
 * Main schema for validating exercises
 */
export const ExerciseSchema = z.object({
  id: z.number().or(z.string().transform(Number)),
  name: z.string().min(1, "Exercise name is required"),
  exerciseId: z.number(),
  source: z.enum(ExerciseSource),
  pairing: z.string().regex(PAIRING_REGEX, {
    message: "Pairing must be a letter followed by 1-2 digits, or WU/CD"
  }),
  notes: z.string().optional(),
  sets: z.number().int().min(1).max(99),
  isVariedSets: z.boolean(),
  isAdvancedSets: z.boolean(),
  plannedSets: z.array(SetDetailsSchema),
  rpe: RpeSchema.optional(),
  rir: z.number().min(0).max(10).optional()
}).refine(
  (data) => data.plannedSets.length === data.sets,
  {
    message: "Number of planned sets must match the sets count"
  }
).refine(
  (data) => {
    if (data.source === 'exercise_library') return data.exerciseId !== undefined;
    if (data.source === 'user_exercises') return data.exerciseId !== undefined;
    return false;
  },
  {
    message: "Exercise must have a valid exercise_id for its source"
  }
);

export function create_exercise(
  base_exercise: Omit<base_exercise, 'is_varied_sets' | 'is_advanced_sets'>,
  is_varied_sets: boolean = false,
  is_advanced_sets: boolean = false,
  planned_sets: exercise_set[] = []
): exercise {
  return {
    ...base_exercise,
    pairing: '',
    sets: planned_sets.length || 0,
    is_varied_sets,
    is_advanced_sets,
    planned_sets: planned_sets.length > 0 ? planned_sets : []
  };
}

/**
 * React-specific types (remain in camelCase)
 */
export interface ExerciseFormData {
  id: string;
  name: string;
  exerciseId: number;
  source: 'exercise_library' | 'user_exercises';
  pairing: string;
  sets: number;
  reps: number;
  load: number | string;
  loadUnit?: 'kg' | 'lbs';
  tempo?: string;
  rest?: number;
  rpe?: number;
  rir?: number;
  notes?: string;
  isVariedSets: boolean;
  isAdvancedSets: boolean;
  plannedSets: exercise_set[];
}

export interface ExerciseTraits {
  id: number;
  value: string;
  label: string;
  libraryId?: number;
  source: exercise_source;
  data: {
    id: number;
    name: string;
    source: exercise_source;
    difficulty?: string;
    target_muscle_group?: string;
    primary_equipment?: string;
    secondary_equipment?: string;
    exercise_family?: string;
    body_region?: string;
    movement_pattern?: string;
    movement_plane?: string;
    laterality?: string;
    library_id?: number;
  };
}

export type ExerciseSelectHandler = (
  newValue: ExerciseTraits | null,
  actionMeta: { 
    action: string;
    option?: ExerciseTraits;
    name?: string;
  }
) => void;

export interface ExerciseItemProps {
  exercise: exercise;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface MenuState {
  [key: number]: boolean;
}

export interface ExerciseListProps {
  exercises: exercise[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface GroupedExercises {
  [key: string]: exercise[];
}

