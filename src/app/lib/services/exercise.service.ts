import { Exercise } from '@/app/lib/types/pillars/fitness';

/**
 * API calls for exercise management
 */
export const exerciseService = {
  // Create a user exercise
  create: async (exerciseName: string): Promise<Exercise> => {
    const response = await fetch('/api/user-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_name: exerciseName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create exercise');
    }
    return response.json();
  },

  // Fetch all exercises
  fetchAll: async (): Promise<Exercise[]> => {
    const response = await fetch('/api/exercises');
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }
    return response.json();
  }
};