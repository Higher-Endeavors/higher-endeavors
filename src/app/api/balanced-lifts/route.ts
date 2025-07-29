import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const query = `
    SELECT b.*, r.struct_bal_ref_lift_load, e.exercise_name
    FROM struct_balanced_lifts b
    JOIN struct_bal_ref_lifts r ON b.struct_balanced_reference_lift_id = r.web_vitals_ratings_id
    JOIN resist_train_exercise_library e ON r.exercise_library_id = e.id
    WHERE b.struct_balanced_user_id = $1
  `;
  const values = [userId];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching balanced lifts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { exercise_name, struct_bal_lift_load, userId } = await request.json();

  const query = `
    INSERT INTO struct_balanced_lifts 
    (struct_balanced_user_id, struct_balanced_reference_lift_id, struct_balanced_load) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;
  const values = [userId, exercise_name, struct_bal_lift_load];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating balanced lift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
