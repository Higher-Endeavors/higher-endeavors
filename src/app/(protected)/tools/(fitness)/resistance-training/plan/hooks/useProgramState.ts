import { useState, useEffect } from 'react';
import { Program, PeriodizationType, Exercise } from '@/app/lib/types/pillars/fitness';
import { DEFAULT_PROGRAM } from '../../../../../../lib/constants/ProgramDefaults';
import { applyLinearProgression } from '@/app/lib/types/pillars/fitness';

export function useProgramState() {
  const [program, setProgram] = useState<Program>({
    ...DEFAULT_PROGRAM,
    progressionRules: {
      type: PeriodizationType.Linear,
      settings: {
        volumeIncrementPercentage: 0,
        loadIncrementPercentage: 0,
        programLength: 4,
        weeklyVolumePercentages: [100, 80, 90, 60]
      }
    }
  });
  const [weekExercises, setWeekExercises] = useState<{ [key: number]: Exercise[] }>({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeExercise, setActiveExercise] = useState<Exercise | undefined>();

  useEffect(() => {
    if (!program) return;

    setWeekExercises((prevWeekExercises) => {
      // If there are no exercises for the active week, return the current state
      if (!prevWeekExercises[activeWeek]) {
        return prevWeekExercises;
      }

      // Get the current week's exercises
      const currentWeekExercises = prevWeekExercises[activeWeek];
      
      // Apply progression if needed
      const updatedExercises = currentWeekExercises.map((exercise: Exercise) => {
        if (program.periodizationType === 'Linear' && program.progressionRules?.settings) {
          return applyLinearProgression(
            exercise,
            activeWeek,
            program.progressionRules.settings.volumeIncrementPercentage || 0,
            program.progressionRules.settings.loadIncrementPercentage || 0
          );
        }
        return exercise;
      });

      return {
        ...prevWeekExercises,
        [activeWeek]: updatedExercises
      };
    });
  }, [
    program?.periodizationType,
    program?.progressionRules?.settings?.programLength,
    program?.progressionRules?.settings?.volumeIncrementPercentage,
    program?.progressionRules?.settings?.loadIncrementPercentage,
    program?.progressionRules?.settings?.weeklyVolumePercentages,
    activeWeek,
    program
  ]);

  return {
    program, setProgram,
    weekExercises, setWeekExercises,
    activeWeek, setActiveWeek,
    activeExercise, setActiveExercise
  };
}