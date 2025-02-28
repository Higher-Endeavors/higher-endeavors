import { Exercise, Program, PlannedExercise, PlannedExerciseSet } from '@/app/lib/types/pillars/fitness';
import { applyLinearProgression } from '@/app/lib/types/pillars/fitness';

interface UseWeekExerciseManagementProps {
  program: Program;
  activeWeek: number;
  setWeekExercises: (exercises: { [key: number]: Exercise[] } | ((prev: { [key: number]: Exercise[] }) => { [key: number]: Exercise[] })) => void;
}

export function useWeekExerciseManagement({
  program,
  activeWeek,
  setWeekExercises
}: UseWeekExerciseManagementProps) {
  const handleWeekExercisesChange = (exercises: Exercise[]) => {
    setWeekExercises(prev => {
      const newWeekExercises = { ...prev };
      
      if (activeWeek === 1) {
        newWeekExercises[1] = exercises;
        
        const programLength = program.progressionRules?.settings?.programLength ?? 4;
        const weeklyVolumePercentages = program.progressionRules?.settings?.weeklyVolumePercentages ?? [100, 100, 100, 100];

        for (let week = 2; week <= programLength; week++) {
          if (program.periodizationType === 'Linear') {
            newWeekExercises[week] = exercises.map(exercise => ({
              ...applyLinearProgression(
                exercise,
                week,
                program.progressionRules?.settings?.volumeIncrementPercentage ?? 0,
                program.progressionRules?.settings?.loadIncrementPercentage ?? 0
              ),
              id: exercise.id * 100 + week // Generate unique numeric ID
            }));
          } else if (program.periodizationType === 'Undulating') {
            const weekPercentage = weeklyVolumePercentages[week - 1] ?? 100;
            newWeekExercises[week] = exercises.map(exercise => {
              const volumePercentage = weekPercentage / 100;
              const plannedExercise = exercise as PlannedExercise;
              const newReps = Math.max(1, Math.round((plannedExercise.plannedSets?.[0]?.plannedReps || 10) * volumePercentage));
              return {
                ...exercise,
                id: exercise.id * 100 + week, // Generate unique numeric ID
                plannedSets: plannedExercise.plannedSets?.map((set: PlannedExerciseSet) => ({
                  ...set,
                  plannedReps: newReps
                }))
              };
            });
          } else {
            newWeekExercises[week] = exercises.map(exercise => ({
              ...exercise,
              id: exercise.id * 100 + week // Generate unique numeric ID
            }));
          }
        }
      } else {
        newWeekExercises[activeWeek] = exercises;
      }
      
      return newWeekExercises;
    });
  };

  return {
    handleWeekExercisesChange
  };
}