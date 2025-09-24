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
import type { ProgramVolumeAnalysis, ExerciseVolumeData } from '(protected)/tools/fitness/resistance-training/analyze/types/analysis.zod';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolumeAnalysisChartProps {
  analysis: ProgramVolumeAnalysis;
  selectedExercises: number[];
  onExerciseToggle: (exerciseId: number) => void;
  loadUnit: string;
  onLoadUnitChange: (unit: 'lbs' | 'kg') => void;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  showTimeframeSelector?: boolean;
}

export default function VolumeAnalysisChart({ 
  analysis, 
  selectedExercises, 
  onExerciseToggle, 
  loadUnit,
  onLoadUnitChange,
  timeframe = 'week',
  onTimeframeChange,
  showTimeframeSelector = false
}: VolumeAnalysisChartProps) {
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
        text: `Volume Analysis - ${analysis.programName}`,
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
          title: function(context) {
            const weekIndex = context[0].dataIndex;
            return `Week ${weekIndex + 1}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = loadUnit === 'kg' ? 'kg' : 'lbs';
            const weekIndex = context.dataIndex;
            
            // Calculate percentage change from baseline (Week 1)
            let percentageChange = '';
            if (weekIndex === 0) {
              percentageChange = ' (baseline)';
            } else {
              const currentValue = value;
              const baselineDataPoint = context.dataset.data[0];
              const baselineValue = typeof baselineDataPoint === 'number' ? baselineDataPoint : null;
              
              if (baselineValue && baselineValue > 0) {
                const change = ((currentValue - baselineValue) / baselineValue) * 100;
                const sign = change >= 0 ? '+' : '';
                percentageChange = ` (${sign}${change.toFixed(1)}%)`;
              } else {
                percentageChange = ' (baseline)';
              }
            }
            
            if (label.includes('Planned')) {
              return `${label}: ${value.toFixed(1)} ${unit}${percentageChange}`;
            } else if (label.includes('Actual')) {
              return value !== null ? `${label}: ${value.toFixed(1)} ${unit}${percentageChange}` : `${label}: No data`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Week',
          color: 'rgb(156, 163, 175)', // gray-400 for dark mode
        },
        ticks: {
          stepSize: 1,
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
          text: `Volume (${loadUnit})`,
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

  // Generate colors for exercises - planned (light) and actual (bold) pairs
  const generateColorPair = (index: number) => {
    const colorPairs = [
      { planned: '#93C5FD', actual: '#2563EB' }, // blue
      { planned: '#FCA5A5', actual: '#DC2626' }, // red
      { planned: '#86EFAC', actual: '#16A34A' }, // green
      { planned: '#FDE047', actual: '#CA8A04' }, // yellow
      { planned: '#C4B5FD', actual: '#7C3AED' }, // purple
      { planned: '#F9A8D4', actual: '#DB2777' }, // pink
      { planned: '#67E8F9', actual: '#0891B2' }, // cyan
      { planned: '#BEF264', actual: '#65A30D' }, // lime
      { planned: '#FDBA74', actual: '#EA580C' }, // orange
      { planned: '#A5B4FC', actual: '#4F46E5' }, // indigo
    ];
    return colorPairs[index % colorPairs.length];
  };

  // Calculate week-to-week percentage changes
  const calculatePercentageChanges = (data: number[]) => {
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      const previous = data[i - 1];
      const current = data[i];
      if (previous > 0) {
        const change = ((current - previous) / previous) * 100;
        changes.push(change);
      } else {
        changes.push(0);
      }
    }
    return changes;
  };

  // Prepare chart data
  const getChartData = () => {
    const labels = Array.from({ length: analysis.totalWeeks }, (_, i) => `Week ${i + 1}`);
    
    const datasets: any[] = [];

    // Add overall program data
    datasets.push({
      label: 'Overall Planned Volume',
      data: analysis.overallVolumeData.map(d => d.plannedVolume),
      borderColor: '#9CA3AF', // Light gray for planned
      backgroundColor: '#9CA3AF',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.1,
      fill: false
    });

    if (analysis.overallVolumeData.some(d => d.actualVolume !== null)) {
      datasets.push({
        label: 'Overall Actual Volume',
        data: analysis.overallVolumeData.map(d => d.actualVolume),
        borderColor: '#DC2626', // Bold red for actual
        backgroundColor: '#DC2626',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.1,
        fill: false
      });
    }

    // Add individual exercise data for selected exercises
    analysis.exerciseData.forEach((exercise, index) => {
      if (selectedExercises.includes(exercise.exerciseId)) {
        const colors = generateColorPair(index);
        
        datasets.push({
          label: `${exercise.exerciseName} (Planned)`,
          data: exercise.weeklyData.map(d => d.plannedVolume),
          borderColor: colors.planned,
          backgroundColor: colors.planned,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
          fill: false
        });

        if (exercise.weeklyData.some(d => d.actualVolume !== null)) {
          datasets.push({
            label: `${exercise.exerciseName} (Actual)`,
            data: exercise.weeklyData.map(d => d.actualVolume),
            borderColor: colors.actual,
            backgroundColor: colors.actual,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.1,
            fill: false
          });
        }
      }
    });


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
            Volume Progression Analysis
          </h3>
          <div className="flex items-center gap-4">
            {showTimeframeSelector && onTimeframeChange && (
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
            )}
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
          Compare planned vs actual volume across weeks to assess adherence to progressive overload principles.
        </p>
      </div>

      {/* Exercise Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-3">
          Select Exercises to Display:
        </h4>
        <div className="flex flex-wrap gap-2">
          {analysis.exerciseData.map((exercise) => (
            <button
              key={exercise.exerciseId}
              onClick={() => onExerciseToggle(exercise.exerciseId)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedExercises.includes(exercise.exerciseId)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-700 dark:hover:bg-gray-500'
              }`}
            >
              {exercise.exerciseName}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full">
        <Line options={chartOptions} data={getChartData()} />
      </div>

    </div>
  );
}
