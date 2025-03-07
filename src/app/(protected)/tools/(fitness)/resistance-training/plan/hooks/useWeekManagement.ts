import { SetStateAction } from 'react';
import { 
  program, 
  exercise, 
  progression_rules 
} from '@/app/lib/types/pillars/fitness';
import { calculate_progressed_exercises } from '@/app/lib/utils/fitness/resistance-training/exerciseProgression';

interface UseWeekManagementProps {
  program: program;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
  setWeekExercises: (value: SetStateAction<{ [key: number]: exercise[] }>) => void;
}

export function useWeekManagement({
  program: program_data,
  activeWeek,
  setActiveWeek,
  setWeekExercises
}: UseWeekManagementProps) {
  const handleWeekChange = (week_number: number) => {
    const settings = program_data?.progression_rules?.settings;
    if (!settings) return;
    
    const program_length = settings.program_length || 4;
    if (week_number < 1 || week_number > program_length) return;
    
    setActiveWeek(week_number);
  };

  const applyProgressionToWeek = (week_number: number) => {
    setWeekExercises((prev: { [key: number]: exercise[] }) => {
      return calculate_progressed_exercises(
        week_number, 
        prev, 
        program_data?.progression_rules as progression_rules
      ) as { [key: number]: exercise[] };
    });
  };

  return {
    handleWeekChange,
    applyProgressionToWeek
  };
}