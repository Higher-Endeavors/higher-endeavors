'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import { VolumeTarget } from '../../shared/types';

interface VolumeTargetsProps {
  targets: VolumeTarget[];
  onChange: (targets: VolumeTarget[]) => void;
}

const muscleGroups = [
  { id: 1, name: 'Chest' },
  { id: 2, name: 'Back' },
  { id: 3, name: 'Shoulders' },
  { id: 4, name: 'Biceps' },
  { id: 5, name: 'Triceps' },
  { id: 6, name: 'Legs' },
  { id: 7, name: 'Core' },
  { id: 8, name: 'Glutes' },
  { id: 9, name: 'Calves' },
  { id: 10, name: 'Forearms' }
];

export default function VolumeTargets({ targets, onChange }: VolumeTargetsProps) {
  const [selectedType, setSelectedType] = useState<'session' | 'weekly' | 'exercise'>('session');

  const targetTypeOptions = [
    { value: 'session', label: 'Per Session' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'exercise', label: 'Per Exercise' }
  ];

  const muscleGroupOptions = muscleGroups.map(mg => ({
    value: mg.id.toString(),
    label: mg.name
  }));

  const handleAddTarget = () => {
    onChange([
      ...targets,
      {
        muscleGroup: '',
        targetSets: 0,
        currentSets: 0
      }
    ]);
  };

  const handleRemoveTarget = (index: number) => {
    onChange(targets.filter((_, i) => i !== index));
  };

  const handleMuscleGroupChange = (index: number, value: string) => {
    const newTargets = [...targets];
    newTargets[index] = {
      ...newTargets[index],
      muscleGroup: value
    };
    onChange(newTargets);
  };

  const handleSetsChange = (index: number, value: number) => {
    const newTargets = [...targets];
    newTargets[index] = {
      ...newTargets[index],
      targetSets: value
    };
    onChange(newTargets);
  };

  return (
    <div className="space-y-4">
      {/* Add New Target */}
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Type
          </label>
          <Select
            options={targetTypeOptions}
            value={targetTypeOptions.find(option => option.value === selectedType)}
            onChange={(option) => option && setSelectedType(option.value as any)}
            className="basic-single dark:text-slate-900"
            classNamePrefix="select"
          />
        </div>
        <button
          onClick={handleAddTarget}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Target
        </button>
      </div>

      {/* Target List */}
      <div className="space-y-4">
        {targets.map((target, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-white space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">
                {target.type.charAt(0).toUpperCase() + target.type.slice(1)} Target
              </h4>
              <button
                onClick={() => handleRemoveTarget(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            {/* Muscle Group Selection (if not session type) */}
            {target.type !== 'session' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muscle Group
                </label>
                <Select
                  options={muscleGroupOptions}
                  value={muscleGroupOptions.find(option => option.value === target.muscleGroup)}
                  onChange={(option) => handleMuscleGroupChange(index, option?.value || '')}
                  className="basic-single"
                  classNamePrefix="select"
                  placeholder="Select muscle group"
                />
              </div>
            )}

            {/* Target Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Sets
                </label>
                <input
                  type="number"
                  value={target.targetSets}
                  onChange={(e) => handleSetsChange(index, parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Target sets"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Sets
                </label>
                <input
                  type="number"
                  value={target.currentSets}
                  onChange={(e) => handleSetsChange(index, parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Current sets"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 