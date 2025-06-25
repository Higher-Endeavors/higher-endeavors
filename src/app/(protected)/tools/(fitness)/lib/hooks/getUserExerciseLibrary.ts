import { ExerciseLibraryItem } from '../../resistance-training/types/resistance-training.types';

export async function getUserExerciseLibrary(userId: number): Promise<ExerciseLibraryItem[]> {
  const res = await fetch(`http://localhost:3000/api/user-exercise-library?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user exercise library: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format: expected an array');
  }
  return data.map((exercise: any) => ({
    exercise_library_id: exercise.exercise_library_id,
    name: exercise.name,
    source: 'user',
    exercise_family: null,
    body_region: null,
    muscle_group: null,
    movement_pattern: null,
    movement_plane: null,
    equipment: null,
    laterality: null,
    difficulty: null
  }));
} 