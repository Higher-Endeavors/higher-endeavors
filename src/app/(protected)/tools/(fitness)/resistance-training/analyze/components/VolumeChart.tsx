import React from 'react';
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
import { TrainingSession } from '../../shared/types';
import { calculateSessionVolume } from '../../shared/utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolumeChartProps {
  sessions: TrainingSession[];
}

export default function VolumeChart({ sessions }: VolumeChartProps) {
  // Process data
  const completedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(a.actualDate!).getTime() - new Date(b.actualDate!).getTime());

  const data = {
    labels: completedSessions.map(session =>
      format(new Date(session.actualDate!), 'MMM d')
    ),
    datasets: [
      {
        label: 'Total Reps',
        data: completedSessions.map(session =>
          calculateSessionVolume(session.exercises).totalReps
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        yAxisID: 'y'
      },
      {
        label: 'Total Load (kg)',
        data: completedSessions.map(session =>
          calculateSessionVolume(session.exercises).totalLoad
        ),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        yAxisID: 'y1'
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
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
              label += Math.round(context.parsed.y).toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Total Reps'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Total Load (kg)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (completedSessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No completed sessions to display
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line options={options} data={data} />
    </div>
  );
} 