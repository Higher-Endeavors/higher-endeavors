import { useState, useEffect } from 'react';
import { 
  program, 
  PeriodizationType, 
  exercise, 
  week_exercise,
  apply_linear_progression 
} from '@/app/lib/types/pillars/fitness';
import { default_program } from '@/app/lib/constants/ProgramDefaults';

export function useProgramState() {
  const [program_data, setProgram] = useState<program>({
    ...default_program,
    progression_rules: {
      type: PeriodizationType.Linear,
      settings: {
        volume_increment_percentage: 0,
        load_increment_percentage: 0,
        program_length: 4,
        weekly_volume_percentages: [100, 80, 90, 60]
      }
    }
  });

  const [weekExercises, setWeekExercises] = useState<{ [key: number]: exercise[] }>({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeExercise, setActiveExercise] = useState<exercise | undefined>();

  useEffect(() => {
    if (!program_data) return;

    setWeekExercises((prev_week_exercises) => {
      // If there are no exercises for the active week, return the current state
      if (!prev_week_exercises[activeWeek]) {
        return prev_week_exercises;
      }

      // Get the current week's exercises
      const current_week_exercises = prev_week_exercises[activeWeek];
      
      // Apply progression if needed
      const updated_exercises = current_week_exercises.map((exercise: exercise) => {
        if (program_data.periodization_type === 'Linear' && program_data.progression_rules?.settings) {
          return apply_linear_progression(
            exercise,
            activeWeek,
            program_data.progression_rules.settings.volume_increment_percentage || 0,
            program_data.progression_rules.settings.load_increment_percentage || 0
          );
        }
        return exercise;
      });

      return {
        ...prev_week_exercises,
        [activeWeek]: updated_exercises
      };
    });
  }, [
    program_data?.periodization_type,
    program_data?.progression_rules?.settings?.program_length,
    program_data?.progression_rules?.settings?.volume_increment_percentage,
    program_data?.progression_rules?.settings?.load_increment_percentage,
    program_data?.progression_rules?.settings?.weekly_volume_percentages,
    activeWeek,
    program_data
  ]);

  return {
    program: program_data, 
    setProgram,
    weekExercises, 
    setWeekExercises,
    activeWeek, 
    setActiveWeek,
    activeExercise, 
    setActiveExercise
  };
}