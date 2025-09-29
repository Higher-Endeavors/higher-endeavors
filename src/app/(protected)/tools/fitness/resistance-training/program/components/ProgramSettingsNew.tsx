'use client';

import { useState } from 'react';

interface ProgramSettingsNewProps {
  programName: string;
  setProgramName: (name: string) => void;
  isLoading?: boolean;
  resistPhaseId?: number;
  setResistPhaseId?: (phaseId: number | undefined) => void;
  availablePhases?: Array<{ resistPhaseId: number; resistPhaseName: string; description?: string | null }>;
  resistPeriodizationId?: number;
  setResistPeriodizationId?: (periodizationId: number) => void;
  availablePeriodizations?: Array<{ resistPeriodizationId: number; resistPeriodizationName: string; description?: string | null }>;
}

export default function ProgramSettingsNew({
  programName,
  setProgramName,
  isLoading = false,
  resistPhaseId,
  setResistPhaseId,
  availablePhases = [],
  resistPeriodizationId = 1,
  setResistPeriodizationId,
  availablePeriodizations = [],
}: ProgramSettingsNewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleProgramNameChange = (value: string) => {
    if (nameError) {
      setNameError(null);
    }
    setProgramName(value);
  };

  const handleProgramNameBlur = () => {
    const trimmedValue = programName.trim();

    if (!trimmedValue) {
      setNameError('Program name is required');
      setProgramName('');
      return;
    }

    if (trimmedValue !== programName) {
      setProgramName(trimmedValue);
    }
  };

  const handlePhaseChange = (value: string) => {
    if (!setResistPhaseId) {
      return;
    }

    if (!value) {
      setResistPhaseId(undefined);
      return;
    }

    const numericValue = Number.parseInt(value, 10);

    if (Number.isNaN(numericValue)) {
      setResistPhaseId(undefined);
      return;
    }

    setResistPhaseId(numericValue);
  };

  const handlePeriodizationChange = (value: string) => {
    if (!setResistPeriodizationId) {
      return;
    }

    const numericValue = Number.parseInt(value, 10);

    if (Number.isNaN(numericValue)) {
      return;
    }

    setResistPeriodizationId(numericValue);
  };

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(previous => !previous)}
        role="button"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(previous => !previous);
          }
        }}
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Program Settings</h2>
        <span className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <form className="space-y-6 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
              <span className="text-blue-600 dark:text-blue-400">Loading program...</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="program-name-input">
              Program Name
            </label>
            <input
              id="program-name-input"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              placeholder="Enter program name"
              value={programName}
              onChange={event => handleProgramNameChange(event.target.value)}
              onBlur={handleProgramNameBlur}
              required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'program-name-error' : 'program-name-helper'}
            />
            <p id="program-name-helper" className="mt-1 text-sm text-gray-500">
              Set the name that will appear alongside this training program
            </p>
            {nameError && (
              <p id="program-name-error" className="mt-1 text-sm text-red-600">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="program-phase-select">
              Phase
            </label>
            <select
              id="program-phase-select"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              value={resistPhaseId ?? ''}
              onChange={event => handlePhaseChange(event.target.value)}
            >
              <option value="" disabled>
                Select Phase...
              </option>
              {availablePhases.map(phase => (
                <option key={phase.resistPhaseId} value={phase.resistPhaseId}>
                  {phase.resistPhaseName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500" id="program-phase-helper">
              Choose the primary focus associated with this program
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="program-periodization-select">
              Periodization Type
            </label>
            <select
              id="program-periodization-select"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              value={resistPeriodizationId}
              onChange={event => handlePeriodizationChange(event.target.value)}
            >
              {availablePeriodizations.map(periodization => (
                <option key={periodization.resistPeriodizationId} value={periodization.resistPeriodizationId}>
                  {periodization.resistPeriodizationName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500" id="program-periodization-helper">
              Choose how the program will progress over time
            </p>
          </div>
        </form>
      )}
    </div>
  );
}


