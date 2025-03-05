import { 
  exercise, 
  progression_rules, 
  week_exercise, 
  planned_exercise, 
  varied_exercise,
  planned_exercise_set 
} from '@/app/lib/types/pillars/fitness';

export function calculate_progressed_exercises(
  week_number: number,
  week_exercises: { [key: number]: (exercise & week_exercise)[] },
  progression_rules?: progression_rules
): { [key: number]: (exercise & week_exercise)[] } {
  const settings = progression_rules?.settings;
  if (!settings) return week_exercises;

  const volume_increment = settings.volume_increment_percentage || 0;
  const load_increment = settings.load_increment_percentage || 0;

  const current_week_exercises = week_exercises[week_number] || [];
  return {
    ...week_exercises,
    [week_number]: current_week_exercises.map(exercise => {
      if (exercise.is_varied_sets) {
        const varied_exercise_instance = exercise as varied_exercise & week_exercise;
        return {
          ...exercise,
          set_details: varied_exercise_instance.set_details.map((set: planned_exercise_set) => ({
            ...set,
            planned_reps: Math.round(set.planned_reps * (1 + volume_increment / 100)),
            planned_load: typeof set.planned_load === 'number'
              ? Math.round(set.planned_load * (1 + load_increment / 100) * 100) / 100
              : set.planned_load
          }))
        };
      } else {
        const planned_exercise_instance = exercise as planned_exercise & week_exercise;
        return {
          ...exercise,
          planned_sets: planned_exercise_instance.planned_sets?.map((set: planned_exercise_set) => ({
            ...set,
            planned_reps: Math.round(set.planned_reps * (1 + volume_increment / 100)),
            planned_load: typeof set.planned_load === 'number'
              ? Math.round(set.planned_load * (1 + load_increment / 100) * 100) / 100
              : set.planned_load
          }))
        };
      }
    })
  };
}