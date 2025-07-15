'use client';

import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import React from 'react';

interface ProgramSettingsProps {
  programLength: number;
  setProgramLength: (length: number) => void;
  progressionSettings: {
    type: string;
    settings: {
      volume_increment_percentage: number;
      load_increment_percentage: number;
      weekly_volume_percentages: number[];
    };
  };
  setProgressionSettings: (settings: {
    type: string;
    settings: {
      volume_increment_percentage: number;
      load_increment_percentage: number;
      weekly_volume_percentages: number[];
    };
  }) => void;
}

export default function ProgramSettings({ programLength, setProgramLength, progressionSettings, setProgressionSettings }: ProgramSettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(false);
  const [customPhaseFocus, setCustomPhaseFocus] = useState('');
  const [inputValue, setInputValue] = useState(programLength.toString());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Keep inputValue in sync if programLength changes from outside
  useEffect(() => {
    setInputValue(programLength.toString());
  }, [programLength]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      const parsed = parseInt(inputValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setProgramLength(parsed);
      }
    },200);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [inputValue, setProgramLength]);

  const phaseFocusOptions = [
    { value: 'GPP', label: 'General Physical Preparedness (GPP)' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Hypertrophy', label: 'Hypertrophy' },
  { value: 'Power', label: 'Power' },
  { value: 'Endurance', label: 'Muscular Endurance' },
  { value: 'Recovery', label: 'Recovery' },
  { value: 'Intensification', label: 'Intensification' },
  { value: 'Accumulation', label: 'Accumulation' },
  { value: 'Other', label: 'Other (Custom)' }
  ];

  // Only None, Linear, Undulating
  const periodizationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Linear', label: 'Linear' },
    { value: 'Undulating', label: 'Undulating' }
  ];

  // Local state for periodization type and program length
  const [periodizationType, setPeriodizationType] = useState(progressionSettings.type || 'None');
  // State for progression settings
  const [autoIncrement, setAutoIncrement] = useState(progressionSettings.type !== 'None' && progressionSettings.settings.volume_increment_percentage > 0 ? 'yes' : 'no');
  const [volumeIncrement, setVolumeIncrement] = useState(progressionSettings.settings.volume_increment_percentage?.toString() || '');
  const [loadIncrement, setLoadIncrement] = useState(progressionSettings.settings.load_increment_percentage?.toString() || '');
  const [weeklyVolumes, setWeeklyVolumes] = useState((progressionSettings.settings.weekly_volume_percentages || ['100', '80', '90', '60']).map(String));

  // Update parent when progression settings change
  useEffect(() => {
    if (periodizationType === 'None' || autoIncrement === 'no') {
      setProgressionSettings({
        type: periodizationType,
        settings: {
          volume_increment_percentage: 0,
          load_increment_percentage: 0,
          weekly_volume_percentages: weeklyVolumes.map(v => Number(v)),
        },
      });
    } else if (periodizationType === 'Linear') {
      setProgressionSettings({
        type: periodizationType,
        settings: {
          volume_increment_percentage: Number(volumeIncrement) || 0,
          load_increment_percentage: Number(loadIncrement) || 0,
          weekly_volume_percentages: weeklyVolumes.map(v => Number(v)),
        },
      });
    } else if (periodizationType === 'Undulating') {
      setProgressionSettings({
        type: periodizationType,
        settings: {
          volume_increment_percentage: 0,
          load_increment_percentage: 0,
          weekly_volume_percentages: weeklyVolumes.map(v => Number(v)),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodizationType, autoIncrement, volumeIncrement, loadIncrement, weeklyVolumes]);

  // Helper to generate undulating pattern
  function getUndulatingPattern(length: number): string[] {
    if (length === 1) return ['100'];
    if (length === 2) return ['100', '70'];
    if (length === 3) return ['100', '70', '50'];
    if (length === 4) return ['100', '70', '90', '50'];
    const pattern: number[] = [100];
    let toggle = true;
    for (let i = 1; i < length - 1; i++) {
      pattern.push(toggle ? 70 : 90);
      toggle = !toggle;
    }
    pattern.push(50);
    return pattern.map(String);
  }

  // Update weeklyVolumes array if programLength changes (for Undulating)
  React.useEffect(() => {
    setWeeklyVolumes(prev => {
      if (periodizationType === 'Undulating') {
        return getUndulatingPattern(programLength);
      }
      const arr = [...prev];
      if (programLength > arr.length) {
        for (let i = arr.length; i < programLength; i++) arr.push('100');
      } else if (programLength < arr.length) {
        arr.length = programLength;
      }
      return arr;
    });
  }, [programLength, periodizationType]);

  // When periodizationType changes to Undulating, set default pattern
  React.useEffect(() => {
    if (periodizationType === 'Undulating') {
      setWeeklyVolumes(getUndulatingPattern(programLength));
    }
  }, [periodizationType, programLength]);

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
              value={periodizationOptions.find(opt => opt.value === periodizationType)}
              onChange={opt => setPeriodizationType(opt?.value || 'None')}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose how the program will progress over time
            </p>
          </div>

          {/* Auto-increment Progressions? */}
          {periodizationType !== 'None' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-increment Progressions?
              </label>
              <select
                className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                value={autoIncrement}
                onChange={e => setAutoIncrement(e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          )}

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
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Set the duration of your training program
            </p>
          </div>

          {/* Progression Settings */}
          {(periodizationType !== 'None' && autoIncrement === 'yes') && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">Progression Settings</h3>
              {periodizationType === 'Linear' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Volume Increment (%)
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                      placeholder="5"
                      value={volumeIncrement}
                      onChange={e => setVolumeIncrement(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Load Increment (%)
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                      placeholder="2.5"
                      value={loadIncrement}
                      onChange={e => setLoadIncrement(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {periodizationType === 'Undulating' && (
                <div className="grid grid-cols-2 gap-4">
                  {weeklyVolumes.map((val, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700">
                        Week {i + 1} Volume (%)
                      </label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                        placeholder="100"
                        value={val}
                        onChange={e => {
                          const newVal = e.target.value;
                          setWeeklyVolumes(prev => prev.map((v, idx) => idx === i ? newVal : v));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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