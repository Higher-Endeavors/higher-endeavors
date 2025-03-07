import { 
  exercise, 
  program,
  progression_rules
} from '@/app/lib/types/pillars/fitness';
import { calculate_progressed_exercises } from '@/app/lib/utils/fitness/resistance-training/exerciseProgression';

interface UseWeekExerciseManagementProps {
  program: program;
  activeWeek: number;
  setWeekExercises: (exercises: { [key: number]: exercise[] } | ((prev: { [key: number]: exercise[] }) => { [key: number]: exercise[] })) => void;
}

export function useWeekExerciseManagement({
  program: program_data,
  activeWeek,
  setWeekExercises
}: UseWeekExerciseManagementProps) {
  const handleWeekExercisesChange = (exercises: exercise[]) => {
    setWeekExercises(prev => {
      const new_week_exercises = { ...prev };
      
      if (activeWeek === 1) {
        // Set week 1 exercises
        new_week_exercises[1] = exercises;
        
        const program_length = program_data.progression_rules?.settings?.program_length ?? 4;

        // Generate exercises for subsequent weeks using calculate_progressed_exercises
        for (let week = 2; week <= program_length; week++) {
          const week_exercises = calculate_progressed_exercises(
            week,
            { [week - 1]: new_week_exercises[week - 1] },
            program_data.progression_rules as progression_rules
          )[week];

          // Ensure unique IDs for each week's exercises
          new_week_exercises[week] = week_exercises.map(exercise => ({
            ...exercise,
            id: exercise.id * 100 + week
          }));
        }
      } else {
        new_week_exercises[activeWeek] = exercises;
      }
      
      return new_week_exercises;
    });
  };

  return {
    handleWeekExercisesChange
  };
}