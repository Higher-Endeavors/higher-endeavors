import { SetStateAction } from 'react';
import { Program, Exercise, WeekExercise, ProgressionRules } from '@/app/lib/types/pillars/fitness';
import { calculateProgressedExercises } from '@/app/lib/utils/fitness/resistance-training/exerciseProgression';

interface UseWeekManagementProps {
  program: Program;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
  setWeekExercises: (value: SetStateAction<{ [key: number]: Exercise[] }>) => void;
}

export function useWeekManagement({
  program,
  activeWeek,
  setActiveWeek,
  setWeekExercises
}: UseWeekManagementProps) {
  const handleWeekChange = (weekNumber: number) => {
    const settings = program?.progressionRules?.settings;
    if (!settings) return;
    
    const programLength = settings.programLength || 4;
    if (weekNumber < 1 || weekNumber > programLength) return;
    
    setActiveWeek(weekNumber);
  };

  const applyProgressionToWeek = (weekNumber: number) => {
    setWeekExercises((prev: { [key: number]: Exercise[] }) => {
      const exercisesWithWeek = Object.fromEntries(
        Object.entries(prev).map(([week, exercises]) => [
          week,
          exercises.map(ex => ({
            ...ex,
            weekNumber: parseInt(week),
            baseExerciseId: ex.id,
            weekSpecificId: ex.id
          }))
        ])
      );
      return calculateProgressedExercises(weekNumber, exercisesWithWeek, program?.progressionRules as ProgressionRules) as { [key: number]: Exercise[] };
    });
  };

  return {
    handleWeekChange,
    applyProgressionToWeek
  };
}