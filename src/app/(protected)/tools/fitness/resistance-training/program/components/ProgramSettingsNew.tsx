'use client';

import { useMemo, useRef, useState } from 'react';

type ProgressionSettingsData = {
  type: 'None' | 'Linear' | 'Undulating';
  settings?: {
    volume_increment_percentage?: number;
    load_increment_percentage?: number;
    weekly_volume_percentages?: number[];
  };
};

interface ProgramSettingsNewProps {
  programName: string;
  setProgramName: (name: string) => void;
  isLoading?: boolean;
  resistPhaseId?: number;
  setResistPhaseId?: (phaseId: number | undefined) => void;
  resistPeriodizationId?: number;
  availablePhases?: Array<{ resistPhaseId: number; resistPhaseName: string }>;
  availablePeriodizationTypes?: Array<{ resistPeriodizationId: number; resistPeriodizationName: string }>;
  programLength?: number;
  setProgramLength?: (length: number) => void;
  sessionsPerWeek?: number;
  setSessionsPerWeek?: (sessions: number) => void;
  autoIncrement?: 'yes' | 'no';
  onPeriodizationChange?: (periodizationId: number) => void;
  onAutoIncrementChange?: (value: 'yes' | 'no') => void;
  onVolumeIncrementChange?: (value: string) => void;
  onLoadIncrementChange?: (value: string) => void;
  onWeeklyVolumePercentagesChange?: (volumes: string[]) => void;
  notes?: string;
  setNotes?: (notes: string) => void;
  tierContinuumId?: number;
  setTierContinuumId?: (id: number) => void;
  selectedCategories?: number[];
  setSelectedCategories?: (categories: number[]) => void;
  isAdmin?: boolean;
  isTemplateProgram?: boolean;
  availableTierContinuum?: Array<{ tierContinuumId: number; tierContinuumName: string }>;
  availableTemplateCategories?: Array<{ resistProgramTemplateCategoriesId: number; categoryName: string; description?: string | null }>;
  volumeIncrement?: string;
  loadIncrement?: string;
  weeklyVolumePercentages?: string[];
  totalInstances?: number;
}

export default function ProgramSettingsNew({
  programName,
  setProgramName,
  isLoading = false,
  resistPhaseId,
  setResistPhaseId,
  resistPeriodizationId = 1,
  availablePhases = [],
  availablePeriodizationTypes = [],
  programLength = 4,
  setProgramLength,
  sessionsPerWeek = 1,
  setSessionsPerWeek,
  volumeIncrement = '0',
  loadIncrement = '0',
  weeklyVolumePercentages = ['100', '70', '110', '50'],
  totalInstances,
  autoIncrement = 'no',
  onPeriodizationChange,
  onAutoIncrementChange,
  onVolumeIncrementChange,
  onLoadIncrementChange,
  onWeeklyVolumePercentagesChange,
  notes = '',
  setNotes,
  availableTierContinuum = [],
  availableTemplateCategories = [],
  isAdmin = false,
  tierContinuumId,
  setTierContinuumId,
  selectedCategories = [],
  setSelectedCategories,
}: ProgramSettingsNewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);
  const [programLengthInput, setProgramLengthInput] = useState(String(programLength));
  const [sessionsPerWeekInput, setSessionsPerWeekInput] = useState(String(sessionsPerWeek));
  const programLengthDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const derivedInstanceCount = Math.max(Math.round(programLength * sessionsPerWeek), 1);
  const resolvedInstanceCount = totalInstances ?? derivedInstanceCount;
  const instanceVolumes = useMemo(() => {
    const defaults = ['100', '70', '110', '50'];
    const source = weeklyVolumePercentages.length > 0 ? weeklyVolumePercentages : defaults;
    if (source.length >= resolvedInstanceCount) {
      return source.slice(0, resolvedInstanceCount);
    }
    const extended = [...source];
    while (extended.length < resolvedInstanceCount) {
      extended.push(defaults[extended.length] ?? '100');
    }
    return extended;
  }, [weeklyVolumePercentages, resolvedInstanceCount]);

  const resetProgramLengthInput = (value: number) => {
    setProgramLengthInput(String(value));
  };

  const resetSessionsPerWeekInput = (value: number) => {
    setSessionsPerWeekInput(String(value));
  };

  const phaseOptions = useMemo(
    () =>
      availablePhases.map(phase => ({
        value: String(phase.resistPhaseId),
        label: phase.resistPhaseName,
      })),
    [availablePhases]
  );

  const periodizationOptions = useMemo(
    () =>
      availablePeriodizationTypes.map(periodization => ({
        value: String(periodization.resistPeriodizationId),
        label: periodization.resistPeriodizationName,
      })),
    [availablePeriodizationTypes]
  );

  const tierOptions = useMemo(
    () =>
      availableTierContinuum.map(tier => ({
        value: String(tier.tierContinuumId),
        label: tier.tierContinuumName,
      })),
    [availableTierContinuum]
  );

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
    if (!onPeriodizationChange) {
      return;
    }

    const numericValue = Number.parseInt(value, 10);

    if (Number.isNaN(numericValue)) {
      return;
    }

    onPeriodizationChange(numericValue);
  };

  const handleProgramLengthChange = (value: string) => {
    setProgramLengthInput(value);

    if (!setProgramLength) {
      return;
    }

    if (programLengthDebounceRef.current) {
      clearTimeout(programLengthDebounceRef.current);
    }

    programLengthDebounceRef.current = setTimeout(() => {
      const parsed = Number.parseInt(value, 10);

      if (Number.isNaN(parsed)) {
        return;
      }

      const clamped = Math.min(Math.max(parsed, 1), 52);
      setProgramLength(clamped);
      resetProgramLengthInput(clamped);
      const nextInstanceCount = totalInstances ?? Math.max(Math.round(clamped * sessionsPerWeek), 1);
      const defaults = ['100', '70', '110', '50'];
      const base = instanceVolumes.length > 0 ? [...instanceVolumes] : [...defaults];
      if (base.length >= nextInstanceCount) {
        onWeeklyVolumePercentagesChange?.(base.slice(0, nextInstanceCount));
      } else {
        while (base.length < nextInstanceCount) {
          base.push(defaults[base.length] ?? '100');
        }
        onWeeklyVolumePercentagesChange?.(base);
      }
    }, 200);
  };

  const handleProgramLengthBlur = () => {
    if (!setProgramLength) {
      return;
    }

    const parsed = Number.parseInt(programLengthInput, 10);

    if (Number.isNaN(parsed) || parsed < 1) {
      const minValue = 1;
      setProgramLength(minValue);
      resetProgramLengthInput(minValue);
      return;
    }

    if (parsed > 52) {
      const maxValue = 52;
      setProgramLength(maxValue);
      resetProgramLengthInput(maxValue);
      return;
    }

    setProgramLength(parsed);
    resetProgramLengthInput(parsed);
  };

  const handleSessionsPerWeekChange = (value: string) => {
    setSessionsPerWeekInput(value);

    if (!setSessionsPerWeek) {
      return;
    }

    const parsed = Number.parseFloat(value);

    if (Number.isNaN(parsed)) {
      return;
    }

    const clamped = Math.min(Math.max(parsed, 1), 7);
    const normalized = Number.isInteger(clamped) ? clamped : Number(clamped.toFixed(1));
    setSessionsPerWeek(normalized);
    resetSessionsPerWeekInput(normalized);
    const nextInstanceCount = totalInstances ?? Math.max(Math.round(programLength * normalized), 1);
    const defaults = ['100', '70', '110', '50'];
    const base = instanceVolumes.length > 0 ? [...instanceVolumes] : [...defaults];
    if (base.length >= nextInstanceCount) {
      onWeeklyVolumePercentagesChange?.(base.slice(0, nextInstanceCount));
    } else {
      while (base.length < nextInstanceCount) {
        base.push(defaults[base.length] ?? '100');
      }
      onWeeklyVolumePercentagesChange?.(base);
    }
  };

  const handleSessionsPerWeekBlur = () => {
    if (!setSessionsPerWeek) {
      return;
    }

    const parsed = Number.parseFloat(sessionsPerWeekInput);

    if (Number.isNaN(parsed) || parsed < 1) {
      const minValue = 1;
      setSessionsPerWeek(minValue);
      resetSessionsPerWeekInput(minValue);
      return;
    }

    if (parsed > 7) {
      const maxValue = 7;
      setSessionsPerWeek(maxValue);
      resetSessionsPerWeekInput(maxValue);
      return;
    }

    const normalized = Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(1));
    setSessionsPerWeek(normalized);
    resetSessionsPerWeekInput(normalized);
    const nextInstanceCount = totalInstances ?? Math.max(Math.round(programLength * normalized), 1);
    const defaults = ['100', '70', '110', '50'];
    const base = instanceVolumes.length > 0 ? [...instanceVolumes] : [...defaults];
    if (base.length >= nextInstanceCount) {
      onWeeklyVolumePercentagesChange?.(base.slice(0, nextInstanceCount));
    } else {
      while (base.length < nextInstanceCount) {
        base.push(defaults[base.length] ?? '100');
      }
      onWeeklyVolumePercentagesChange?.(base);
    }
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
              value={resistPhaseId !== undefined ? String(resistPhaseId) : ''}
              onChange={event => handlePhaseChange(event.target.value)}
              disabled={phaseOptions.length === 0 || !setResistPhaseId}
            >
              <option value="" disabled>
                Select Phase...
              </option>
              {phaseOptions.map(option => (
                <option key={option.value} value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500" id="program-phase-helper">
              Choose the primary focus associated with this program
            </p>
            {phaseOptions.length === 0 && (
              <p className="mt-1 text-sm text-red-600">No phases available. Please ensure the lookup data is seeded.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="program-periodization-select">
              Periodization Type
            </label>
            <select
              id="program-periodization-select"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              value={resistPeriodizationId !== undefined ? String(resistPeriodizationId) : ''}
              onChange={event => handlePeriodizationChange(event.target.value)}
              disabled={periodizationOptions.length === 0 || !onPeriodizationChange}
            >
              <option value="" disabled>
                Select Periodization...
              </option>
              {periodizationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500" id="program-periodization-helper">
              Choose how the program will progress over time
            </p>
            {periodizationOptions.length === 0 && (
              <p className="mt-1 text-sm text-red-600">No periodization types available. Please ensure the lookup data is seeded.</p>
            )}
          </div>

          {(resistPeriodizationId === 2 || resistPeriodizationId === 3) && onAutoIncrementChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="auto-increment-select">
                Auto-increment Progressions?
              </label>
              <select
                id="auto-increment-select"
                className="mt-1 block w-48 rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                value={autoIncrement}
                onChange={event => onAutoIncrementChange(event.target.value === 'yes' ? 'yes' : 'no')}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          )}

          {resistPeriodizationId === 2 && autoIncrement === 'yes' && onVolumeIncrementChange && onLoadIncrementChange && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">Progression Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="volume-increment-input">
                    Volume Increment (%)
                  </label>
                  <input
                    id="volume-increment-input"
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                    placeholder="0"
                    value={volumeIncrement}
                    onChange={event => onVolumeIncrementChange(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="load-increment-input">
                    Load Increment (%)
                  </label>
                  <input
                    id="load-increment-input"
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                    placeholder="0"
                    value={loadIncrement}
                    onChange={event => onLoadIncrementChange(event.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {resistPeriodizationId === 3 && autoIncrement === 'yes' && onWeeklyVolumePercentagesChange && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">Progression Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {instanceVolumes.map((value, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`instance-volume-${index}`}>
                      Instance {index + 1} Volume (%)
                    </label>
                    <input
                      id={`instance-volume-${index}`}
                      type="number"
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                      placeholder="100"
                      value={value}
                      onChange={event => {
                        const updated = [...instanceVolumes];
                        updated[index] = event.target.value;
                        onWeeklyVolumePercentagesChange(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="program-notes">
              Program Notes
            </label>
            <textarea
              id="program-notes"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              rows={4}
              placeholder="Enter program notes (optional)"
              value={notes}
              onChange={event => setNotes?.(event.target.value)}
              disabled={!setNotes}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add any additional notes or comments about the program
            </p>
          </div>

          {isAdmin && setTierContinuumId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tier-continuum-select">
                Tier Continuum
              </label>
              <select
                id="tier-continuum-select"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                value={tierContinuumId !== undefined ? String(tierContinuumId) : ''}
                onChange={event => {
                  const { value } = event.target;

                  if (!value) {
                    return;
                  }

                  const parsed = Number.parseInt(value, 10);

                  if (Number.isNaN(parsed)) {
                    return;
                  }

                  setTierContinuumId(parsed);
                }}
                disabled={tierOptions.length === 0}
              >
                <option value="" disabled>
                  Select Tier Continuum...
                </option>
                {tierOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Set the Tier Continuum level for templates created from this program
              </p>
              {tierOptions.length === 0 && (
                <p className="mt-1 text-sm text-red-600">No tier continuum entries available.</p>
              )}
            </div>
          )}

          {isAdmin && setSelectedCategories && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Categories
              </label>
              {availableTemplateCategories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available.</p>
              ) : (
                <div className="space-y-2">
                  {availableTemplateCategories.map(category => (
                    <label key={category.resistProgramTemplateCategoriesId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedCategories.includes(category.resistProgramTemplateCategoriesId)}
                        onChange={event => {
                          if (event.target.checked) {
                            setSelectedCategories([...selectedCategories, category.resistProgramTemplateCategoriesId]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.resistProgramTemplateCategoriesId));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-700">
                        {category.categoryName}
                        {category.description && (
                          <span className="text-xs text-gray-500 ml-1">- {category.description}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the categories this template belongs to
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}


