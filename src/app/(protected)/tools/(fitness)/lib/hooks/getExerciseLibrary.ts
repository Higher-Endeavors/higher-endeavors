import { ExerciseLibraryItem } from '../../resistance-training/types/resistance-training.types';

export async function getExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
  const res = await fetch('http://localhost:3000/api/exercises', {
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
    exercise_library_id: exercise.id,
    name: exercise.name,
    source: 'library',
    exercise_family: exercise.exercise_family || null,
    body_region: exercise.body_region || null,
    muscle_group: exercise.muscle_group || null,
    movement_pattern: exercise.movement_pattern || null,
    movement_plane: exercise.movement_plane || null,
    equipment: exercise.equipment || null,
    laterality: exercise.laterality || null,
    difficulty: exercise.difficulty || null
  }));
}
