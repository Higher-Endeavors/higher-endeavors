import { CMEActivityLibraryItem } from '../../../cardiometabolic-training/types/cme-training.zod';
import { ExerciseLibraryItem } from '../../types/resistance-training.zod';

/**
 * Transforms CME activities to match ExerciseLibraryItem format for compatibility
 * with the resistance training system
 */
export function transformCMEActivitiesToExerciseLibrary(
  cmeActivities: CMEActivityLibraryItem[]
): ExerciseLibraryItem[] {
  return cmeActivities.map(activity => ({
    exerciseLibraryId: activity.cme_activity_library_id,
    name: activity.name,
    source: 'library' as const, // Map cme_library to library for compatibility
    exercise_family: activity.activity_family || undefined,
    // Add equipment information for enhanced matching
    equipment: activity.equipment || undefined,
    // Add other required fields with appropriate defaults
    difficulty: undefined,
    muscleGroup: undefined,
    exercise_family_id: undefined,
  }));
} 