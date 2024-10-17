import { NextResponse } from 'next/server';
import { SingleQuery } from '@/lib/dbAdapter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = `
    SELECT r.*, e.exercise_name 
    FROM struct_bal_ref_lifts r
    JOIN resist_train_exercise_library e ON r.exercise_library_id = e.id
  `;
  let values: any[] = [];

  if (id) {
    query += ' WHERE r.id = $1';
    values.push(id);
  }

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching reference lifts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { struct_bal_ref_lift_load, exercise_library_id } = await request.json();

  const query = `
    INSERT INTO struct_bal_ref_lifts 
    (struct_bal_ref_lift_load, exercise_library_id) 
    VALUES ($1, $2) 
    RETURNING *
  `;
  const values = [struct_bal_ref_lift_load, exercise_library_id];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating reference lift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, struct_bal_ref_lift_load, exercise_library_id } = await request.json();

  const query = `
    UPDATE struct_bal_ref_lifts 
    SET struct_bal_ref_lift_load = $2, exercise_library_id = $3
    WHERE id = $1 
    RETURNING *
  `;
  const values = [id, struct_bal_ref_lift_load, exercise_library_id];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating reference lift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const query = 'DELETE FROM struct_bal_ref_lifts WHERE id = $1 RETURNING *';
  const values = [id];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting reference lift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
