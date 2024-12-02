import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = 'SELECT * FROM resist_train_exercise_library';
  let values: any[] = [];

  if (id) {
    query += ' WHERE id = $1';
    values.push(id);
  }

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching exercise library:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { exercise_name, description, movement, category, primary_muscles, secondary_muscles, images, equipment } = await request.json();

  const query = `
    INSERT INTO resist_train_exercise_library 
    (exercise_name, description, movement, category, primary_muscles, secondary_muscles, images, equipment) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *
  `;
  const values = [exercise_name, description, movement, category, primary_muscles, secondary_muscles, images, equipment];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, exercise_name, description, movement, category, primary_muscles, secondary_muscles, images, equipment } = await request.json();

  const query = `
    UPDATE resist_train_exercise_library 
    SET exercise_name = $2, description = $3, movement = $4, category = $5, 
        primary_muscles = $6, secondary_muscles = $7, images = $8, equipment = $9
    WHERE id = $1 
    RETURNING *
  `;
  const values = [id, exercise_name, description, movement, category, primary_muscles, secondary_muscles, images, equipment];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const query = 'DELETE FROM resist_train_exercise_library WHERE id = $1 RETURNING *';
  const values = [id];

  try {
    const result = await SingleQuery(query, values);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
