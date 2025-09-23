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
// Define the interface locally since we removed the action file
interface ExerciseAnalysisData {
  exerciseName: string;
  instances: any[];
  timeframeData: {
    period: string;
    instances: any[];
    averageLoadVolume: number;
    totalLoadVolume: number;
    instanceCount: number;
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
  // Check if exercise uses bodyweight or non-integer loads
  const isBodyweightOrNonIntegerLoad = () => {
    if (!analysis.instances || analysis.instances.length === 0) return false;
    
    // Check if any instance has bodyweight indicators or non-integer loads
    return analysis.instances.some((inst: any) => {
      // Check for bodyweight indicators
      if (inst.loadUnit === 'BW' || inst.loadUnit === 'bw' || inst.loadUnit === 'bodyweight') {
        return true;
      }
      
      // Check for non-integer loads (like 0, empty, or non-numeric)
      const load = parseFloat(inst.totalLoad);
      return isNaN(load) || load === 0 || !Number.isInteger(load);
    });
  };

  const useRepVolume = isBodyweightOrNonIntegerLoad();

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
        text: `${analysis.exerciseName} - ${useRepVolume ? 'Rep Volume' : 'Load Volume'} Progression`,
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
            const instances = [...analysis.instances].sort(
              (a: any, b: any) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
            );
            const inst = instances[dataIndex];
            return inst ? `${inst.programName} (Week ${inst.programInstance})` : `Instance ${(dataIndex || 0) + 1}`;
          },
          label: function(context: any) {
            return ''; // Empty label since we're using afterBody
          },
          afterBody: function(context: any) {
            const dataIndex = context[0]?.dataIndex;
            const instances = [...analysis.instances].sort(
              (a: any, b: any) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
            );
            const inst = instances[dataIndex];
            
            if (!inst) {
              return [];
            }
            
            // Calculate percent change from previous week
            let percentChange = null;
            if (dataIndex > 0) {
              const previousInst = instances[dataIndex - 1];
              const currentValue = useRepVolume ? inst.repVolume : inst.loadVolume;
              const previousValue = useRepVolume ? previousInst.repVolume : previousInst.loadVolume;
              
              if (previousValue > 0) {
                percentChange = ((currentValue - previousValue) / previousValue) * 100;
              }
            }
            
            // Show only the data we want: Sets, Rep Volume, and Load Volume (if applicable)
            const tooltipData = [
              `Sets: ${inst.totalSets}`,
              `Rep Volume: ${inst.repVolume}`
            ];
            
            if (!useRepVolume) {
              tooltipData.push(`Load Volume: ${inst.loadVolume.toFixed(1)} ${loadUnit}`);
            }
            
            // Add percent change if available
            if (percentChange !== null) {
              const changeText = percentChange > 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`;
              const changeColor = percentChange > 0 ? 'text-green-500' : percentChange < 0 ? 'text-red-500' : 'text-gray-500';
              tooltipData.push(`Change: ${changeText}`);
            }
            
            return tooltipData;
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
          text: useRepVolume ? 'Rep Volume' : `Load Volume (${loadUnit})`,
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

  // Prepare chart data - plot each exercise instance as its own point
  const getChartData = () => {
    // Ensure stable chronological order
    const instances = [...analysis.instances].sort(
      (a: any, b: any) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
    );

    const labels = instances.map((inst: any, idx: number) => {
      const date = new Date(inst.executionDate);
      const dateStr = isNaN(date.getTime()) ? `Instance ${idx + 1}` : date.toLocaleDateString();
      return `${dateStr} (W${inst.programInstance ?? ''})`;
    });

    const datasets = [{
      label: useRepVolume ? 'Rep Volume' : 'Load Volume',
      data: instances.map((inst: any) => useRepVolume ? inst.repVolume : inst.loadVolume),
      borderColor: '#DC2626', // Bold red for volume
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
            Exercise Volume Progression
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
          Track {analysis.exerciseName} {useRepVolume ? 'rep volume' : 'load volume'} progression across time periods. 
          Hover over data points to see detailed rep, set, and program information.
        </p>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full">
        <Line options={chartOptions} data={getChartData()} />
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-700">Total Instances</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
            {analysis.instances.length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-700">Overall Change</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
            {(() => {
              if (analysis.instances.length < 2) {
                return 'N/A';
              }
              
              // Sort instances chronologically
              const sortedInstances = [...analysis.instances].sort(
                (a: any, b: any) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
              );
              
              const firstInstance = sortedInstances[0];
              const lastInstance = sortedInstances[sortedInstances.length - 1];
              
              const firstValue = useRepVolume ? firstInstance.repVolume : firstInstance.loadVolume;
              const lastValue = useRepVolume ? lastInstance.repVolume : lastInstance.loadVolume;
              
              if (firstValue === 0) {
                return 'N/A';
              }
              
              const percentChange = ((lastValue - firstValue) / firstValue) * 100;
              const changeText = percentChange > 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`;
              
              return changeText;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
