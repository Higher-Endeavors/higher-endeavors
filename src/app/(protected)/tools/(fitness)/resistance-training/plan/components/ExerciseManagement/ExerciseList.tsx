'use client';

// Commenting out DnD imports
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Exercise, ExerciseListProps } from '@/app/lib/types/pillars/fitness';
import { ExerciseItem } from './ExerciseItem';


/**
 * Debug Configuration
 * Controls what types of logging are active
 * All logs are prefixed with [ExerciseList] for easy filtering
 */
const DEBUG = {
  RENDER: false,      // Component renders and updates
  STATE: false,       // State changes
  EXERCISE: false,    // Exercise data processing
  GROUPING: false,    // Exercise grouping logic
  MENU: false        // Menu state changes
};

/**
 * Debugging utilities for different component aspects
 */
const Debug = {
  render: (message: string, data?: any) => {
    if (DEBUG.RENDER) console.log(`[ExerciseList:Render] ${message}`, data || '');
  },
  state: (message: string, data?: any) => {
    if (DEBUG.STATE) console.log(`[ExerciseList:State] ${message}`, data || '');
  },
  exercise: (message: string, data?: any) => {
    if (DEBUG.EXERCISE) console.log(`[ExerciseList:Exercise] ${message}`, data || '');
  },
  grouping: (message: string, data?: any) => {
    if (DEBUG.GROUPING) console.log(`[ExerciseList:Grouping] ${message}`, data || '');
  },
  menu: (message: string, data?: any) => {
    if (DEBUG.MENU) console.log(`[ExerciseList:Menu] ${message}`, data || '');
  }
};

export default function ExerciseList({ exercises, onEdit, onDelete }: ExerciseListProps) {
  // Helper function to get group key
  function getGroupKey(exercise: Exercise): string {
    if (!exercise.pairing) return 'A1';
    return exercise.pairing;  // Return full pairing (A1, WU, CD, etc.)
  }

  // Helper function for display label
  function getGroupLabel(groupKey: string): string {
    return groupKey;  // Return full group key for display
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => {
        const currentGroupKey = getGroupKey(exercise);
        const previousGroupKey = index > 0 ? getGroupKey(exercises[index - 1]) : '';
        const isFirstInGroup = index === 0 || currentGroupKey !== previousGroupKey;

        return (
          <React.Fragment key={exercise.id}>
            {isFirstInGroup && (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">
                  Group {getGroupLabel(currentGroupKey)}
                </h3>
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            <ExerciseItem
              exercise={exercise}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}