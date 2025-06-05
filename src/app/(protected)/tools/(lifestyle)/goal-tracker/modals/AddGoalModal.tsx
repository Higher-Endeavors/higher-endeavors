import React, { useState, useEffect } from 'react';

import type { GoalItemType } from '../components/GoalItem';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: any) => void;
  parentGoalId?: string | null;
  parentGoalOptions?: GoalItemType[];
  editingGoal?: GoalItemType | null;
}

const categoryOptions = [
  { value: '', label: 'Select a category...' },
  { value: 'Body Composition', label: 'Body Composition' },
  { value: 'Other', label: 'Other' },
];

const bodyCompSubOptions = [
  { value: 'Body Fat Loss', label: 'Body Fat Loss' },
  { value: 'Muscle Gain', label: 'Muscle Gain' },
];

const metricOptions = [
  { value: 'lbs', label: 'lbs' },
  { value: 'kg', label: 'kg' },
  { value: '%', label: '%' },
];

const goalTypeOptions = [
  { value: '', label: 'Select goal type...' },
  { value: 'habit', label: 'Habit (Process Goal)' },
  { value: 'target', label: 'Target (Outcome Goal)' },
  { value: 'average', label: 'Average' },
];

// Step 1: Goal Focus options
const goalFocusOptions = [
  { value: '', label: 'Select goal focus...' },
  { value: 'weight_loss', label: 'Weight/Body Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'other', label: 'Other' },
];

// Step 3: Goal Tracking options
const goalTrackingOptions = [
  { value: '', label: 'Select goal tracking...' },
  { value: 'body_composition', label: 'Body Composition Tracker' },
  { value: 'custom', label: 'Custom' },
];

export default function AddGoalModal({ isOpen, onClose, onAdd, parentGoalId, parentGoalOptions = [], editingGoal }: AddGoalModalProps) {
  // Step-based state
  const [goalFocus, setGoalFocus] = useState('');
  const [goalType, setGoalType] = useState('');
  const [goalTracking, setGoalTracking] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ongoing, setOngoing] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState('');
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [description, setDescription] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isChildGoal, setIsChildGoal] = useState(false);
  const [customMetric, setCustomMetric] = useState('');
  const [goalValue, setGoalValue] = useState('');

  useEffect(() => {
    if (isOpen && editingGoal) {
      // Prefill all fields for editing
      setGoalFocus(editingGoal.goalFocus || '');
      setGoalType(editingGoal.goalType || '');
      setGoalTracking(editingGoal.goalTracking || '');
      setName(editingGoal.name || '');
      setCustomMetric(editingGoal.customMetric || '');
      setGoalValue(editingGoal.goalValue ? String(editingGoal.goalValue) : '');
      setStartDate(editingGoal.startDate || '');
      setEndDate(editingGoal.endDate || '');
      setOngoing(editingGoal.ongoing ?? false);
      setRepeatFrequency(editingGoal.repeatFrequency || '');
      setRepeatInterval(editingGoal.repeatInterval || 1);
      setDescription(editingGoal.notes || '');
      setBodyWeight(editingGoal.bodyWeight ?? '');
      setBodyFatPercentage(editingGoal.bodyFatPercentage ?? '');
      setSelectedParentId(editingGoal.parentId || null);
      setIsChildGoal(!!editingGoal.parentId);
    } else if (isOpen && !editingGoal) {
      setGoalFocus('');
      setGoalType('');
      setGoalTracking('');
      setName('');
      setCustomMetric('');
      setGoalValue('');
      setStartDate('');
      setEndDate('');
      setOngoing(false);
      setRepeatFrequency('');
      setRepeatInterval(1);
      setDescription('');
      setBodyWeight('');
      setBodyFatPercentage('');
      if (parentGoalId) {
        setIsChildGoal(true);
        setSelectedParentId(parentGoalId);
      } else {
        setIsChildGoal(false);
        setSelectedParentId(null);
      }
    }
  }, [isOpen, editingGoal, parentGoalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalFocus || !goalType || !goalTracking) return;
    onAdd({
      id: Date.now().toString(),
      goalFocus,
      goalType,
      goalTracking,
      name,
      customMetric: goalTracking === 'custom' ? customMetric : undefined,
      goalValue: goalTracking === 'custom' ? Number(goalValue) : undefined,
      startDate,
      endDate: ongoing ? '' : endDate,
      ongoing,
      repeatFrequency: ongoing ? repeatFrequency : undefined,
      repeatInterval: ongoing ? repeatInterval : undefined,
      notes: description,
      status: 'active',
      bodyWeight: goalTracking === 'body_composition' ? bodyWeight : undefined,
      bodyFatPercentage: goalTracking === 'body_composition' ? bodyFatPercentage : undefined,
      parentId: isChildGoal ? selectedParentId || undefined : undefined,
    });
    setGoalFocus('');
    setGoalType('');
    setGoalTracking('');
    setName('');
    setCustomMetric('');
    setGoalValue('');
    setStartDate('');
    setEndDate('');
    setOngoing(false);
    setRepeatFrequency('');
    setRepeatInterval(1);
    setDescription('');
    setBodyWeight('');
    setBodyFatPercentage('');
    setSelectedParentId(null);
    setIsChildGoal(false);
    onClose();
  };

  // Helper to determine if Body Composition Tracker should be shown
  const showBodyCompTracker = goalFocus && goalType &&
    (goalFocus === 'weight_loss' || goalFocus === 'muscle_gain') && goalType === 'target';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            setGoalFocus('');
            setGoalType('');
            setGoalTracking('');
            setSelectedParentId(null);
            setIsChildGoal(false);
            setOngoing(false);
            setRepeatFrequency('');
            onClose();
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
        {/* Goal Name - always visible */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
            required
          />
        </div>
        {/* Step 1: Goal Focus */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal Focus<span className="text-red-500">*</span></label>
          <select
            value={goalFocus}
            onChange={e => {
              setGoalFocus(e.target.value);
              setGoalType('');
              setGoalTracking('');
            }}
            className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
            required
          >
            {goalFocusOptions.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''} hidden={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
          {goalFocus === '' && <div className="text-xs text-red-500 mt-1">Please select a goal focus to continue.</div>}
        </div>
        {/* Step 2: Goal Type */}
        {goalFocus && (
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type<span className="text-red-500">*</span></label>
            <select
              value={goalType}
              onChange={e => {
                setGoalType(e.target.value);
                setGoalTracking('');
              }}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              required
            >
              {goalTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ''} hidden={opt.value === ''}>
                  {opt.label}
                </option>
              ))}
            </select>
            {goalType === '' && <div className="text-xs text-red-500 mt-1">Please select a goal type to continue.</div>}
          </div>
        )}
        {/* Step 3: Goal Tracking */}
        {goalFocus && goalType && (
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Tracking<span className="text-red-500">*</span></label>
            <select
              value={goalTracking}
              onChange={e => setGoalTracking(e.target.value)}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              required
            >
              <option value="" disabled hidden>Select goal tracking...</option>
              {showBodyCompTracker && (
                <option value="body_composition">Body Composition Tracker</option>
              )}
              <option value="custom">Custom</option>
            </select>
            {goalTracking === '' && <div className="text-xs text-red-500 mt-1">Please select a goal tracking method to continue.</div>}
          </div>
        )}
        {/* Step 4: Dynamic Fields */}
        {goalFocus && goalType && goalTracking && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  checked={isChildGoal}
                  onChange={e => setIsChildGoal(e.target.checked)}
                  disabled={!!parentGoalId}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                Child Goal
              </label>
              {isChildGoal && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Parent Goal</label>
                  {parentGoalId ? (
                    <input type="text" value={parentGoalOptions.find(g => g.id === parentGoalId)?.name || ''} disabled className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2 bg-gray-100" />
                  ) : (
                    <select
                      value={selectedParentId || ''}
                      onChange={e => setSelectedParentId(e.target.value || null)}
                      className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                    >
                      <option value="">Select Parent Goal</option>
                      {parentGoalOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
            {/* Dynamic fields for Body Composition Tracker */}
            {goalTracking === 'body_composition' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Goal Body Weight</label>
                    <input
                      type="number"
                      value={bodyWeight}
                      onChange={e => setBodyWeight(e.target.value)}
                      className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                      placeholder="lbs or kg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Goal Body Fat Percentage</label>
                    <input
                      type="number"
                      value={bodyFatPercentage}
                      onChange={e => setBodyFatPercentage(e.target.value)}
                      className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                      placeholder="%"
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="flex flex-col flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                      required
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                      required
                    />
                  </div>
                </div>
              </>
            )}
            {/* Dynamic fields for Custom Tracking */}
            {goalTracking === 'custom' && (
              <>
                {/* Target (Outcome Goal) */}
                {goalType === 'target' && (
                  <div className="flex flex-row gap-2 items-end">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Goal Value</label>
                      <input
                        type="number"
                        min={1}
                        value={goalValue}
                        onChange={e => setGoalValue(e.target.value)}
                        className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                        placeholder="e.g. 10"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Tracking Metric</label>
                      <input
                        type="text"
                        value={customMetric}
                        onChange={e => setCustomMetric(e.target.value)}
                        className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                        placeholder="e.g. books, hours, pages"
                        required
                      />
                    </div>
                  </div>
                )}
                {/* Habit (Process Goal) and Average Goal Type */}
                {(goalType === 'habit' || goalType === 'average') && (
                  <>
                    <div className="flex flex-row gap-2 items-end">
                      <div className="w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Goal Value</label>
                        <input
                          type="number"
                          min={1}
                          value={goalValue}
                          onChange={e => setGoalValue(e.target.value)}
                          className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                          placeholder={goalType === 'average' ? 'e.g. 8' : 'e.g. 21'}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Tracking Metric</label>
                        <input
                          type="text"
                          value={customMetric}
                          onChange={e => setCustomMetric(e.target.value)}
                          className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                          placeholder={goalType === 'average' ? 'e.g. hours, steps, pages' : 'e.g. meals, workouts, hours'}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 mt-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className='text-gray-400'>(optional)</span></label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">Leaving Due Date blank will make this an ongoing goal.</div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 mt-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                        <input
                          type="number"
                          min={1}
                          value={repeatInterval}
                          onChange={e => setRepeatInterval(Number(e.target.value))}
                          className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                          value={repeatFrequency}
                          onChange={e => setRepeatFrequency(e.target.value)}
                          className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                          required
                        >
                          <option value="">Select frequency...</option>
                          <option value="Day">Day(s)</option>
                          <option value="Week">Week(s)</option>
                          <option value="Month">Month(s)</option>
                          <option value="Year">Year(s)</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                rows={2}
                placeholder="Describe your goal, approach, or any notes..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow"
                disabled={!goalFocus || !goalType || !goalTracking}
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 