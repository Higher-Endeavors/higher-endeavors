import { 
  exercise, 
  program, 
  planned_exercise, 
  planned_exercise_set 
} from '@/app/lib/types/pillars/fitness';
import { apply_linear_progression } from '@/app/lib/types/pillars/fitness';

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
        new_week_exercises[1] = exercises;
        
        const program_length = program_data.progression_rules?.settings?.program_length ?? 4;
        const weekly_volume_percentages = program_data.progression_rules?.settings?.weekly_volume_percentages ?? [100, 100, 100, 100];

        for (let week = 2; week <= program_length; week++) {
          if (program_data.periodization_type === 'Linear') {
            new_week_exercises[week] = exercises.map(exercise => ({
              ...apply_linear_progression(
                exercise,
                week,
                program_data.progression_rules?.settings?.volume_increment_percentage ?? 0,
                program_data.progression_rules?.settings?.load_increment_percentage ?? 0
              ),
              id: exercise.id * 100 + week // Generate unique numeric ID
            }));
          } else if (program_data.periodization_type === 'Undulating') {
            const week_percentage = weekly_volume_percentages[week - 1] ?? 100;
            new_week_exercises[week] = exercises.map(exercise => {
              const volume_percentage = week_percentage / 100;
              const planned_exercise_data = exercise as planned_exercise;
              const new_reps = Math.max(1, Math.round((planned_exercise_data.planned_sets?.[0]?.planned_reps || 10) * volume_percentage));
              return {
                ...exercise,
                id: exercise.id * 100 + week, // Generate unique numeric ID
                planned_sets: planned_exercise_data.planned_sets?.map((set: planned_exercise_set) => ({
                  ...set,
                  planned_reps: new_reps
                }))
              };
            });
          } else {
            new_week_exercises[week] = exercises.map(exercise => ({
              ...exercise,
              id: exercise.id * 100 + week // Generate unique numeric ID
            }));
          }
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