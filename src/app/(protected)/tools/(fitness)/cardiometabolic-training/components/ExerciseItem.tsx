'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

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

interface ExerciseItemProps {
  exercise: CMEExercise;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ExerciseItem({ exercise, onEdit, onDelete }: ExerciseItemProps) {
  const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  // Calculate summary
  const totalDuration = exercise.intervals.reduce((sum, interval) => sum + interval.duration, 0);
  const totalWorkDuration = exercise.intervals
    .filter(interval => interval.stepType === 'Work')
    .reduce((sum, interval) => sum + interval.duration, 0);

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-slate-900 font-semibold">A1</span>
          <span className="font-medium dark:text-slate-900">{exercise.activityName}</span>
          {exercise.activitySource === 'user' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900">
              Custom
            </span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(exercise.activityId);
            }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[exercise.activityId]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen[exercise.activityId] && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={closeMenu}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(exercise.activityId);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(exercise.activityId);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exercise Details Table */}
      <div className="mt-3">
        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-5 gap-2 text-sm font-semibold text-gray-500 dark:text-slate-600">
          <div>Set</div>
          <div className="font-bold">Step Type</div>
          <div className="font-bold">Duration (min)</div>
          <div className="font-bold">Intensity</div>
          <div className="font-bold">Notes</div>
        </div>
        
        {/* Desktop table rows */}
        <div className="hidden md:grid grid-cols-5 gap-2 text-sm dark:text-slate-600">
          {exercise.intervals.map((interval, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center">{idx + 1}</div>
              <div className="flex items-center">{interval.stepType}</div>
              <div className="flex items-center">{interval.duration}</div>
              <div className="flex items-center">
                {interval.intensity ? `${interval.intensity} ${interval.intensityMetric}` : '-'}
              </div>
              <div className="flex items-center">{interval.notes || '-'}</div>
            </React.Fragment>
          ))}
        </div>
        
        {/* Mobile-friendly card layout */}
        <div className="md:hidden space-y-3">
          {exercise.intervals.map((interval, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Set {idx + 1}</span>
                <span className="text-sm font-bold text-gray-500">{interval.stepType}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-bold text-gray-600 mb-1">Duration</div>
                  <span className="text-gray-800">{interval.duration} min</span>
                </div>
                <div>
                  <div className="font-bold text-gray-600 mb-1">Intensity</div>
                  <span className="text-gray-800">
                    {interval.intensity ? `${interval.intensity} ${interval.intensityMetric}` : '-'}
                  </span>
                </div>
              </div>
              {interval.notes && (
                <div className="mt-2 text-sm">
                  <div className="font-bold text-gray-600 mb-1">Notes</div>
                  <span className="text-gray-800">{interval.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary and Notes */}
      <div className="mt-3 border-t pt-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium text-purple-700">
            <div>
              <span className="mr-1">Total Duration:</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {totalDuration} min
              </span>
            </div>
            {exercise.useIntervals && (
              <div>
                <span className="mr-1">Intervals:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {exercise.intervals.length}
                </span>
              </div>
            )}
            {totalWorkDuration > 0 && (
              <div>
                <span className="mr-1">Work Time:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {totalWorkDuration} min
                </span>
              </div>
            )}
            <div>
              <span className="mr-1">Type:</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {exercise.useIntervals ? 'Interval Training' : 'Steady State'}
              </span>
            </div>
          </div>
          {exercise.notes && (
            <div className="text-sm text-gray-600">
              <span>
                <span className="font-medium dark:text-slate-900">Notes: </span>
                <span className="dark:text-slate-900">{exercise.notes}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}