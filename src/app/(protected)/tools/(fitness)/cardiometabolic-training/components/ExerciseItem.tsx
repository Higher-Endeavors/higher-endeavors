'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

interface ExerciseItemProps {
  exercise: {
    id: number;
    name: string;
    step_type: string;
    intervals: number;
    planned_intervals: Array<{
      interval_number?: number;
      planned_duration?: number;
      planned_intensity?: number;
      intensity_unit?: string;
      planned_tempo?: string;
      planned_rest?: number;
      sub_intervals?: Array<{
        planned_duration?: number;
        planned_intensity?: number;
        intensity_unit?: string;
      }>;
    }>;
    notes?: string;
  };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ExerciseItem({ exercise, onEdit, onDelete }: ExerciseItemProps) {
  const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({});
  console.log(exercise)

  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeMenu = () => {
    setMenuOpen({});
  };

  // Simplified helper functions
  const formatLoad = (load: number, unit: string) => {
    return `${load} ${unit}`;
  };

 

  // Build a CME-appropriate list of intervals
  const intervals = exercise.planned_intervals.map((interval, idx) => ({
    intervalNumber: interval.interval_number || idx + 1,
    effortType: (typeof (interval as any).step_type === 'string' ? (interval as any).step_type : (idx % 2 === 0 ? 'Work' : 'Recovery')),
    exerciseName: exercise.name,
    duration: interval.planned_duration || 0, // minutes
    intensityValue: interval.planned_intensity || '',
    intensityUnit: interval.intensity_unit || '',
    intervalNotes: (interval as any).notes || '',
  }));

  // Calculate summary
  const totalDuration = intervals.reduce((sum, i) => sum + (i.duration || 0), 0);
  const totalWorkDuration = intervals.filter(i => i.effortType === 'Work').reduce((sum, i) => sum + (i.duration || 0), 0);

  console.log(intervals)
  
  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium dark:text-slate-900">{exercise.name}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(exercise.id);
            }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[exercise.id]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen[exercise.id] && (
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
                      onEdit(exercise.id);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(exercise.id);
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
      <div className="mt-4">
        <div className="grid grid-cols-5 gap-2 text-xs text-gray-900 font-semibold pb-1 border-b">
          <div>Interval x Effort</div>
          <div>Exercise</div>
          <div>Duration</div>
          <div>Intensity</div>
          <div>Notes</div>
        </div>
        {intervals.map((interval, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2 py-2 items-center text-sm border-b last:border-b-0 text-gray-900">
            <div>{`Interval ${interval.intervalNumber} - ${interval.effortType}`}</div>
            <div>{interval.exerciseName}</div>
            <div>{interval.duration} minutes</div>
            <div>{interval.intensityValue} {interval.intensityUnit}</div>
            <div>{interval.intervalNotes}</div>
          </div>
        ))}
        <div className="grid grid-cols-5 gap-2 py-2 items-center text-sm border-t mt-2 bg-purple-50 text-purple-700 font-semibold">
          <div className="col-span-2">Total Duration: {totalDuration} minutes</div>
          <div>Total Work Duration: {totalWorkDuration} minutes</div>
          <div className="col-span-2 text-left break-words">Notes: {exercise.notes || ''}</div>
        </div>
      </div>
    </div>
  );
}