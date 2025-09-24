'use client';

import React, { useState } from 'react';
import type { CMEExercise } from '(protected)/tools/fitness/cardiometabolic-training/lib/types/cme.zod';

interface SessionSummaryProps {
  activities: CMEExercise[];
}

export default function SessionSummary({ activities }: SessionSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Helper function to format duration consistently
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0 min';
    
    const wholeMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - wholeMinutes) * 60);
    
    if (seconds === 0) {
      return `${wholeMinutes} min`;
    } else {
      return `${wholeMinutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Calculate real-time statistics from actual activity data
  const calculateSessionStats = () => {
    if (activities.length === 0) {
      return {
        totalSteps: 0,
        totalSessionDuration: 0,
        totalWorkDuration: 0,
        totalIntervals: 0
      };
    }

    let totalDuration = 0;
    let totalWorkDuration = 0;
    let totalIntervals = 0;
    let totalSteps = 0;

    activities.forEach(activity => {
      if (activity.useIntervals && activity.intervals.length > 0) {
        // Interval training
        activity.intervals.forEach(interval => {
          totalDuration += interval.duration;
          totalSteps++;
          
          if (interval.stepType === 'Work') {
            totalWorkDuration += interval.duration;
          }
        });
        
        // Add interval count from repeat blocks
        if (activity.totalRepeatCount) {
          totalIntervals += activity.totalRepeatCount;
        }
      } else {
        // Steady state
        totalDuration += activity.intervals[0]?.duration || 0;
        totalSteps += activity.intervals.length;
      }
    });

    return {
      totalSteps,
      totalSessionDuration: totalDuration,
      totalWorkDuration,
      totalIntervals
    };
  };

  const sessionStats = calculateSessionStats();

  const summaryData = {
    'Total Steps': { value: sessionStats.totalSteps.toString(), color: '' },
    'Total Session Duration': { value: formatDuration(sessionStats.totalSessionDuration), color: '' },
    'Total Work Time': { value: formatDuration(sessionStats.totalWorkDuration), color: '' },
    'Total Intervals': { value: sessionStats.totalIntervals.toString(), color: '' }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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