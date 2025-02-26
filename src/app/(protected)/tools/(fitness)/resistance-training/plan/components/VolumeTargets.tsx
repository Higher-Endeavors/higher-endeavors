'use client';

import React, { useState } from 'react';
import Select from 'react-select';

interface VolumeTarget {
  id: string;
  type: 'session' | 'weekly' | 'exercise';
  muscleGroupId?: number;
  exerciseId?: number;
  repVolumeTarget?: number;
  loadVolumeTarget?: number;
  timeUnderTensionTarget?: number;
}

interface VolumeTargetsProps {
  targets: VolumeTarget[];
  onTargetChange: (targets: VolumeTarget[]) => void;
  muscleGroups: Array<{ id: number; name: string }>;
}

export default function VolumeTargets({
  targets,
  onTargetChange,
  muscleGroups
}: VolumeTargetsProps) {
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
    const newTarget: VolumeTarget = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedType
    };
    onTargetChange([...targets, newTarget]);
  };

  const handleTargetChange = (id: string, field: string, value: any) => {
    const updatedTargets = targets.map(target => {
      if (target.id === id) {
        return { ...target, [field]: value };
      }
      return target;
    });
    onTargetChange(updatedTargets);
  };

  const handleRemoveTarget = (id: string) => {
    const updatedTargets = targets.filter(target => target.id !== id);
    onTargetChange(updatedTargets);
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
        {targets.map((target) => (
          <div
            key={target.id}
            className="p-4 border rounded-lg bg-white space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">
                {target.type.charAt(0).toUpperCase() + target.type.slice(1)} Target
              </h4>
              <button
                onClick={() => handleRemoveTarget(target.id)}
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
                  value={muscleGroupOptions.find(
                    option => option.value === target.muscleGroupId?.toString()
                  )}
                  onChange={(option) => handleTargetChange(
                    target.id,
                    'muscleGroupId',
                    option ? parseInt(option.value) : undefined
                  )}
                  className="basic-single"
                  classNamePrefix="select"
                />
              </div>
            )}

            {/* Target Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rep Volume Target
                </label>
                <input
                  type="number"
                  value={target.repVolumeTarget || ''}
                  onChange={(e) => handleTargetChange(
                    target.id,
                    'repVolumeTarget',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Total reps"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Load Volume Target (kg)
                </label>
                <input
                  type="number"
                  value={target.loadVolumeTarget || ''}
                  onChange={(e) => handleTargetChange(
                    target.id,
                    'loadVolumeTarget',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Total load"
                  min="0"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Under Tension (s)
                </label>
                <input
                  type="number"
                  value={target.timeUnderTensionTarget || ''}
                  onChange={(e) => handleTargetChange(
                    target.id,
                    'timeUnderTensionTarget',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Total TUT"
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