import { ExerciseLibraryItem } from '../../resistance-training/types/resistance-training.zod';
import { getApiBaseUrl } from '@/app/lib/utils/apiUtils';

export async function getExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/exercises`, {
    cache: 'force-cache',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch exercises: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format: expected an array');
  }
  return data.map((exercise: any) => ({
    exerciseLibraryId: exercise.exercise_library_id,
    name: exercise.name,
    source: 'library',
    exercise_family: exercise.exercise_family || null,
    exercise_family_id: exercise.exercise_family_id, // Use the value directly
    body_region: exercise.body_region || null,
    muscle_group: exercise.muscle_group || null,
    movement_pattern: exercise.movement_pattern || null,
    movement_plane: exercise.movement_plane || null,
    equipment: exercise.equipment || null,
    laterality: exercise.laterality || null,
    difficulty: exercise.difficulty || null
  }));
}
