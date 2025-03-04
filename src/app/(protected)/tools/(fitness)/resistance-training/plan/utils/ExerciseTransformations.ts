import type { Exercise, WeekExercise, ExerciseOption, PlannedExerciseSet, Program, VariedExercise, PlannedExercise } from '@/app/lib/types/pillars/fitness';
import type { UserSettings } from '@/app/lib/types/user_settings';

/**
 * Transforms a base exercise into a week-specific exercise
 * @param baseExercise The original exercise
 * @param weekNumber The week number this exercise belongs to
 * @returns WeekExercise with week-specific properties
 */

// Temporary implementation until we connect to database
const generateWeekSpecificId = (): number => {
    return Math.floor(Math.random() * 1000000);  // Generates random ID between 0-999999
};

export const createWeekExercise = (baseExercise: Exercise, weekNumber: number): WeekExercise => ({
    ...baseExercise,
    weekNumber,
    baseExerciseId: baseExercise.id as number,
    weekSpecificId: generateWeekSpecificId()
});

/**
 * Transforms an ExerciseOption into a RegularExercise with default values
 * @param exercise The exercise option to transform
 * @param userSettings User settings for default values
 * @param getNextPairing Function to get the next pairing value
 * @returns A RegularExercise with default values
 */
export const transformToRegularExercise = (
    exercise: ExerciseOption, 
    userSettings: UserSettings | null,
    getNextPairing: () => string
): Exercise => {
    const loadUnit = userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'kg';
    return {
        id: exercise.data.id,
        exerciseId: exercise.libraryId || exercise.id,
        name: exercise.data.name,
        pairing: getNextPairing(),
        sets: 3,
        isVariedSets: false,
        isAdvancedSets: false,
        source: exercise.data.source === 'library' ? 'exercise_library' : 'user_exercises',
        notes: '',
        plannedSets: [{
            setNumber: 1,
            plannedReps: 10,
            plannedLoad: 0,
            loadUnit: loadUnit,
            plannedRest: 60,
            plannedTempo: '2010'
        }]
    };
};

/**
 * Transforms an exercise for saving, handling both varied and regular sets
 * @param exercise The exercise to transform
 * @param index The order index of the exercise
 * @returns The transformed exercise ready for saving
 */
export const transformExerciseForSave = (exercise: Exercise, index: number) => {
  if (exercise.isVariedSets) {
    const variedExercise = exercise as VariedExercise;
    return {
      ...exercise,
      orderIndex: index,
      sets: variedExercise.setDetails.map((set: PlannedExerciseSet) => ({
        setNumber: set.setNumber,
        reps: set.plannedReps,
        load: set.plannedLoad,
        loadUnit: set.loadUnit,
        tempo: set.plannedTempo,
        rest: set.plannedRest,
        notes: set.notes
      }))
    };
  }
    
    // For regular exercises, omit the varied set properties
    const { isVariedSets, isAdvancedSets, ...baseExercise } = exercise;
    return {
      ...baseExercise,
      orderIndex: index
    };
  };

  export const transformWeekExercises = (
    weekExercises: { [key: number]: Exercise[] },
    programLength: number = 4
  ) => {
    const weeks = [];
    for (let i = 1; i <= programLength; i++) {
      if (weekExercises[i]) {
        weeks.push({
          id: 0,
          resistanceProgramId: 0,  // Changed from resistance_program_id
          weekNumber: i,           // Changed from week_number
          notes: '',
          createdAt: new Date(),   // Changed from created_at
          updatedAt: new Date(),   // Changed from updated_at
          days: [{
            id: 0,
            programWeekId: 0,      // Changed from program_week_id
            dayNumber: 1,          // Changed from day_number
            dayName: `Day ${1}`,   // Changed from day_name
            notes: '',
            exercises: weekExercises[i].map((exercise, index) => ({
              orderIndex: index,
              exerciseSource: exercise.source === 'exercise_library' ? 'library' : 'user',
              exerciseLibraryId: exercise.source === 'exercise_library' ? exercise.exerciseId : null,
              userExerciseId: exercise.source === 'user_exercises' ? exercise.exerciseId : null,
              customExerciseName: exercise.name,
              pairing: exercise.pairing,
              notes: exercise.notes,
              sets: exercise.isVariedSets 
                ? (exercise as VariedExercise).setDetails.map((set: PlannedExerciseSet) => ({
                    setNumber: set.setNumber,
                    plannedReps: set.plannedReps,
                    plannedLoad: set.plannedLoad,
                    loadUnit: set.loadUnit,
                    plannedRest: set.plannedRest,
                    plannedTempo: set.plannedTempo
                  }))
                : (exercise as PlannedExercise).plannedSets?.map((set: PlannedExerciseSet, setIndex) => ({
                    setNumber: setIndex + 1,
                    plannedReps: set.plannedReps,
                    plannedLoad: set.plannedLoad,
                    loadUnit: set.loadUnit,
                    plannedRest: set.plannedRest,
                    plannedTempo: set.plannedTempo
                  })) || []
            }))
          }]
        });
      }
    }
    return weeks;
  };