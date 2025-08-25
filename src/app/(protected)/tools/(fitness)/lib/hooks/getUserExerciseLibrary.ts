import { ExerciseLibraryItem } from '../../resistance-training/types/resistance-training.zod';

export async function getUserExerciseLibrary(userId: number, targetUserId?: number): Promise<ExerciseLibraryItem[]> {
  // Use targetUserId if provided (for admin access), otherwise use the current userId
  const effectiveUserId = targetUserId || userId;
  
  const res = await fetch(`http://localhost:3000/api/user-exercise-library?user_id=${effectiveUserId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user exercise library: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format: expected an array');
  }
  
  return data.map((exercise: any) => ({
    userExerciseLibraryId: exercise.user_exercise_library_id,
    name: exercise.name,
    source: 'user',
    // Add user attribution for admin clarity when viewing other users' exercises
    createdByUserId: exercise.user_id,
    createdByUserName: exercise.user_name || exercise.email || 'Unknown User'
  }));
} 