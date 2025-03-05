import { exercise } from '@/app/lib/types/pillars/fitness';

/**
 * API calls for exercise management
 */
export const exercise_service = {
  // Create a user exercise
  create: async (exercise_name: string): Promise<exercise> => {
    const response = await fetch('/api/user-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create exercise');
    }
    return response.json();
  },

  // Fetch all exercises
  fetch_all: async (): Promise<exercise[]> => {
    const response = await fetch('/api/exercises');
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }
    return response.json();
  }
};