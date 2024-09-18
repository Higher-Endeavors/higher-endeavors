import { useState } from 'react';

export default function ExerciseForm() {
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  const [load, setLoad] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement API call to save exercise data
    console.log('Submitting:', { exercise, reps, load });
    // Reset form
    setExercise('');
    setReps('');
    setLoad('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Exercise"
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="number"
          value={load}
          onChange={(e) => setLoad(e.target.value)}
          placeholder="Load (lbs)"
          className="border p-2 rounded text-black"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Log Exercise
        </button>
      </div>
    </form>
  );
}