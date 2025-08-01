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

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    // Allow admin to specify user_id, otherwise use session user
    const userId = searchParams.get('user_id') || session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await SingleQuery(
      `SELECT id, exercise_name FROM user_exercises WHERE user_id = $1`,
      [userId]
    );

    // Return as array of objects
    return NextResponse.json(
      result.rows.map((row: any) => ({
        exercise_library_id: row.id,
        name: row.exercise_name,
        source: 'user'
      }))
    );
  } catch (error) {
    console.error('Error fetching user exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user exercises' },
      { status: 500 }
    );
  }
} 