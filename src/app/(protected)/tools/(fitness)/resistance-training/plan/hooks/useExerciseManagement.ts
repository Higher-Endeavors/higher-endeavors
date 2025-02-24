import { useState } from 'react';
import type { ExerciseOption, BaseExercise, Exercise, Program, ExerciseSource, LoadUnit, VariedExercise } from '@/app/lib/types/pillars/fitness';
import { DefaultLoadUnit } from '@/app/lib/types/pillars/fitness';
import { createPlannedExercise, createVariedExercise } from '@/app/lib/types/pillars/fitness';
import { getNextPairing } from '../utils/ExercisePairings';

export function useExerciseManagement(
    userSettings: any, 
    program: Program,
    modalControls: { 
      setIsExerciseModalOpen: (open: boolean) => void,
      setIsAdvancedSearchOpen: (open: boolean) => void
    },
    { weekExercises, activeWeek, setWeekExercises }: {
      weekExercises: { [key: number]: Exercise[] },
      activeWeek: number,
      setWeekExercises: (value: { [key: number]: Exercise[] } | ((prev: { [key: number]: Exercise[] }) => { [key: number]: Exercise[] })) => void
    }
  ) {
    const { setIsExerciseModalOpen, setIsAdvancedSearchOpen } = modalControls;
    const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
    const [selectedExerciseName, setSelectedExerciseName] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>();

    const handleAddExercise = () => {
        setEditingExercise(undefined);
        setSelectedExerciseName('');
        setIsExerciseModalOpen(true);
    };

    const handleExerciseSelect = (exercise: ExerciseOption) => {
      const baseExercise = {
        id: `exercise-${Math.random().toString(36).substr(2, 9)}-day1`,
        exerciseId: exercise.libraryId || exercise.id,  // Use libraryId for library exercises, id for user exercises
        name: exercise.label || '',
        pairing: getNextPairing(weekExercises[activeWeek] || []),
        sets: 3,
        reps: 10,
        load: 0,
        tempo: '2010',
        rest: 60,
        loadUnit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || DefaultLoadUnit,
        notes: '',
        source: exercise.source as 'exercise_library' | 'user_exercises'  // Use the correct source type
      };
    
      setSelectedExercise(createPlannedExercise(baseExercise));
      setIsAdvancedSearchOpen(false);
    };

    const handleEditExercise = (id: string) => {
      const exercise = weekExercises[activeWeek]?.find(ex => ex.id === id);
      if (exercise && !exercise.isVariedSets) {
        setEditingExercise(createPlannedExercise({
          ...exercise,
          id: id
        }));
        setSelectedExerciseName(exercise.name);
        setIsExerciseModalOpen(true);
      }
    };

    const handleSaveExercise = (formattedExercise: Exercise) => {
      const exerciseData = formattedExercise.isVariedSets 
        ? createVariedExercise({
            id: formattedExercise.id,
            exerciseId: formattedExercise.exerciseId,
            name: formattedExercise.name,
            source: formattedExercise.source as 'exercise_library' | 'user_exercises'
          }, (formattedExercise as VariedExercise).setDetails || [])
        : createPlannedExercise({
            ...formattedExercise,
            source: formattedExercise.source as 'exercise_library' | 'user_exercises'
          });

      // Update week exercises
      setWeekExercises((prev: { [key: number]: Exercise[] }) => {
        const newWeekExercises = { ...prev };
        if (editingExercise) {
          Object.keys(newWeekExercises).forEach(weekNum => {
            newWeekExercises[Number(weekNum)] = newWeekExercises[Number(weekNum)]?.map(ex =>
              ex.id === exerciseData.id ? exerciseData : ex
            ) || [];
          });
        } else {
          if (!newWeekExercises[activeWeek]) {
            newWeekExercises[activeWeek] = [];
          }
          newWeekExercises[activeWeek] = [...newWeekExercises[activeWeek], exerciseData];
        }
        return newWeekExercises;
      });

      modalControls.setIsExerciseModalOpen(false);
      return exerciseData;
    };

    const handleDeleteExercise = (id: string) => {
      const baseId = id.split('-week')[0];
      
      setWeekExercises(prev => {
        const newWeekExercises = { ...prev };
        Object.keys(newWeekExercises).forEach(week => {
          newWeekExercises[Number(week)] = newWeekExercises[Number(week)]?.filter(
            ex => !String(ex.id).startsWith(baseId)
          ) || [];
        });
        return newWeekExercises;
      });
    };

    return {
      editingExercise,
      setEditingExercise,
      selectedExerciseName,
      setSelectedExerciseName,
      selectedExercise,
      setSelectedExercise,
      handleAddExercise,
      handleExerciseSelect,
      handleEditExercise,
      handleSaveExercise,
      handleDeleteExercise
    };
}