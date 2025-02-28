/**
 * Global utility functions for generating consistent IDs across the application
 */

export const generateWeekExerciseId = (baseExerciseId: number, weekNumber: number): number => {
    return baseExerciseId * 100 + weekNumber;
  };
  
  export const generateTempExerciseId = (): number => {
    return -Math.floor(Math.random() * 100000); // Negative to avoid conflicts with DB IDs
  };
  
  export const parseWeekExerciseId = (weekExerciseId: number): { baseExerciseId: number; weekNumber: number } => {
    return {
      baseExerciseId: Math.floor(weekExerciseId / 100),
      weekNumber: weekExerciseId % 100
    };
  };