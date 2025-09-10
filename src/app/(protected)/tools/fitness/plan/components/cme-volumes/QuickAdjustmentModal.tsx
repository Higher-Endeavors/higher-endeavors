import React, { useState } from 'react';
import { HiX, HiExclamationCircle, HiClock } from 'react-icons/hi';
import type { QuickAdjustmentOptions, VolumeAdjustment } from './VolumeAdjustmentTypes';

interface QuickAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (adjustment: VolumeAdjustment) => void;
  currentWeek: number;
  plannedVolume: number;
  activities: Array<{ id: string; name: string; modality: string; icon: string }>;
}

const commonReasons = [
  'Sick/Illness',
  'Travel',
  'Weather',
  'Equipment Issues',
  'Work Schedule',
  'Family Commitments',
  'Other'
];

const durationOptions = [
  { value: 1, label: '1 week' },
  { value: 2, label: '2 weeks' },
  { value: 3, label: '3 weeks' },
  { value: 4, label: '4 weeks' },
];

export default function QuickAdjustmentModal({
  isOpen,
  onClose,
  onApply,
  currentWeek,
  plannedVolume,
  activities
}: QuickAdjustmentModalProps) {
  const [volumeReduction, setVolumeReduction] = useState(20);
  const [duration, setDuration] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [activityOverrides, setActivityOverrides] = useState<{[key: string]: boolean}>({});

  if (!isOpen) return null;

  const handleApply = () => {
    const adjustment: VolumeAdjustment = {
      id: `adjustment-${Date.now()}`,
      type: 'temporary',
      weekNumber: currentWeek,
      reason: reason || 'Manual adjustment',
      description: `Volume reduced by ${volumeReduction}% for ${duration} week(s)`,
      appliedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000),
      volumeMultiplier: (100 - volumeReduction) / 100,
      activityOverrides: Object.fromEntries(
        activities.map(activity => [
          activity.id,
          {
            enabled: !activityOverrides[activity.id],
            volumeMultiplier: activityOverrides[activity.id] ? 0 : (100 - volumeReduction) / 100,
          }
        ])
      ),
      createdBy: 'user',
      notes: notes || undefined,
    };

    onApply(adjustment);
    onClose();
  };

  const adjustedVolume = Math.round(plannedVolume * (100 - volumeReduction) / 100);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiExclamationCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-800">Quick Volume Adjustment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Week Info */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-slate-600">Adjusting Week {currentWeek + 1}</div>
            <div className="text-sm font-medium text-slate-800">
              Planned Volume: {plannedVolume} minutes
            </div>
          </div>

          {/* Volume Reduction */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Volume Reduction: {volumeReduction}%
            </label>
            <input
              type="range"
              min="0"
              max="80"
              value={volumeReduction}
              onChange={(e) => setVolumeReduction(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span className="font-medium text-slate-700">
                New Volume: {adjustedVolume} minutes
              </span>
              <span>80%</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a reason</option>
              {commonReasons.map(reason => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Overrides */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Skip Activities
            </label>
            <div className="space-y-2">
              {activities.map(activity => (
                <label key={activity.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activityOverrides[activity.id] || false}
                    onChange={(e) => setActivityOverrides(prev => ({
                      ...prev,
                      [activity.id]: e.target.checked
                    }))}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">
                    {activity.icon} {activity.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this adjustment..."
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800">
              <HiClock className="h-4 w-4" />
              <span className="text-sm font-medium">Temporary Adjustment</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              This adjustment will automatically revert to the original plan after {duration} week(s).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}
