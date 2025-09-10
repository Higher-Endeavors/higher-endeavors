import React, { useState } from 'react';
import { HiX, HiCog, HiRefresh } from 'react-icons/hi';
import type { StructuralAdjustmentOptions, VolumeAdjustment } from './VolumeAdjustmentTypes';

interface StructuralAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (adjustment: VolumeAdjustment) => void;
  currentWeek: number;
  currentSettings: any;
  totalWeeks: number;
}

export default function StructuralAdjustmentModal({
  isOpen,
  onClose,
  onApply,
  currentWeek,
  currentSettings,
  totalWeeks
}: StructuralAdjustmentModalProps) {
  const [newBaselineVolume, setNewBaselineVolume] = useState(currentSettings.baselineVolume);
  const [newPeakVolume, setNewPeakVolume] = useState(currentSettings.peakVolume);
  const [newRampRate, setNewRampRate] = useState(currentSettings.rampRate);
  const [newDeloadFrequency, setNewDeloadFrequency] = useState(currentSettings.deloadEvery);
  const [recalculateFromWeek, setRecalculateFromWeek] = useState(currentWeek);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    const adjustment: VolumeAdjustment = {
      id: `structural-${Date.now()}`,
      type: 'structural',
      weekNumber: recalculateFromWeek,
      reason: reason || 'Structural plan adjustment',
      description: `Plan restructured from week ${recalculateFromWeek + 1} with new baseline: ${newBaselineVolume}min, peak: ${newPeakVolume}min`,
      appliedAt: new Date(),
      volumeMultiplier: 1, // Will be recalculated
      createdBy: 'user',
      notes: notes || undefined,
    };

    onApply(adjustment);
    onClose();
  };

  const remainingWeeks = totalWeeks - recalculateFromWeek;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiCog className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-800">Structural Plan Adjustment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <HiRefresh className="h-4 w-4" />
              <span className="text-sm font-medium">Plan Restructure</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              This will recalculate the entire plan from week {recalculateFromWeek + 1} forward. 
              This is a permanent change that affects the plan structure.
            </p>
          </div>

          {/* Recalculate From Week */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Recalculate From Week
            </label>
            <select
              value={recalculateFromWeek}
              onChange={(e) => setRecalculateFromWeek(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {Array.from({ length: currentWeek + 1 }, (_, i) => (
                <option key={i} value={i}>
                  Week {i + 1} {i === currentWeek ? '(Current Week)' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {remainingWeeks} weeks will be recalculated
            </p>
          </div>

          {/* New Volume Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                New Baseline Volume
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newBaselineVolume}
                  onChange={(e) => setNewBaselineVolume(Number(e.target.value))}
                  className="w-full border rounded-l-lg px-3 py-2 text-sm"
                  min="0"
                />
                <span className="bg-slate-100 border border-l-0 rounded-r-lg px-3 py-2 text-sm text-slate-600">
                  min
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                New Peak Volume
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newPeakVolume}
                  onChange={(e) => setNewPeakVolume(Number(e.target.value))}
                  className="w-full border rounded-l-lg px-3 py-2 text-sm"
                  min="0"
                />
                <span className="bg-slate-100 border border-l-0 rounded-r-lg px-3 py-2 text-sm text-slate-600">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Ramp Rate and Deload */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                New Ramp Rate
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newRampRate}
                  onChange={(e) => setNewRampRate(Number(e.target.value))}
                  className="w-full border rounded-l-lg px-3 py-2 text-sm"
                  min="4"
                  max="12"
                />
                <span className="bg-slate-100 border border-l-0 rounded-r-lg px-3 py-2 text-sm text-slate-600">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Deload Frequency
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newDeloadFrequency}
                  onChange={(e) => setNewDeloadFrequency(Number(e.target.value))}
                  className="w-full border rounded-l-lg px-3 py-2 text-sm"
                  min="2"
                  max="5"
                />
                <span className="bg-slate-100 border border-l-0 rounded-r-lg px-3 py-2 text-sm text-slate-600">
                  wks
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Reason for Restructure
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a reason</option>
              <option value="Injury Recovery">Injury Recovery</option>
              <option value="Goal Change">Goal Change</option>
              <option value="Schedule Change">Schedule Change</option>
              <option value="Performance Plateau">Performance Plateau</option>
              <option value="Coach Recommendation">Coach Recommendation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the changes and their rationale..."
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
            />
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
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Restructure Plan
          </button>
        </div>
      </div>
    </div>
  );
}
