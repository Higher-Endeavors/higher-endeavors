import { useState } from 'react';
import { Program, PeriodizationType, Exercise } from '@/app/lib/types/pillars/fitness';
import { DEFAULT_PROGRAM } from '../components/program-defaults';

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
  })
  const [weekExercises, setWeekExercises] = useState<{ [key: number]: Exercise[] }>({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeExercise, setActiveExercise] = useState<Exercise | undefined>();;

  return {
    program, setProgram,
    weekExercises, setWeekExercises,
    activeWeek, setActiveWeek,
    activeExercise, setActiveExercise
  };
}