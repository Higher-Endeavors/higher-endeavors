import { useState } from 'react';
import type { 
  ExerciseTraits, 
  base_exercise, 
  exercise, 
  program, 
  exercise_source, 
  load_unit, 
  varied_exercise,
  planned_exercise,
  planned_exercise_set
} from '@/app/lib/types/pillars/fitness';

import { default_load_unit } from '@/app/lib/types/pillars/fitness';
import { create_planned_exercise, create_varied_exercise } from '@/app/lib/types/pillars/fitness';
import { get_next_pairing } from '../utils/ExercisePairings';
import { transform_to_regular_exercise } from '../utils/ExerciseTransformations';

export function useExerciseManagement(
    userSettings: any, 
    program: program,
    modalControls: { 
      setIsExerciseModalOpen: (open: boolean) => void,
      setIsAdvancedSearchOpen: (open: boolean) => void
    },
    { weekExercises, activeWeek, setWeekExercises }: {
      weekExercises: { [key: number]: exercise[] },
      activeWeek: number,
      setWeekExercises: (value: { [key: number]: exercise[] } | ((prev: { [key: number]: exercise[] }) => { [key: number]: exercise[] })) => void
    }
  ) {
    const { setIsExerciseModalOpen, setIsAdvancedSearchOpen } = modalControls;
    const [editingExercise, setEditingExercise] = useState<exercise | undefined>();
    const [selectedExerciseName, setSelectedExerciseName] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<exercise | undefined>();

    const handleAddExercise = () => {
        setEditingExercise(undefined);
        setSelectedExerciseName('');
        setIsExerciseModalOpen(true);
    };

    let tempIdCounter = 1;
    
    const handleExerciseSelect = (exercise: ExerciseTraits) => {
      const base_exercise = {
        id: -(tempIdCounter++),  // Negative to avoid conflicts with real DB IDs
        exercise_id: exercise.libraryId || exercise.id,  // Use libraryId for library exercises, id for user exercises
        name: exercise.label || '',
        pairing: get_next_pairing(weekExercises[activeWeek] || []),
        sets: 3,
        is_varied_sets: false,
        is_advanced_sets: false,
        planned_sets: [{
          set_number: 1,
          planned_reps: 10,
          planned_load: 0,
          load_unit: userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || default_load_unit,
          planned_rest: 60,
          planned_tempo: '2010'
        }],
        notes: '',
        source: exercise.source as 'exercise_library' | 'user_exercises'
      };
    
      setSelectedExercise(create_planned_exercise(base_exercise));
      setIsAdvancedSearchOpen(false);
    };

    const handleAdvancedSearchSelect = (exercise: ExerciseTraits) => {
      const transformed_exercise = transform_to_regular_exercise(exercise, userSettings, () => get_next_pairing(weekExercises[activeWeek] || []));
      setSelectedExerciseName(exercise.data.name);
      setEditingExercise(transformed_exercise);
      setIsExerciseModalOpen(true);
    };

    const handleEditExercise = (id: number) => {
      const exercise = weekExercises[activeWeek]?.find(ex => ex.id === id);
      if (exercise && !exercise.is_varied_sets) {
        setEditingExercise(create_planned_exercise({
          ...exercise,
          id
        }));
        setSelectedExerciseName(exercise.name);
        setIsExerciseModalOpen(true);
      }
    };

    const handleSaveExercise = async (formatted_exercise: exercise): Promise<void> => {
    
      const exercise_data = formatted_exercise.is_varied_sets 
        ? create_varied_exercise({
            id: formatted_exercise.id,
            exercise_id: formatted_exercise.exercise_id,
            name: formatted_exercise.name,
            source: formatted_exercise.source
          }, (formatted_exercise as varied_exercise).set_details || [])
        : create_planned_exercise({
            id: formatted_exercise.id,
            exercise_id: formatted_exercise.exercise_id,
            name: formatted_exercise.name,
            source: formatted_exercise.source
          });
    
      // Add additional properties after creation
      if (!exercise_data.is_varied_sets && 'planned_sets' in formatted_exercise) {
        const planned_exercise_data = exercise_data as planned_exercise;
        Object.assign(planned_exercise_data, {
          pairing: formatted_exercise.pairing,
          planned_sets: (formatted_exercise as planned_exercise).planned_sets?.map((set: planned_exercise_set) => ({
            set_number: set.set_number,
            planned_reps: set.planned_reps,
            planned_load: set.planned_load,
            load_unit: set.load_unit,
            planned_rest: set.planned_rest,
            planned_tempo: set.planned_tempo,
            rpe: set.rpe,
            rir: set.rir,
            notes: set.notes
          })),
          sets: (formatted_exercise as planned_exercise).planned_sets?.length || 0,
          notes: formatted_exercise.notes
        });
      } else {
        Object.assign(exercise_data as varied_exercise, {
          pairing: formatted_exercise.pairing,
          notes: formatted_exercise.notes
        });
      }
    
      setWeekExercises((prev: { [key: number]: exercise[] }) => {
        const new_week_exercises = { ...prev };
        if (editingExercise) {
          Object.keys(new_week_exercises).forEach(weekNum => {
            new_week_exercises[Number(weekNum)] = new_week_exercises[Number(weekNum)]?.map(ex =>
              ex.id === exercise_data.id ? exercise_data : ex
            ) || [];
          });
        } else {
          if (!new_week_exercises[activeWeek]) {
            new_week_exercises[activeWeek] = [];
          }
          new_week_exercises[activeWeek] = [...new_week_exercises[activeWeek], exercise_data];
        }
        return new_week_exercises;
      });
    
      modalControls.setIsExerciseModalOpen(false);
    };

    const handleDeleteExercise = (id: number) => {
      setWeekExercises(prev => {
        const new_week_exercises = { ...prev };
        Object.keys(new_week_exercises).forEach(week => {
          new_week_exercises[Number(week)] = new_week_exercises[Number(week)]?.filter(
            ex => ex.id !== id
          ) || [];
        });
        return new_week_exercises;
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
      handleAdvancedSearchSelect,
      handleEditExercise,
      handleSaveExercise,
      handleDeleteExercise
    };
}