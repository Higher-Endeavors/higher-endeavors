import { useEffect, useState } from 'react';

type LogEntry = {
  id: number;
  exercise: string;
  reps: number;
  load: number;
  timestamp: string;
};

export default function ExerciseLog() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      try {
        console.log('Fetching exercises...');
        const response = await fetch('/api/exercises');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setLogEntries(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError(`Failed to load exercises. Please try again later. Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExercises();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Exercise Log</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="border p-2">Exercise</th>
            <th className="border p-2">Reps</th>
            <th className="border p-2">Load (lbs)</th>
            <th className="border p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logEntries.map((entry) => (
            <tr key={entry.id}>
              <td className="border p-2">{entry.exercise}</td>
              <td className="border p-2">{entry.reps}</td>
              <td className="border p-2">{entry.load}</td>
              <td className="border p-2">{new Date(entry.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}