import React, { useState } from 'react';
import { SessionFeedback } from '../../shared/types';

interface SessionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: SessionFeedback) => void;
}

const FEELING_OPTIONS = ['Weak', 'Average', 'Strong'] as const;
const ENERGY_OPTIONS = ['Fatigued', 'Normal', 'Energetic'] as const;
const SORENESS_OPTIONS = ['None', 'Mild', 'Moderate', 'Severe'] as const;

export default function SessionFeedbackModal({
  isOpen,
  onClose,
  onSubmit
}: SessionFeedbackModalProps) {
  const [feedback, setFeedback] = useState<SessionFeedback>({
    feeling: 'Average',
    energyLevel: 'Normal',
    musclePump: 'Medium',
    notes: '',
    nextDaySoreness: 'None',
    nextDayFeeling: 'Average',
    nextDayEnergyLevel: 'Normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Session Feedback</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Feeling */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling?
            </label>
            <div className="flex space-x-4">
              {FEELING_OPTIONS.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    value={option}
                    checked={feedback.feeling === option}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, feeling: e.target.value as any }))
                    }
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Level
            </label>
            <div className="flex space-x-4">
              {ENERGY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    value={option}
                    checked={feedback.energyLevel === option}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, energyLevel: e.target.value as any }))
                    }
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Muscle Pump */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Pump
            </label>
            <div className="flex space-x-4">
              {['Low', 'Medium', 'High'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    value={option}
                    checked={feedback.musclePump === option}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, musclePump: e.target.value as 'Low' | 'Medium' | 'High' }))
                    }
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Next Day Expectations */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Expected Next Day Recovery</h3>
            
            {/* Next Day Soreness */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Expected Soreness Level
              </label>
              <div className="flex space-x-4">
                {SORENESS_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      value={option}
                      checked={feedback.nextDaySoreness === option}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, nextDaySoreness: e.target.value as any }))
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Next Day Feeling */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Expected Overall Feeling
              </label>
              <div className="flex space-x-4">
                {FEELING_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      value={option}
                      checked={feedback.nextDayFeeling === option}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, nextDayFeeling: e.target.value as any }))
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Next Day Energy */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Expected Energy Level
              </label>
              <div className="flex space-x-4">
                {ENERGY_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      value={option}
                      checked={feedback.nextDayEnergyLevel === option}
                      onChange={(e) =>
                        setFeedback((prev) => ({ ...prev, nextDayEnergyLevel: e.target.value as any }))
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={feedback.notes}
              onChange={(e) =>
                setFeedback((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional comments about the session..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 