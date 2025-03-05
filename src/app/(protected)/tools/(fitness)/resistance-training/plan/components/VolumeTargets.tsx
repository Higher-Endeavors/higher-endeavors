'use client';

import React, { useState } from 'react';
import Select from 'react-select';

/**
 * Types that map to database structures use snake_case
 */
interface volume_target {
  id: string;
  target_type: 'session' | 'weekly' | 'exercise';
  muscle_group_id?: number;
  exercise_id?: number;
  rep_volume_target?: number;
  load_volume_target?: number;
  time_under_tension_target?: number;
}

/**
 * React-specific props interface uses camelCase
 */
interface VolumeTargetsProps {
  targets: volume_target[];
  onTargetChange: (targets: volume_target[]) => void;
  muscleGroups: Array<{ id: number; name: string }>;
}

/**
 * React-specific option types use camelCase
 */
interface SelectOption {
  value: string;
  label: string;
}

export default function VolumeTargets({
  targets,
  onTargetChange,
  muscleGroups
}: VolumeTargetsProps) {
  const [selectedType, setSelectedType] = useState<volume_target['target_type']>('session');

  const targetTypeOptions: SelectOption[] = [
    { value: 'session', label: 'Per Session' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'exercise', label: 'Per Exercise' }
  ];

  const muscleGroupOptions: SelectOption[] = muscleGroups.map(mg => ({
    value: mg.id.toString(),
    label: mg.name
  }));

  const handleAddTarget = () => {
    const newTarget: volume_target = {
      id: Math.random().toString(36).substr(2, 9),
      target_type: selectedType
    };
    onTargetChange([...targets, newTarget]);
  };

  const handleTargetChange = (id: string, field: keyof volume_target, value: any) => {
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
            onChange={(option) => option && setSelectedType(option.value as volume_target['target_type'])}
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
                {target.target_type.charAt(0).toUpperCase() + target.target_type.slice(1)} Target
              </h4>
              <button
                onClick={() => handleRemoveTarget(target.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            {/* Muscle Group Selection (if not session type) */}
            {target.target_type !== 'session' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muscle Group
                </label>
                <Select
                  options={muscleGroupOptions}
                  value={muscleGroupOptions.find(
                    option => option.value === target.muscle_group_id?.toString()
                  )}
                  onChange={(option) => handleTargetChange(
                    target.id,
                    'muscle_group_id',
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
                  value={target.rep_volume_target || ''}
                  onChange={(e) => handleTargetChange(
                    target.id,
                    'rep_volume_target',
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
                  value={target.load_volume_target || ''}
                  onChange={(e) => handleTargetChange(
                    target.id,
                    'load_volume_target',
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
                  value={target.time_under_tension_target || ''}
                  onChange={(e) => handleTargetChange(
                    target.id,
                    'time_under_tension_target',
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