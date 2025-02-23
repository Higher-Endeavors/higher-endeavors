import type { Exercise, WeekExercise } from '@/app/lib/types/pillars/fitness';

/**
 * Transforms a base exercise into a week-specific exercise
 * @param baseExercise The original exercise
 * @param weekNumber The week number this exercise belongs to
 * @returns WeekExercise with week-specific properties
 */

// Temporary implementation until we connect to database
const generateWeekSpecificId = (): number => {
    return Math.floor(Math.random() * 1000000);  // Generates random ID between 0-999999
  };

export const createWeekExercise = (baseExercise: Exercise, weekNumber: number): WeekExercise => ({
    ...baseExercise,
    weekNumber,
    baseExerciseId: baseExercise.id,
    weekSpecificId: generateWeekSpecificId()
  });