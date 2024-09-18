'use client';

import { useState, useEffect } from 'react';
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
} from 'chart.js';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DataAnalysis() {
  const [timeframe, setTimeframe] = useState('week');
  const [exercise, setExercise] = useState('all');
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    // TODO: Fetch data from API based on timeframe and exercise
    // For now, we'll use mock data
    const mockData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Total Reps',
          data: [50, 60, 45, 70, 65, 80, 75],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Total Load (kg)',
          data: [100, 120, 90, 140, 130, 160, 150],
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };
    setChartData(mockData);
  }, [timeframe, exercise]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Data Analysis</h2>
      <div className="mb-4 text-black">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <select
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Exercises</option>
          <option value="push-ups">Push-ups</option>
          <option value="pull-ups">Pull-ups</option>
          <option value="squats">Squats</option>
        </select>
      </div>
      {chartData && (
        <div className="w-full h-64">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      )}
    </div>
  );
}