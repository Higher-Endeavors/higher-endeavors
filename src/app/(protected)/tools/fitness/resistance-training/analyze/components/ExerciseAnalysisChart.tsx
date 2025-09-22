'use client';

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
import type { ExerciseAnalysisData } from '../lib/actions/getExerciseAnalysis';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExerciseAnalysisChartProps {
  analysis: ExerciseAnalysisData;
  loadUnit: string;
  onLoadUnitChange: (unit: 'lbs' | 'kg') => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export default function ExerciseAnalysisChart({ 
  analysis, 
  loadUnit,
  onLoadUnitChange,
  timeframe,
  onTimeframeChange
}: ExerciseAnalysisChartProps) {
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgb(156, 163, 175)', // gray-400 for dark mode
        }
      },
      title: {
        display: true,
        text: `${analysis.exerciseName} - Load Volume Progression`,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: 'rgb(55, 65, 81)', // gray-700 for both light and dark mode
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgb(31, 41, 55)', // gray-800 for dark mode
        titleColor: 'rgb(243, 244, 246)', // gray-100 for dark mode
        bodyColor: 'rgb(243, 244, 246)', // gray-100 for dark mode
        borderColor: 'rgb(75, 85, 99)', // gray-600 for dark mode
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0]?.dataIndex;
            const periodData = analysis.timeframeData[dataIndex];
            return periodData ? periodData.period : `Period ${(dataIndex || 0) + 1}`;
          },
          label: function(context: any) {
            const dataIndex = context[0]?.dataIndex;
            const periodData = analysis.timeframeData[dataIndex];
            
            if (!periodData || periodData.instances.length === 0) {
              return 'No data';
            }
            
            const instances = periodData.instances;
            const totalLoadVolume = periodData.totalLoadVolume;
            const instanceCount = periodData.instanceCount;
            
            return [
              `Load Volume: ${totalLoadVolume.toFixed(1)} ${loadUnit}`,
              `Instances: ${instanceCount}`,
              `Programs: ${instances.map(inst => inst.programName).join(', ')}`,
              `Execution Dates: ${instances.map(inst => new Date(inst.executionDate).toLocaleDateString()).join(', ')}`
            ];
          },
          afterBody: function(context: any) {
            const dataIndex = context[0]?.dataIndex;
            const periodData = analysis.timeframeData[dataIndex];
            
            if (!periodData || periodData.instances.length === 0) {
              return [];
            }
            
            // Show individual instance details
            return periodData.instances.map(instance => [
              `  ${instance.programName} (Week ${instance.programInstance}):`,
              `    Reps: ${instance.reps}, Sets: ${instance.sets}`,
              `    Load: ${instance.load} ${instance.loadUnit}`,
              `    Rep Volume: ${instance.repVolume}`,
              `    Load Volume: ${instance.loadVolume.toFixed(1)} ${loadUnit}`
            ]).flat();
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period',
          color: 'rgb(156, 163, 175)', // gray-400 for dark mode
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400 for dark mode
        },
        grid: {
          color: 'rgb(75, 85, 99)', // gray-600 for dark mode
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `Load Volume (${loadUnit})`,
          color: 'rgb(156, 163, 175)', // gray-400 for dark mode
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400 for dark mode
        },
        grid: {
          color: 'rgb(75, 85, 99)', // gray-600 for dark mode
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Prepare chart data
  const getChartData = () => {
    const labels = analysis.timeframeData.map(period => period.period);
    
    const datasets = [{
      label: 'Load Volume',
      data: analysis.timeframeData.map(period => period.totalLoadVolume),
      borderColor: '#DC2626', // Bold red for load volume
      backgroundColor: '#DC2626',
      borderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.1,
      fill: false
    }];

    return {
      labels,
      datasets
    };
  };

  return (
    <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">
            Exercise Load Volume Progression
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-700">
                Timeframe:
              </label>
              <select
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="3month">3 Months</option>
                <option value="6month">6 Months</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-700">
                Load Unit:
              </label>
              <select
                value={loadUnit}
                onChange={(e) => onLoadUnitChange(e.target.value as 'lbs' | 'kg')}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-700">
          Track {analysis.exerciseName} load volume progression across time periods. 
          Hover over data points to see detailed rep, set, and program information.
        </p>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full">
        <Line options={chartOptions} data={getChartData()} />
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-700">Total Instances</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
            {analysis.instances.length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-700">Time Periods</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
            {analysis.timeframeData.length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-700">Avg Load Volume</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
            {analysis.timeframeData.length > 0 
              ? (analysis.timeframeData.reduce((sum, period) => sum + period.averageLoadVolume, 0) / analysis.timeframeData.length).toFixed(1)
              : '0'
            } {loadUnit}
          </p>
        </div>
      </div>
    </div>
  );
}
