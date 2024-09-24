import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ProgramPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div>Please log in to view this program.</div>;
  }

  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: { exercises: true },
  });

  if (!program || program.userId !== session.user.id) {
    return <div>Program not found or you don't have permission to view it.</div>;
  }

  return (
    <div>
      <h1>{program.name}</h1>
      <Link href={`/programs/${program.id}/edit`}>Edit Program</Link>
      <ul>
        {program.exercises.map((exercise) => (
          <li key={exercise.id}>
            {exercise.pairing}: {exercise.name} - {exercise.sets} sets of {exercise.reps} reps
            {exercise.load && ` @ ${exercise.load}kg`}
            {exercise.tempo && ` (Tempo: ${exercise.tempo})`}
            {exercise.rest && ` Rest: ${exercise.rest}s`}
            {exercise.notes && <p>Notes: {exercise.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
