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
import type { ProgramVolumeAnalysis, ExerciseVolumeData } from '../types/analysis.zod';

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
}

export default function VolumeAnalysisChart({ 
  analysis, 
  selectedExercises, 
  onExerciseToggle, 
  loadUnit 
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
        }
      },
      title: {
        display: true,
        text: `Volume Analysis - ${analysis.programName}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = loadUnit === 'kg' ? 'kg' : 'lbs';
            
            if (label.includes('Planned')) {
              return `${label}: ${value.toFixed(1)} ${unit}`;
            } else if (label.includes('Actual')) {
              return value !== null ? `${label}: ${value.toFixed(1)} ${unit}` : `${label}: No data`;
            } else if (label.includes('Difference')) {
              const sign = value >= 0 ? '+' : '';
              return `${label}: ${sign}${value.toFixed(1)} ${unit}`;
            } else if (label.includes('Percentage')) {
              return `${label}: ${value.toFixed(1)}%`;
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
          text: 'Week'
        },
        ticks: {
          stepSize: 1
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `Volume (${loadUnit})`
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

  // Generate colors for exercises
  const generateColor = (index: number) => {
    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // yellow
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316', // orange
      '#6366F1', // indigo
    ];
    return colors[index % colors.length];
  };

  // Prepare chart data
  const getChartData = () => {
    const labels = Array.from({ length: analysis.totalWeeks }, (_, i) => `Week ${i + 1}`);
    
    const datasets: any[] = [];

    // Add overall program data
    datasets.push({
      label: 'Overall Planned Volume',
      data: analysis.overallVolumeData.map(d => d.plannedVolume),
      borderColor: '#1F2937',
      backgroundColor: '#1F2937',
      borderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.1
    });

    if (analysis.overallVolumeData.some(d => d.actualVolume !== null)) {
      datasets.push({
        label: 'Overall Actual Volume',
        data: analysis.overallVolumeData.map(d => d.actualVolume),
        borderColor: '#6B7280',
        backgroundColor: '#6B7280',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1
      });
    }

    // Add individual exercise data for selected exercises
    analysis.exerciseData.forEach((exercise, index) => {
      if (selectedExercises.includes(exercise.exerciseId)) {
        const color = generateColor(index);
        
        datasets.push({
          label: `${exercise.exerciseName} (Planned)`,
          data: exercise.weeklyData.map(d => d.plannedVolume),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1
        });

        if (exercise.weeklyData.some(d => d.actualVolume !== null)) {
          datasets.push({
            label: `${exercise.exerciseName} (Actual)`,
            data: exercise.weeklyData.map(d => d.actualVolume),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 1,
            borderDash: [3, 3],
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.1
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Volume Progression Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compare planned vs actual volume across weeks to assess adherence to progressive overload principles.
        </p>
      </div>

      {/* Exercise Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
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

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Planned Volume</h5>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {analysis.totalPlannedVolume.toFixed(1)} {loadUnit}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Actual Volume</h5>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {analysis.totalActualVolume ? `${analysis.totalActualVolume.toFixed(1)} ${loadUnit}` : 'No data'}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Volume Adherence</h5>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {analysis.averageVolumePercentage ? `${analysis.averageVolumePercentage.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
