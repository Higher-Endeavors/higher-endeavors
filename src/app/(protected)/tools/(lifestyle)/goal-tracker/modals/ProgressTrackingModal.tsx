import React, { useState } from 'react';

interface ProgressTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalName: string;
  metricLabel: string;
  onSave: (progress: { value: number; percent: number; notes: string }) => void;
}

export default function ProgressTrackingModal({ isOpen, onClose, goalName, metricLabel, onSave }: ProgressTrackingModalProps) {
  const [value, setValue] = useState<number | ''>('');
  const [percent, setPercent] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ value: value === '' ? 0 : Number(value), percent, notes });
    setValue('');
    setPercent(0);
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold mb-4">Track Progress</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
            <input
              type="text"
              value={goalName}
              disabled
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{metricLabel}</label>
            <input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value === '' ? '' : Number(e.target.value))}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              placeholder={`Enter progress in ${metricLabel}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={percent}
              onChange={e => setPercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-600 mt-1">{percent}% complete</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              rows={2}
              placeholder="Describe your progress, challenges, or next steps..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
