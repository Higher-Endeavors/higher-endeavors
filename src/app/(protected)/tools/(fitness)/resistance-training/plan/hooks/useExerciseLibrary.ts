import { useState, useEffect } from 'react';
import type { ExerciseOption } from '@/app/lib/types/pillars/fitness';

interface UseExerciseLibraryOptions {
    onError?: (error: Error) => void;
  }

  export function useExerciseLibrary(options?: UseExerciseLibraryOptions) {
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseOption[]>([]);
  const [mounted, setMounted] = useState(false);
  const { onError } = options || {};
  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load library effect
  useEffect(() => {
    const loadExerciseLibrary = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercise library');
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid exercise library data format');
        }
        
        const formattedData: ExerciseOption[] = data.map((exercise: any) => ({
          id: exercise.id.toString(),
          value: `${exercise.source}-${exercise.id}`,
          label: exercise.exercise_name,
          libraryId: exercise.source === 'library' ? parseInt(exercise.id) : undefined,
          source: exercise.source,
          data: {
            id: exercise.id.toString(),
            name: exercise.exercise_name,
            source: exercise.source || 'library',
            difficulty: exercise.difficulty_name,
            targetMuscleGroup: exercise.target_muscle_group || 'N/A',
            primaryEquipment: exercise.primary_equipment || 'N/A',
            secondaryEquipment: exercise.secondary_equipment,
            exerciseFamily: exercise.exercise_family || 'N/A',
            bodyRegion: exercise.body_region || 'N/A',
            movementPattern: exercise.movement_pattern || 'N/A',
            movementPlane: exercise.movement_plane || 'N/A',
            laterality: exercise.laterality || 'N/A'
          }
        }));
        
        setExerciseLibrary(formattedData);
      } catch (error) {
        console.error('Error loading exercise library:', error);
        throw error; // Let error handling be managed by toast hook
      }
    };

    loadExerciseLibrary().catch(error => {
      // Error handling delegated to toast hook via onError callback
      if (onError) onError(error);
    });
  }, [onError]);

  return { exerciseLibrary, setExerciseLibrary, mounted };
}