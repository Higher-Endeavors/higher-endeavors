'use client';

import { useState } from 'react';

interface CMEExercise {
  activityId: number;
  activityName: string;
  activitySource: 'library' | 'user';
  useIntervals: boolean;
  intervals: Array<{
    stepType: string;
    duration: number;
    intensity: string;
    intensityMetric: string;
    notes: string;
  }>;
  notes: string;
  createdAt: string;
  userId: number;
}

interface SessionSummaryProps {
  exercises: CMEExercise[];
}

export default function SessionSummary({ exercises }: SessionSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate real-time statistics from actual exercise data
  const calculateSessionStats = () => {
    if (exercises.length === 0) {
      return {
        totalExercises: 0,
        totalDuration: 0,
        totalWorkDuration: 0,
        totalIntervals: 0,
        averageIntensity: 'N/A',
        estimatedDuration: '0 min'
      };
    }

    let totalDuration = 0;
    let totalWorkDuration = 0;
    let totalIntervals = 0;
    let intensityValues: string[] = [];

    exercises.forEach(exercise => {
      if (exercise.useIntervals && exercise.intervals.length > 0) {
        // Interval training
        exercise.intervals.forEach(interval => {
          totalDuration += interval.duration;
          totalIntervals++;
          
          if (interval.stepType === 'Work') {
            totalWorkDuration += interval.duration;
          }
          
          if (interval.intensity) {
            intensityValues.push(`${interval.intensity} ${interval.intensityMetric}`);
          }
        });
      } else {
        // Steady state
        totalDuration += exercise.intervals[0]?.duration || 0;
        if (exercise.intervals[0]?.intensity) {
          intensityValues.push(`${exercise.intervals[0].intensity} ${exercise.intervals[0].intensityMetric}`);
        }
      }
    });

    // Calculate average intensity (most common intensity metric)
    const intensityCounts: { [key: string]: number } = {};
    intensityValues.forEach(intensity => {
      intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    });

    let averageIntensity = 'N/A';
    if (Object.keys(intensityCounts).length > 0) {
      const mostCommon = Object.entries(intensityCounts).reduce((a, b) => 
        intensityCounts[a[0]] > intensityCounts[b[0]] ? a : b
      );
      averageIntensity = mostCommon[0];
    }

    // Estimate total session duration (add 10% for transitions/rest)
    const estimatedDuration = Math.round(totalDuration * 1.1);

    return {
      totalExercises: exercises.length,
      totalDuration,
      totalWorkDuration,
      totalIntervals,
      averageIntensity,
      estimatedDuration: `${estimatedDuration} min`
    };
  };

  const sessionStats = calculateSessionStats();

  const summaryData = {
    'Total Exercises': { value: sessionStats.totalExercises.toString(), color: '' },
    'Total Duration': { value: `${sessionStats.totalDuration} min`, color: '' },
    'Total Work Time': { value: `${sessionStats.totalWorkDuration} min`, color: '' },
    'Total Intervals': { value: sessionStats.totalIntervals.toString(), color: '' },
    'Average Intensity': { value: sessionStats.averageIntensity, color: '' },
    'Estimated Session': { value: sessionStats.estimatedDuration, color: '' }
  };

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Session Summary</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(summaryData).map(([key, data]) => (
              <div key={key} className="bg-white dark:bg-white p-3 sm:p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {key}
                </p>
                <p className={`text-base sm:text-lg font-semibold ${data.color ? `${data.color} px-2 py-1 rounded-full inline-block` : 'text-gray-900 dark:text-slate-900'}`}>
                  {data.value || '0'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}