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

  useEffect(() => {
    // TODO: Fetch log entries from API
    // For now, we'll use mock data
    setLogEntries([
      { id: 1, exercise: 'Push-ups', reps: 10, load: 0, timestamp: '2023-04-20T10:30:00Z' },
      { id: 2, exercise: 'Pull-ups', reps: 5, load: 0, timestamp: '2023-04-20T11:15:00Z' },
      { id: 3, exercise: 'Squats', reps: 15, load: 20, timestamp: '2023-04-20T14:00:00Z' },
    ]);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Exercise Log</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Exercise</th>
            <th className="border p-2">Reps</th>
            <th className="border p-2">Load (kg)</th>
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