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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FeedbackChartProps {
  sessions: TrainingSession[];
}

const feelingToNumber = (feeling: string): number => {
  switch (feeling) {
    case 'Strong':
      return 3;
    case 'Average':
      return 2;
    case 'Weak':
      return 1;
    default:
      return 0;
  }
};

const energyToNumber = (energy: string): number => {
  switch (energy) {
    case 'Energetic':
      return 3;
    case 'Normal':
      return 2;
    case 'Fatigued':
      return 1;
    default:
      return 0;
  }
};

const sorenessToNumber = (soreness: string): number => {
  switch (soreness) {
    case 'None':
      return 0;
    case 'Mild':
      return 1;
    case 'Moderate':
      return 2;
    case 'Severe':
      return 3;
    default:
      return 0;
  }
};

export default function FeedbackChart({ sessions }: FeedbackChartProps) {
  // Process data
  const completedSessions = sessions
    .filter(s => s.status === 'completed' && s.feedback)
    .sort((a, b) => new Date(a.actualDate!).getTime() - new Date(b.actualDate!).getTime());

  const data = {
    labels: completedSessions.map(session =>
      format(new Date(session.actualDate!), 'MMM d')
    ),
    datasets: [
      {
        label: 'Feeling',
        data: completedSessions.map(session =>
          feelingToNumber(session.feedback!.feeling)
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        yAxisID: 'y'
      },
      {
        label: 'Energy Level',
        data: completedSessions.map(session =>
          energyToNumber(session.feedback!.energyLevel)
        ),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        yAxisID: 'y'
      },
      {
        label: 'Muscle Pump',
        data: completedSessions.map(session =>
          session.feedback!.musclePump
        ),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        yAxisID: 'y1'
      },
      {
        label: 'Next Day Soreness',
        data: completedSessions.map(session =>
          session.feedback!.nextDaySoreness ? sorenessToNumber(session.feedback!.nextDaySoreness) : null
        ),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        yAxisID: 'y'
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
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              switch (label.split(':')[0]) {
                case 'Feeling':
                  label += ['', 'Weak', 'Average', 'Strong'][context.parsed.y];
                  break;
                case 'Energy Level':
                  label += ['', 'Fatigued', 'Normal', 'Energetic'][context.parsed.y];
                  break;
                case 'Muscle Pump':
                  label += context.parsed.y + '/10';
                  break;
                case 'Next Day Soreness':
                  label += ['None', 'Mild', 'Moderate', 'Severe'][context.parsed.y];
                  break;
                default:
                  label += context.parsed.y;
              }
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
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return ['', 'Low', 'Medium', 'High'][value as number];
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        max: 10,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (completedSessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No feedback data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line options={options} data={data} />
    </div>
  );
} 