import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { format } from 'date-fns';
import { TrainingSession, Exercise } from '../../shared/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressionChartProps {
  sessions: TrainingSession[];
}

interface ExerciseProgression {
  name: string;
  dates: string[];
  loads: number[];
}

export default function ProgressionChart({ sessions }: ProgressionChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Get unique exercises across all sessions
  const uniqueExercises = Array.from(
    new Set(
      sessions.flatMap(session =>
        session.exercises.map(exercise => exercise.name)
      )
    )
  ).sort();

  // Process data for selected exercise
  const getExerciseProgression = (exerciseName: string): ExerciseProgression => {
    const progression: ExerciseProgression = {
      name: exerciseName,
      dates: [],
      loads: []
    };

    const completedSessions = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(a.actualDate!).getTime() - new Date(b.actualDate!).getTime());

    completedSessions.forEach(session => {
      const exercise = session.exercises.find(e => e.name === exerciseName);
      if (exercise && exercise.actualSets && exercise.actualSets.length > 0) {
        // Calculate average load for the exercise in this session
        const totalLoad = exercise.actualSets.reduce((sum, set) => sum + (set.actualLoad || 0), 0);
        const averageLoad = totalLoad / exercise.actualSets.length;

        progression.dates.push(format(new Date(session.actualDate!), 'MMM d'));
        progression.loads.push(averageLoad);
      }
    });

    return progression;
  };

  const data = selectedExercise ? {
    labels: getExerciseProgression(selectedExercise).dates,
    datasets: [
      {
        label: 'Average Load (kg)',
        data: getExerciseProgression(selectedExercise).loads,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.1
      }
    ]
  } : null;

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += Math.round(context.parsed.y * 10) / 10 + ' kg';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Load (kg)'
        }
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select an exercise</option>
          {uniqueExercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64">
        {selectedExercise ? (
          data && data.labels.length > 0 ? (
            <Line options={options} data={data} />
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No progression data available for this exercise
            </div>
          )
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select an exercise to view progression
          </div>
        )}
      </div>
    </div>
  );
} 