'use client';

import { useState } from 'react';
import Select from 'react-select';

export default function ProgramSettings() {
  const [isOpen, setIsOpen] = useState(true);
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(false);
  const [customPhaseFocus, setCustomPhaseFocus] = useState('');

  const phaseFocusOptions = [
    { value: 'GPP', label: 'GPP' },
    { value: 'Strength', label: 'Strength' },
    { value: 'Hypertrophy', label: 'Hypertrophy' },
    { value: 'Power', label: 'Power' },
    { value: 'Endurance', label: 'Endurance' },
    { value: 'Other', label: 'Other' }
  ];

  const periodizationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Linear', label: 'Linear' },
    { value: 'Undulating', label: 'Undulating' },
    { value: 'Block', label: 'Block' }
  ];

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Program Settings</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <form className="space-y-6 mt-4">
          {/* Program Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
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
              defaultValue={phaseFocusOptions[0]}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
            />
            {showCustomPhaseFocus && (
              <input
                type="text"
                value={customPhaseFocus}
                onChange={(e) => setCustomPhaseFocus(e.target.value)}
                placeholder="Enter custom phase/focus"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900"
              />
            )}
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
              defaultValue={periodizationOptions[0]}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose how the program will progress over time
            </p>
          </div>

          {/* Program Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Length (weeks)
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
              placeholder="4"
              min="1"
              max="52"
              step="1"
            />
            <p className="mt-1 text-sm text-gray-500">
              Set the duration of your training program
            </p>
          </div>

          {/* Program Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Notes
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              placeholder="Enter program notes (optional)"
              rows={4}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add any additional notes or comments about the program
            </p>
          </div>
        </form>
      )}
    </div>
  );
}