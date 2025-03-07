import { 
  exercise,
  progression_rules,
  exercise_set
} from '@/app/lib/types/pillars/fitness';

/**
 * Calculates progressed exercises for a given week based on progression rules
 * @param week_number The week number to calculate progression for
 * @param week_exercises Object containing exercises for each week
 * @param progression_rules Optional rules for progression calculation
 * @returns Updated week exercises with progression applied
 */
export function calculate_progressed_exercises(
  week_number: number,
  week_exercises: { [key: number]: exercise[] },
  progression_rules?: progression_rules
): { [key: number]: exercise[] } {
  const settings = progression_rules?.settings;
  if (!settings) return week_exercises;

  const volume_increment = settings.volume_increment_percentage || 0;
  const load_increment = settings.load_increment_percentage || 0;
  const weekly_volume_percentages = settings.weekly_volume_percentages || [100, 100, 100, 100];
  const periodization_type = progression_rules?.type || 'Linear';

  const current_week_exercises = week_exercises[week_number] || [];
  
  return {
    ...week_exercises,
    [week_number]: current_week_exercises.map(exercise => {
      // Create a new exercise object with updated sets
      return {
        ...exercise,
        planned_sets: exercise.planned_sets.map((set: exercise_set) => {
          let updated_set: exercise_set;

          if (periodization_type === 'Linear') {
            // Apply linear progression with cumulative weekly increases
            updated_set = {
              ...set,
              planned_reps: Math.max(1, Math.round(set.planned_reps * (1 + (volume_increment * (week_number - 1) / 100)))),
              planned_load: typeof set.planned_load === 'number'
                ? Math.round(set.planned_load * (1 + (load_increment * (week_number - 1) / 100) * 100)) / 100
                : set.planned_load
            };
          } else if (periodization_type === 'Undulating') {
            // Apply undulating progression based on weekly volume percentages
            const week_percentage = weekly_volume_percentages[week_number - 1] ?? 100;
            const volume_percentage = week_percentage / 100;
            
            updated_set = {
              ...set,
              planned_reps: Math.max(1, Math.round(set.planned_reps * volume_percentage))
            };
          } else {
            // For other types, maintain the same values
            updated_set = { ...set };
          }

          // Handle sub-sets if they exist
          if (set.sub_sets) {
            updated_set.sub_sets = set.sub_sets.map(sub_set => {
              if (periodization_type === 'Linear') {
                return {
                  ...sub_set,
                  planned_reps: Math.max(1, Math.round(sub_set.planned_reps * (1 + (volume_increment * (week_number - 1) / 100)))),
                  planned_load: typeof sub_set.planned_load === 'number'
                    ? Math.round(sub_set.planned_load * (1 + (load_increment * (week_number - 1) / 100) * 100)) / 100
                    : sub_set.planned_load
                };
              } else if (periodization_type === 'Undulating') {
                const week_percentage = weekly_volume_percentages[week_number - 1] ?? 100;
                const volume_percentage = week_percentage / 100;
                
                return {
                  ...sub_set,
                  planned_reps: Math.max(1, Math.round(sub_set.planned_reps * volume_percentage))
                };
              }
              return sub_set;
            });
          }

          return updated_set;
        })
      };
    })
  };
}