'use client';

// Commenting out DnD imports
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { exercise, ExerciseListProps } from '@/app/lib/types/pillars/fitness';
import { ExerciseItem } from './ExerciseItem';

export default function ExerciseList({ exercises, onEdit, onDelete }: ExerciseListProps) {
  // Helper function to get group key
  function getGroupKey(exercise_item: exercise): string {
    if (!exercise_item.pairing) return 'A1';
    return exercise_item.pairing;  // Return full pairing (A1, WU, CD, etc.)
  }

  // Helper function for display label
  function getGroupLabel(groupKey: string): string {
    return groupKey;  // Return full group key for display
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise_item, index) => {
        const currentGroupKey = getGroupKey(exercise_item);
        const previousGroupKey = index > 0 ? getGroupKey(exercises[index - 1]) : '';
        const isFirstInGroup = index === 0 || currentGroupKey !== previousGroupKey;

        return (
          <React.Fragment key={exercise_item.id}>
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
              exercise={exercise_item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}