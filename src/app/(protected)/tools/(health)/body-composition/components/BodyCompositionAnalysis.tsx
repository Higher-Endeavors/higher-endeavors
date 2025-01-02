'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { BodyCompositionEntry } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Placeholder data - replace with actual API call
const mockData: BodyCompositionEntry[] = [
  // Add some mock data for development
];

export default function BodyCompositionAnalysis() {
  const [timeframe, setTimeframe] = useState<string>('1w');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [data, setData] = useState<BodyCompositionEntry[]>(mockData);
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeframeChange = async (value: string) => {
    setTimeframe(value);
    if (value !== 'custom') {
      setIsLoading(true);
      try {
        // TODO: Fetch data for the selected timeframe
        // const response = await fetch(`/api/body-composition?timeframe=${value}`);
        // const newData = await response.json();
        // setData(newData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCustomDateChange = async () => {
    if (startDate && endDate) {
      setIsLoading(true);
      try {
        // TODO: Fetch data for the custom date range
        // const response = await fetch(`/api/body-composition?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
        // const newData = await response.json();
        // setData(newData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Prepare chart data
  const dates = data.map(entry => new Date(entry.date).toLocaleDateString());

  const weightChartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Weight (kg)',
        data: data.map(entry => entry.weight),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const bodyFatChartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Manual Body Fat %',
        data: data.map(entry => entry.manualBodyFatPercentage),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Calculated Body Fat %',
        data: data.map(entry => entry.calculatedBodyFatPercentage),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  const compositionChartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Fat Mass (kg)',
        data: data.map(entry => entry.fatMass),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Fat Free Mass (kg)',
        data: data.map(entry => entry.fatFreeMass),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const circumferenceChartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Waist (cm)',
        data: data.map(entry => entry.circumferenceMeasurements.waist),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Chest (cm)',
        data: data.map(entry => entry.circumferenceMeasurements.chest),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Hips (cm)',
        data: data.map(entry => entry.circumferenceMeasurements.hips),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Analysis Timeframe</h2>
        <div className="flex space-x-4">
          <select
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
          >
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {timeframe === 'custom' && (
            <div className="flex space-x-4">
              <input
                type="date"
                value={startDate?.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
              />
              <input
                type="date"
                value={endDate?.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
              />
              <button
                onClick={handleCustomDateChange}
                className="rounded-md bg-purple-500 hover:bg-purple-600 py-2 px-4 text-white text-sm"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Weight Trend</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={weightChartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Body Fat % Trend</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={bodyFatChartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Fat Mass vs Fat Free Mass</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={compositionChartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Key Circumference Changes</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={circumferenceChartData} />
          </div>
        </div>
      </div>
    </div>
  );
} 