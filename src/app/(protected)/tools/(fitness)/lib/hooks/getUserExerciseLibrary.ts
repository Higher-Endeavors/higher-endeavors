import { ExerciseLibraryItem } from '../../resistance-training/types/resistance-training.zod';

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
    userExerciseLibraryId: exercise.user_exercise_library_id,
    name: exercise.name,
    source: 'user',
  }));
} 