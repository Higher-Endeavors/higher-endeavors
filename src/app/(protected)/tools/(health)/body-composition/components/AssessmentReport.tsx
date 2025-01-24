import { format } from 'date-fns';
import type { BodyCompositionEntry } from '../types';

interface Props {
  entries: BodyCompositionEntry[];
  selectedEntryId: string | null;
  onEntrySelect: (entryId: string) => void;
}

const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number') return 'N/A';
  return value.toFixed(1);
};

export default function AssessmentReview({ entries, selectedEntryId, onEntrySelect }: Props) {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const selectedEntry = entries.find(entry => entry.id === selectedEntryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <label htmlFor="assessmentSelect" className="block text-sm font-medium text-gray-700">
          Select Assessment
        </label>
        <select
          id="assessmentSelect"
          value={selectedEntryId || ''}
          onChange={(e) => onEntrySelect(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
        >
          <option value="">Select an assessment</option>
          {sortedEntries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
            </option>
          ))}
        </select>
      </div>

      {selectedEntry && (
        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">
            Assessment Review - {format(new Date(selectedEntry.date), 'MMMM d, yyyy h:mm a')}
          </h3>

          <div className="space-y-6">
            {/* Basic Measurements */}
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-700">Basic Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-800">{formatNumber(selectedEntry.weight)} lbs</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Body Fat Percentage</p>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-800">
                    {formatNumber(selectedEntry.bodyFatPercentage)}%
                  </p>
                </div>
                {selectedEntry.fatMass && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Fat Mass</p>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-800">{formatNumber(selectedEntry.fatMass)} lbs</p>
                  </div>
                )}
                {selectedEntry.fatFreeMass && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Fat Free Mass</p>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-800">{formatNumber(selectedEntry.fatFreeMass)} lbs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Circumference Measurements */}
            {selectedEntry.circumferenceMeasurements && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">Circumference Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedEntry.circumferenceMeasurements)
                    .filter(([_, value]) => value > 0) // Only show measurements that were taken
                    .map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-800">{formatNumber(value)} cm</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Method-specific Measurements */}
            {selectedEntry.skinfoldMeasurements && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">Skinfold Measurements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedEntry.skinfoldMeasurements)
                    .filter(([_, value]) => value > 0) // Only show measurements that were taken
                    .map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-800">{formatNumber(value)} mm</p>
                      </div>
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