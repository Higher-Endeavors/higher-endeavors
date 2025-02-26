import { Program } from '@/app/lib/types/pillars/fitness';
import { calculateProgressedExercises } from '../utils/exerciseProgression';

interface UseWeekManagementProps {
  program: Program;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
  setWeekExercises: (exercises: any) => void;
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
    setWeekExercises(prev => 
      calculateProgressedExercises(weekNumber, prev, program?.progressionRules)
    );
  };

  return {
    handleWeekChange,
    applyProgressionToWeek
  };
}