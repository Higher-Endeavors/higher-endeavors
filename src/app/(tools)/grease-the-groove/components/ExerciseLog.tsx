import { useEffect, useState } from 'react';

type LogEntry = {
  id: string;
  exercise_name: string;
};

export default function ExerciseLog() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  var data: LogEntry[] = [];

  useEffect(() => {
    async function fetchExercises() {
      try {
        console.log('Fetching exercises...');
        const response = await fetch('/api/exercises');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
        }
        data = await response.json();
        console.log('Fetched data:', data);
        setLogEntries(data);
        console.log('Log entries:', logEntries);
        data.map((entry) => (
            console.log(entry.exercise_name)
        ));
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
          {data.map((entry) => (
            <tr key={entry.id}>
              <td className="border p-2">{entry.exercise_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}