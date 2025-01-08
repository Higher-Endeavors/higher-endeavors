'use client';

import React from 'react';
import Select from 'react-select';

interface ProgramSettingsProps {
  name: string;
  phaseFocus: string;
  periodizationType: string;
  onSettingsChange: (key: string, value: string) => void;
}

const phaseFocusOptions = [
  { value: 'GPP', label: 'General Physical Preparedness' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Hypertrophy', label: 'Hypertrophy' },
  { value: 'Intensification', label: 'Intensification' },
  { value: 'Accumulation', label: 'Accumulation' }
];

const periodizationOptions = [
  { value: 'Linear', label: 'Linear Progression' },
  { value: 'Undulating', label: 'Undulating Periodization' },
  { value: 'Custom', label: 'Custom Progression' }
];

export default function ProgramSettings({
  name,
  phaseFocus,
  periodizationType,
  onSettingsChange
}: ProgramSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Program Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Program Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onSettingsChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900   dark:placeholder-gray-300"
          placeholder="Enter program name"
        />
      </div>

      {/* Phase/Focus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phase/Focus
        </label>
        <Select
          options={phaseFocusOptions}
          value={phaseFocusOptions.find(option => option.value === phaseFocus)}
          onChange={(option) => option && onSettingsChange('phaseFocus', option.value)}
          className="basic-single"
          classNamePrefix="select"
        />
        <p className="mt-1 text-sm text-gray-500">
          Select the primary focus of this training program
        </p>
      </div>

      {/* Periodization Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Periodization Type
        </label>
        <Select
          options={periodizationOptions}
          value={periodizationOptions.find(option => option.value === periodizationType)}
          onChange={(option) => option && onSettingsChange('periodizationType', option.value)}
          className="basic-single"
          classNamePrefix="select"
        />
        <p className="mt-1 text-sm text-gray-500">
          Choose how the program will progress over time
        </p>
      </div>

      {/* Progression Settings */}
      {periodizationType === 'Linear' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Linear Progression Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Volume Increment (%)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="5"
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Load Increment (%)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="2.5"
                min="0"
                max="100"
                step="0.5"
              />
            </div>
          </div>
        </div>
      )}

      {periodizationType === 'Undulating' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Undulating Progression Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Week 1 Volume (%)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="100"
                min="0"
                max="100"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Week 2 Volume (%)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="50"
                min="0"
                max="100"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Week 3 Volume (%)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="75"
                min="0"
                max="100"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Week 4 Volume (%)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="25"
                min="0"
                max="100"
                step="5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Volume Targets */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700">Volume Targets</h3>
        <p className="text-sm text-gray-500">
          Set target volumes for specific muscle groups or the overall session
        </p>
        {/* Volume targets will be implemented in a separate component */}
      </div>
    </div>
  );
} 