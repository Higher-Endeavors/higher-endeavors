'use client';

import { format } from 'date-fns';
import type { BodyCompositionEntry, CircumferenceMeasurements, SkinfoldMeasurements } from '../types';
import { useState } from 'react';

interface Props {
  entries: BodyCompositionEntry[];
  selectedEntryId: string | null;
  onEntrySelect: (entryId: string) => void;
}

const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number') return 'N/A';
  return value.toFixed(1);
};

const formatDifference = (current: number | null | undefined, previous: number | null | undefined): string => {
  if (typeof current !== 'number' || typeof previous !== 'number') return 'N/A';
  const diff = current - previous;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}`;
};

const getDifferenceColor = (diff: number): string => {
  if (diff > 0) return 'text-green-600';
  if (diff < 0) return 'text-red-600';
  return 'text-gray-600';
};

export default function AssessmentReview({ entries, selectedEntryId, onEntrySelect }: Props) {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const selectedEntry = entries.find(entry => entry.id === selectedEntryId);
  const [comparisonEntryId, setComparisonEntryId] = useState<string | null>(null);
  const comparisonEntry = entries.find(entry => entry.id === comparisonEntryId);

  const renderMeasurementWithComparison = (
    label: string,
    currentValue: number | null | undefined,
    previousValue: number | null | undefined,
    unit: string
  ) => {
    const difference = typeof currentValue === 'number' && typeof previousValue === 'number' 
      ? currentValue - previousValue 
      : null;

    return (
      <div key={label} className="bg-gray-50 p-3 rounded">
        <p className="text-sm text-gray-600">{label}</p>
        <div className="flex items-baseline justify-between">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-800">
            {formatNumber(currentValue)} {unit}
          </p>
          {comparisonEntry && difference !== null && (
            <p className={`text-sm font-medium ${getDifferenceColor(difference)}`}>
              {formatDifference(currentValue, previousValue)} {unit}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label htmlFor="assessmentSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Assessment
          </label>
          <select
            id="assessmentSelect"
            value={selectedEntryId || ''}
            onChange={(e) => onEntrySelect(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
          >
            <option value="">Select an assessment</option>
            {sortedEntries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="comparisonSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Compare With (Optional)
          </label>
          <select
            id="comparisonSelect"
            value={comparisonEntryId || ''}
            onChange={(e) => setComparisonEntryId(e.target.value || null)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
            disabled={!selectedEntryId}
          >
            <option value="">Select comparison</option>
            {sortedEntries
              .filter(entry => entry.id !== selectedEntryId)
              .map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedEntry && (
        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">
            Assessment Review - {format(new Date(selectedEntry.date), 'MMMM d, yyyy h:mm a')}
            {comparisonEntry && (
              <span className="text-sm font-normal ml-2 text-gray-500">
                (Compared to {format(new Date(comparisonEntry.date), 'MMMM d, yyyy h:mm a')})
              </span>
            )}
          </h3>

          <div className="space-y-6">
            {/* Basic Measurements */}
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-700">Basic Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderMeasurementWithComparison(
                  'Weight',
                  selectedEntry.weight,
                  comparisonEntry?.weight,
                  'lbs'
                )}
                {renderMeasurementWithComparison(
                  'Body Fat Percentage',
                  selectedEntry.bodyFatPercentage,
                  comparisonEntry?.bodyFatPercentage,
                  '%'
                )}
                {renderMeasurementWithComparison(
                  'Fat Mass',
                  selectedEntry.fatMass,
                  comparisonEntry?.fatMass,
                  'lbs'
                )}
                {renderMeasurementWithComparison(
                  'Fat Free Mass',
                  selectedEntry.fatFreeMass,
                  comparisonEntry?.fatFreeMass,
                  'lbs'
                )}
              </div>
            </div>

            {/* Circumference Measurements */}
            {selectedEntry.circumferenceMeasurements && 
             Object.values(selectedEntry.circumferenceMeasurements).some(value => value > 0) && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">Circumference Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedEntry.circumferenceMeasurements)
                    .filter(([_, value]) => value > 0)
                    .map(([key, value]) => (
                      renderMeasurementWithComparison(
                        key.replace(/([A-Z])/g, ' $1').trim(),
                        value,
                        comparisonEntry?.circumferenceMeasurements?.[key as keyof CircumferenceMeasurements],
                        'cm'
                      )
                    ))}
                </div>
              </div>
            )}

            {/* Skinfold Measurements */}
            {selectedEntry.skinfoldMeasurements && 
             Object.values(selectedEntry.skinfoldMeasurements).some(value => value > 0) && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">Skinfold Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedEntry.skinfoldMeasurements)
                    .filter(([_, value]) => value > 0)
                    .map(([key, value]) => (
                      renderMeasurementWithComparison(
                        key.replace(/([A-Z])/g, ' $1').trim(),
                        value,
                        comparisonEntry?.skinfoldMeasurements?.[key as keyof SkinfoldMeasurements],
                        'mm'
                      )
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 