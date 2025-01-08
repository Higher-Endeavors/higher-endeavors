'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Exercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
}

interface ExerciseItemProps {
  exercise: Exercise;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExerciseItem = ({ exercise, onEdit, onDelete }: ExerciseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 mb-2 cursor-move hover:shadow-md transition-shadow"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 font-semibold">{exercise.pairing}</span>
          <span className="font-medium">{exercise.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(exercise.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(exercise.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
        <div>
          <span className="text-sm text-gray-500">Sets x Reps</span>
          <p className="font-medium">{exercise.sets} x {exercise.reps}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Load</span>
          <p className="font-medium">{exercise.load}kg</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Tempo</span>
          <p className="font-medium">{exercise.tempo}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Rest</span>
          <p className="font-medium">{exercise.rest}s</p>
        </div>
      </div>

      {(exercise.rpe || exercise.rir || exercise.notes) && (
        <div className="mt-3 text-sm text-gray-600">
          {exercise.rpe && <span className="mr-4">RPE: {exercise.rpe}</span>}
          {exercise.rir && <span className="mr-4">RIR: {exercise.rir}</span>}
          {exercise.notes && (
            <div className="mt-1">
              <span className="font-medium">Notes: </span>
              {exercise.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ExerciseList({ exercises, onEdit, onDelete }: ExerciseListProps) {
  return (
    <div className="space-y-2">
      {exercises.map((exercise) => (
        <ExerciseItem
          key={exercise.id}
          exercise={exercise}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
} 