import { useState, useEffect } from 'react';
import { ExerciseLibraryItem } from '../../resistance-training/types/resistance-training.types';

interface UseExerciseLibraryReturn {
  exercises: ExerciseLibraryItem[];
  isLoading: boolean;
  error: Error | null;
  fetchExercises: () => Promise<void>;
}

export function useExerciseLibrary(): UseExerciseLibraryReturn {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercises = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exercises');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }

      const transformedExercises: ExerciseLibraryItem[] = data.map(exercise => ({
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
      
      setExercises(transformedExercises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching exercises';
      setError(new Error(errorMessage));
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return {
    exercises,
    isLoading,
    error,
    fetchExercises,
  };
}
