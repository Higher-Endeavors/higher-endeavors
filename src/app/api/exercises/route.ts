import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';
import { auth } from '@/app/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await SingleQuery(
      `SELECT 
        id,
        exercise_name,
        difficulty_id,
        target_muscle_group_id,
        prime_mover_muscle_id
      FROM exercise_library 
      ORDER BY exercise_name ASC`,
      []
    );
    
    // Return just the rows array instead of the full result object
    return NextResponse.json(result.rows || result);
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
} 