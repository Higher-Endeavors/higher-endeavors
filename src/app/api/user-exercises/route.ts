import { NextResponse } from 'next/server';
import { getClient, SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const data = await request.json();
    const { exercise_name, user_id } = data;

    // Use provided user_id (admin) or session user id
    const effectiveUserId = user_id || session?.user?.id;
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!exercise_name) {
      return NextResponse.json({ error: 'Exercise name is required' }, { status: 400 });
    }

    // Check if exercise name already exists for this user
    const existing_exercise = await SingleQuery(
      `SELECT id FROM user_exercises WHERE user_id = $1 AND exercise_name = $2`,
      [effectiveUserId, exercise_name]
    );
    if (existing_exercise.rows.length > 0) {
      return NextResponse.json({ error: 'Exercise already exists' }, { status: 400 });
    }

    // Insert new exercise
    const result = await SingleQuery(
      `INSERT INTO user_exercises (user_id, exercise_name)
       VALUES ($1, $2)
       RETURNING id, exercise_name`,
      [effectiveUserId, exercise_name]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
} 