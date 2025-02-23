import type { Exercise, VariedExercise, ExerciseSource } from '@/app/lib/types/pillars/fitness';
import { createPlannedExercise, createVariedExercise } from '@/app/lib/types/pillars/fitness';

export const createExerciseWithPairing = (
  exercise: Exercise, 
  newPairing: string
): Exercise => {
  const baseExercise = {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    name: exercise.name || '',
    source: exercise.source as ExerciseSource
  };

  return !exercise.isVariedSets 
    ? createPlannedExercise({ ...baseExercise })
    : createVariedExercise(baseExercise, (exercise as VariedExercise).setDetails);
};

/**
 * Updates exercise pairings to maintain correct grouping (A1, A2, B1, B2, etc.)
 * @param exercises Array of exercises to update pairings for
 * @returns Updated array of exercises with correct pairings
 */
export const updatePairings = (exercises: Exercise[]): Exercise[] => {
  let currentGroup = 'A';
  let currentNumber = 1;

  return exercises.map((exercise, index): Exercise => {
    if (exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')) {
      return exercise;
    }

    if (index === 0 || (exercises[index - 1].pairing.charAt(0) !== currentGroup)) {
      if (index > 0) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
      }
      currentNumber = 1;
    }

    const newPairing = `${currentGroup}${currentNumber}`;
    currentNumber = currentNumber === 1 ? 2 : 1;

    return { ...exercise, pairing: newPairing };
  });
};

/**
 * Determines the next pairing (A1, A2, B1, etc.) based on existing exercises
 * @param exercises Array of existing exercises
 * @returns Next pairing string
 */
export const getNextPairing = (exercises: Exercise[]): string => {
  // Filter out warm-up and cool-down exercises
  const filteredExercises = exercises.filter(
    ex => !ex.pairing?.startsWith('WU') && !ex.pairing?.startsWith('CD')
  );

  if (filteredExercises.length === 0) return 'A1';

  const lastExercise = filteredExercises[filteredExercises.length - 1];
  const letter = lastExercise.pairing.charAt(0);
  const number = parseInt(lastExercise.pairing.charAt(1));

  return number === 1 
    ? `${letter}2` 
    : `${String.fromCharCode(letter.charCodeAt(0) + 1)}1`;
};