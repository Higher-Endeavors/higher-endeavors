import { NextResponse } from 'next/server';
import { getAllExercises, getExerciseById } from '@/app/lib/resistanceTrainingDb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const exercise = await getExerciseById(parseInt(id));
      if (exercise) {
        return NextResponse.json(exercise);
      } else {
        return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
      }
    } else {
      const exercises = await getAllExercises();
      return NextResponse.json(exercises);
    }
  } catch (error) {
    console.error('Error in exercises API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}