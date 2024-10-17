export interface ResistTrainExerciseLibrary {
  id: number;
  exercise_name: string;
  description: string | null;
  movement: string | null;
  category: string | null;
  primary_muscles: string | null;
  secondary_muscles: string | null;
  images: string | null;
  equipment: string | null;
}

export interface StructBalRefLift {
  id: number;
  struct_bal_ref_lift_load: number;
  exercise_library_id: number | null;
}

export interface StructBalancedLift {
  struct_balanced_user_id: number | null;
  id: number;
  struct_balanced_reference_lift_id: number;
  struct_balanced_load: number | null;
  struct_balanced_load_unit: string | null;
  struct_balanced_reference_lift_reps: number | null;
  struct_balanced_lifts_created_date: Date | null;
}
