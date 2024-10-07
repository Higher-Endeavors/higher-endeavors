import { useForm, SubmitHandler } from 'react-hook-form';
import { useState, useEffect } from 'react';


interface Exercise {
  id: string;
  exercise_name: string;
}

interface FormInputs {
  exercise: Exercise;
  reps: number;
  load: number;
}

export default function ExerciseForm() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, control } = useForm<FormInputs>();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setExercises(data);
        } else {
          throw new Error('Received invalid data format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching exercises:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    console.log('Submitting:', data);
    reset();
  };

  if (isLoading) return <div>Loading exercises...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select {...register('exercise', { required: true })}>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.exercise_name}</option>
          ))}
          placeholder="Select Exercise"
          
          </select>
        <input
          {...register('reps', { required: true, valueAsNumber: true })}
          type="number"
          placeholder="Reps"
          className="border p-2 rounded text-black"
        />
        <input
          {...register('load', { required: true, valueAsNumber: true })}
          type="number"
          placeholder="Load (lbs)"
          className="border p-2 rounded text-black"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Log Exercise
        </button>
      </div>
    </form>
  );
}