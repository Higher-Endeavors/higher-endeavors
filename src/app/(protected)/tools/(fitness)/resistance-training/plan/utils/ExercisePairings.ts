import type { exercise, exercise_source } from '@/app/lib/types/pillars/fitness/exercise.types';
import { create_exercise } from '@/app/lib/types/pillars/fitness/exercise.types';

export const create_exercise_with_pairing = (
  exercise: exercise, 
  new_pairing: string
): exercise => {
  const base_exercise = {
    id: exercise.id,
    exercise_id: exercise.exercise_id,
    name: exercise.name || '',
    source: exercise.source
  } as const;

  return create_exercise(base_exercise, exercise.is_varied_sets, exercise.is_advanced_sets, exercise.planned_sets);
};

/**
 * Updates exercise pairings to maintain correct grouping (A1, A2, B1, B2, etc.)
 * @param exercises Array of exercises to update pairings for
 * @returns Updated array of exercises with correct pairings
 */
export const update_pairings = (exercises: exercise[]): exercise[] => {
  let current_group = 'A';
  let current_number = 1;

  return exercises.map((exercise, index): exercise => {
    if (exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')) {
      return exercise;
    }

    if (index === 0 || (exercises[index - 1].pairing.charAt(0) !== current_group)) {
      if (index > 0) {
        current_group = String.fromCharCode(current_group.charCodeAt(0) + 1);
      }
      current_number = 1;
    }

    const new_pairing = `${current_group}${current_number}`;
    current_number = current_number === 1 ? 2 : 1;

    return { ...exercise, pairing: new_pairing };
  });
};

/**
 * Determines the next pairing (A1, A2, B1, etc.) based on existing exercises
 * @param exercises Array of existing exercises
 * @returns Next pairing string
 */
export const get_next_pairing = (exercises: exercise[]): string => {
  // Filter out warm-up and cool-down exercises
  const filtered_exercises = exercises.filter(
    ex => !ex.pairing?.startsWith('WU') && !ex.pairing?.startsWith('CD')
  );

  if (filtered_exercises.length === 0) return 'A1';

  const last_exercise = filtered_exercises[filtered_exercises.length - 1];
  const letter = last_exercise.pairing.charAt(0);
  const number = parseInt(last_exercise.pairing.charAt(1));

  return number === 1 
    ? `${letter}2` 
    : `${String.fromCharCode(letter.charCodeAt(0) + 1)}1`;
};