'use client';

import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

interface ExerciseItemProps {
  exercise: {
    id: string;
    name: string;
    pairing: string;
    sets: number;
    planned_sets: Array<{
      set_number?: number;
      planned_reps?: number;
      planned_load?: number;
      load_unit?: string;
      planned_tempo?: string;
      planned_rest?: number;
      sub_sets?: Array<{
        planned_reps?: number;
        planned_load?: number;
        load_unit?: string;
      }>;
    }>;
    notes?: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ExerciseItem({ exercise, onEdit, onDelete }: ExerciseItemProps) {
  const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (id: string) => {
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

  const calculateTut = (reps: number, tempo: string) => {
    // Placeholder calculation
    return reps * 4;
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Sets x Reps</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.planned_sets.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  Set {set.set_number || idx + 1}: {set.planned_reps || 0} reps
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Load</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.planned_sets.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  {formatLoad(set.planned_load || 0, set.load_unit || 'lbs')}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Tempo</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.planned_sets.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  {set.planned_tempo || '2010'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Rest</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.planned_sets.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  {set.planned_rest || 0}s
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">Time Under Tension</span>
          <div className="font-medium dark:text-slate-900">
            {exercise.planned_sets.map((set, idx) => (
              <div key={idx}>
                <span className="font-medium dark:text-slate-900">
                  {calculateTut(set.planned_reps || 0, set.planned_tempo || '2010')}s
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm font-medium text-purple-700">
            <div>
              <span className="mr-1">Total Reps:</span>
              <span>{exercise.planned_sets.reduce((sum, set) => sum + (set.planned_reps || 0), 0)}</span>
            </div>
            <div>
              <span className="mr-1">Total Load:</span>
              <span>{exercise.planned_sets.reduce((sum, set) => sum + (set.planned_load || 0), 0)} {exercise.planned_sets[0]?.load_unit || 'lbs'}</span>
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