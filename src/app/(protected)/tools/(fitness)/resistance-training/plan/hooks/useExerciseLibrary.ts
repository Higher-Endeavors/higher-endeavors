import { useState, useEffect } from 'react';
import type { ExerciseOption } from '@/app/lib/types/pillars/fitness';

interface UseExerciseLibraryOptions {
    onError?: (error: Error) => void;
}

export function useExerciseLibrary(options?: UseExerciseLibraryOptions) {
    const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { onError } = options || {};

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/exercises');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch exercises: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                if (!Array.isArray(data)) {
                    throw new Error('Invalid response format: expected an array');
                }

                const formattedData = data.map((exercise: any) => ({
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
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch exercises';
                if (onError) onError(new Error(errorMessage));
                console.error('Error fetching exercises:', errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExercises();
    }, []); // Only fetch once on mount

    // Method to add a new user exercise to the local state
    const addUserExercise = (newExercise: ExerciseOption) => {
        setExerciseLibrary(prev => [newExercise, ...prev]);
    };

    return { 
        exerciseLibrary, 
        setExerciseLibrary, 
        isLoading,
        addUserExercise
    };
}