'use client';

import { useState } from 'react';
import Select from 'react-select';

export default function ProgramSettings() {
  const [isOpen, setIsOpen] = useState(true);
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(false);
  const [customPhaseFocus, setCustomPhaseFocus] = useState('');
  const [autoIncrement, setAutoIncrement] = useState('no');

  const macrocyclePhaseOptions = [
    { value: 'Base', label: 'Base' },
    { value: 'Build', label: 'Build' },
    { value: 'Peak', label: 'Peak' },
    { value: 'Race/ Event', label: 'Race/ Event' },
    { value: 'Recovery/ Taper', label: 'Recovery/ Taper' },
    { value: 'Other', label: 'Other' },
    { value: 'None', label: 'None' }
  ];

  const focusBlockOptions = [
    { value: 'None', label: 'None' },
    { value: 'Aerobic Base', label: 'Aerobic Base' },
    { value: 'Tempo/ Lactate Threshold', label: 'Tempo/ Lactate Threshold' },
    { value: 'VO2 Max', label: 'VO2 Max' },
    { value: 'Anaerobic Capacity', label: 'Anaerobic Capacity' },
    { value: 'Lactate Tolerance', label: 'Lactate Tolerance' },
    { value: 'Speed / Neuromuscular Power', label: 'Speed / Neuromuscular Power' },
    { value: 'Muscular Endurance', label: 'Muscular Endurance' },
    { value: 'Race‑Pace Specificity', label: 'Race‑Pace Specificity' },
    { value: 'Concurrent/ Undulating', label: 'Concurrent/ Undulating' },
    { value: 'Polarized', label: 'Polarized' },
    { value: 'Pyramidal', label: 'Pyramidal' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Active Recovery', label: 'Active Recovery' },
    { value: 'Other', label: 'Other' }
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

          {/* Macrocycle Phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Macrocycle Phase
            </label>
            <Select
              options={macrocyclePhaseOptions}
              defaultValue={macrocyclePhaseOptions[0]}
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
              Select the phase of this training program
            </p>
          </div>

          {/* Focus Block */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Block
            </label>
            <Select
              options={focusBlockOptions}
              defaultValue={focusBlockOptions[0]}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose the focus block of this training program
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

          {/* Auto-Increment Training Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto-Increment Training Volume
            </label>
            <select
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
              value={autoIncrement}
              onChange={e => setAutoIncrement(e.target.value)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            {autoIncrement === 'yes' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekly Percentage Increase
                </label>
                <input
                  type="number"
                  className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                  placeholder="e.g. 5%"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Automatically increment the training volume each week
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