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
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(2);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return Number(value).toFixed(2);
        }
      }
    },
  },
};

// Placeholder data - replace with actual API call
const mockData: BodyCompositionEntry[] = [
  // Add some mock data for development
];

const formatMeasurementTitle = (key: string): string => {
  // Split on capital letters and remove any empty strings
  const parts = key.split(/(?=[A-Z])/).filter(Boolean);
  
  // Handle special cases for left/right measurements
  if (parts[0].toLowerCase() === 'left' || parts[0].toLowerCase() === 'right') {
    // Remove the side and handle it separately
    const side = parts.shift()!.toLowerCase();
    // Capitalize remaining parts
    const measurement = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
    return `${measurement} - ${side.charAt(0).toUpperCase() + side.slice(1)}`;
  }
  
  // For other measurements, just capitalize each word
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
};

export default function BodyCompositionAnalysis() {
  const [timeframe, setTimeframe] = useState<string>('');
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
        label: 'Weight (lbs.)',
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
        data: data.map(entry => entry.manualBodyFatPercentage ?? null),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Calculated Body Fat %',
        data: data.map(entry => entry.calculatedBodyFatPercentage ?? null),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  const compositionChartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: 'Fat Mass (lbs.)',
        data: data.map(entry => entry.fatMass ?? null),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Fat Free Mass (lbs.)',
        data: data.map(entry => entry.fatFreeMass ?? null),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const circumferenceChartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: `${formatMeasurementTitle('waist')} (cm)`,
        data: data.map(entry => entry.circumferenceMeasurements.waist ?? null),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: `${formatMeasurementTitle('chest')} (cm)`,
        data: data.map(entry => entry.circumferenceMeasurements.chest ?? null),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: `${formatMeasurementTitle('hips')} (cm)`,
        data: data.map(entry => entry.circumferenceMeasurements.hips ?? null),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Analysis Timeframe</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="appearance-none w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
            >
              <option value="" disabled>Select Timeframe</option>
              <option value="1w">Last Week</option>
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {timeframe === 'custom' && (
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Weight Trend</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={weightChartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Body Fat % Trend</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={bodyFatChartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Fat Mass vs Fat Free Mass</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={compositionChartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Key Circumference Changes</h2>
          <div className="h-[300px]">
            <Line options={defaultChartOptions} data={circumferenceChartData} />
          </div>
        </div>
      </div>
    </div>
  );
} 