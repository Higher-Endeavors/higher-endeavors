import React from 'react';
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div>Please log in to view your programs.</div>;
  }

  let programs = [];
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT p.id, p.name, COUNT(e.id) as exercise_count FROM programs p LEFT JOIN exercises e ON p.id = e.program_id WHERE p.user_id = $1 GROUP BY p.id, p.name',
        [session.user.id]
      );
      programs = result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
    return <div>Error loading programs. Please try again later.</div>;
  }

  return (
    <div>
      <h1>Your Resistance Training Programs</h1>
      <Link href="/programs/create">Create New Program</Link>
      <ul>
        {programs.map((program) => (
          <li key={program.id}>
            <Link href={`/programs/${program.id}`}>
              {program.name} ({program.exercise_count} exercises)
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
