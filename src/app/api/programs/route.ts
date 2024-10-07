import { NextResponse } from 'next/server';
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]/route";
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const programResult = await client.query(
        'INSERT INTO programs (name, user_id) VALUES ($1, $2) RETURNING id',
        [body.name, session.user.id]
      );
      const programId = programResult.rows[0].id;

      for (const exercise of body.exercises) {
        await client.query(
          'INSERT INTO exercises (program_id, name, pairing, sets, reps, load, tempo, rest, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [programId, exercise.name, exercise.pairing, exercise.sets, exercise.reps, exercise.load, exercise.tempo, exercise.rest, exercise.notes]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ id: programId });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Error creating program' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT p.id, p.name, json_agg(e.*) as exercises FROM programs p LEFT JOIN exercises e ON p.id = e.program_id WHERE p.user_id = $1 GROUP BY p.id',
        [session.user.id]
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Error fetching programs' }, { status: 500 });
  }
}
