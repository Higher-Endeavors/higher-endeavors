export interface APIExercise {
  id?: string;
  name: string;
  pairing?: number;
  sets: Array<{
    setNumber: number;
    reps: number;
    load: number;
    loadUnit: string;
    tempo?: string;
    rest?: number;
  }>;
  notes?: string;
  source: 'library' | 'user';
  libraryId?: string;
  userExerciseId?: string;
} 