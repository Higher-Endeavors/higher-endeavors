import type { 
  exercise,
  week_exercise, 
  ExerciseOption, 
  planned_exercise_set, 
  program, 
  varied_exercise, 
  planned_exercise,
  exercise_source
} from '@/app/lib/types/pillars/fitness';
import type { UserSettings } from '@/app/lib/types/user_settings';

/**
 * Transforms a base exercise into a week-specific exercise
 * @param base_exercise The original exercise
 * @param week_number The week number this exercise belongs to
 * @returns week_exercise with week-specific properties
 */

// Temporary implementation until we connect to database
const generate_week_specific_id = (): number => {
    return Math.floor(Math.random() * 1000000);  // Generates random ID between 0-999999
};

export const create_week_exercise = (base_exercise: exercise, week_number: number): week_exercise => ({
    ...base_exercise,
    week_number,
    base_exercise_id: base_exercise.id as number,
    week_specific_id: generate_week_specific_id()
});

/**
 * Transforms an ExerciseOption into a regular exercise with default values
 * @param exercise The exercise option to transform
 * @param user_settings User settings for default values
 * @param get_next_pairing Function to get the next pairing value
 * @returns A regular exercise with default values
 */
export const transform_to_regular_exercise = (
    exercise: ExerciseOption, 
    user_settings: UserSettings | null,
    get_next_pairing: () => string
): exercise => {
    const load_unit = user_settings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'kg';
    return {
        id: exercise.data.id,
        exercise_id: exercise.libraryId || exercise.id,
        name: exercise.data.name,
        pairing: get_next_pairing(),
        sets: 3,
        is_varied_sets: false,
        is_advanced_sets: false,
        source: exercise.data.source === 'library' ? 'exercise_library' : 'user_exercises',
        notes: '',
        planned_sets: [{
            set_number: 1,
            planned_reps: 10,
            planned_load: 0,
            load_unit: load_unit,
            planned_rest: 60,
            planned_tempo: '2010'
        }]
    };
};

/**
 * Transforms an exercise for saving, handling both varied and regular sets
 * @param exercise The exercise to transform
 * @param index The order index of the exercise
 * @returns The transformed exercise ready for saving
 */
export const transform_exercise_for_save = (exercise: exercise, index: number) => {
  if (exercise.is_varied_sets) {
    const varied_exercise = exercise as varied_exercise;
    return {
      ...exercise,
      order_index: index,
      sets: varied_exercise.set_details.map((set: planned_exercise_set) => ({
        set_number: set.set_number,
        reps: set.planned_reps,
        load: set.planned_load,
        load_unit: set.load_unit,
        tempo: set.planned_tempo,
        rest: set.planned_rest,
        notes: set.notes
      }))
    };
  }
    
  // For regular exercises, omit the varied set properties
  const { is_varied_sets, is_advanced_sets, ...base_exercise } = exercise;
  return {
    ...base_exercise,
    order_index: index
  };
};

export const transform_week_exercises = (
  week_exercises: { [key: number]: exercise[] },
  program_length: number = 4
) => {
  const weeks = [];
  for (let i = 1; i <= program_length; i++) {
    if (week_exercises[i]) {
      weeks.push({
        id: 0,
        resistance_program_id: 0,
        week_number: i,
        notes: '',
        created_at: new Date(),
        updated_at: new Date(),
        days: [{
          id: 0,
          program_week_id: 0,
          day_number: 1,
          day_name: `Day ${1}`,
          notes: '',
          exercises: week_exercises[i].map((exercise, index) => ({
            order_index: index,
            exercise_source: exercise.source === 'exercise_library' ? 'library' : 'user' as exercise_source,
            exercise_library_id: exercise.source === 'exercise_library' ? exercise.exercise_id : null,
            user_exercise_id: exercise.source === 'user_exercises' ? exercise.exercise_id : null,
            custom_exercise_name: exercise.name,
            pairing: exercise.pairing,
            notes: exercise.notes,
            sets: exercise.is_varied_sets 
              ? (exercise as varied_exercise).set_details.map((set: planned_exercise_set) => ({
                  set_number: set.set_number,
                  planned_reps: set.planned_reps,
                  planned_load: set.planned_load,
                  load_unit: set.load_unit,
                  planned_rest: set.planned_rest,
                  planned_tempo: set.planned_tempo
                }))
              : (exercise as planned_exercise).planned_sets?.map((set: planned_exercise_set, set_index: number) => ({
                  set_number: set_index + 1,
                  planned_reps: set.planned_reps,
                  planned_load: set.planned_load,
                  load_unit: set.load_unit,
                  planned_rest: set.planned_rest,
                  planned_tempo: set.planned_tempo
                })) || []
          }))
        }]
      });
    }
  }
  return weeks;
};