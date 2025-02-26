import { Exercise, ProgressionRules, WeekExercise, PlannedExercise, VariedExercise } from '@/app/lib/types/pillars/fitness';

export function calculateProgressedExercises(
  weekNumber: number,
  weekExercises: { [key: number]: (Exercise & WeekExercise)[] },
  progressionRules?: ProgressionRules
): { [key: number]: (Exercise & WeekExercise)[] } {
  const settings = progressionRules?.settings;
  if (!settings) return weekExercises;

  const volumeIncrement = settings.volumeIncrementPercentage || 0;
  const loadIncrement = settings.loadIncrementPercentage || 0;

  const currentWeekExercises = weekExercises[weekNumber] || [];
  return {
    ...weekExercises,
    [weekNumber]: currentWeekExercises.map(exercise => {
      if (exercise.isVariedSets) {
        const variedExercise = exercise as VariedExercise & WeekExercise;
        return {
          ...exercise,
          setDetails: variedExercise.setDetails.map(set => ({
            ...set,
            plannedReps: Math.round(set.plannedReps * (1 + volumeIncrement / 100)),
            plannedLoad: typeof set.plannedLoad === 'number'
              ? Math.round(set.plannedLoad * (1 + loadIncrement / 100) * 100) / 100
              : set.plannedLoad
          }))
        };
      } else {
        const plannedExercise = exercise as PlannedExercise & WeekExercise;
        return {
          ...exercise,
          plannedSets: plannedExercise.plannedSets?.map(set => ({
            ...set,
            plannedReps: Math.round(set.plannedReps * (1 + volumeIncrement / 100)),
            plannedLoad: typeof set.plannedLoad === 'number'
              ? Math.round(set.plannedLoad * (1 + loadIncrement / 100) * 100) / 100
              : set.plannedLoad
          }))
        };
      }
    })
  };
}