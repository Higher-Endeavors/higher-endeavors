'use server';
import { revalidatePath } from 'next/cache';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function addCustomExercise(formData: FormData) {
  const exerciseName = formData.get('exercise_name');
  const userId = formData.get('user_id');

  if (!exerciseName || !userId) {
    return { error: 'Missing exercise name or user ID' };
  }

  // Check for duplicate
  const existing = await SingleQuery(
    'SELECT user_exercise_library_id FROM resist_user_exercise_library WHERE user_id = $1 AND exercise_name = $2',
    [userId, exerciseName]
  );
  if (existing.rows.length > 0) {
    return { error: 'Exercise already exists' };
  }

  // Insert new exercise
  const result = await SingleQuery(
    'INSERT INTO resist_user_exercise_library (user_id, exercise_name) VALUES ($1, $2) RETURNING user_exercise_library_id, exercise_name',
    [userId, exerciseName]
  );

  revalidatePath('/tools/resistance-training');
  return result.rows[0];
} 