import React, { useState } from 'react';
import type { GoalItemType } from '../lib/goal-tracker.zod';

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

// Additional options from GoalsTrainingFields
const eventTypeOptions = [
  { value: 'race', label: 'Race', description: 'Running, cycling, or other competitive races' },
  { value: 'competition', label: 'Competition', description: 'Sports competitions or tournaments' },
  { value: 'assessment', label: 'Assessment', description: 'Fitness tests or evaluations' },
  { value: 'milestone', label: 'Milestone', description: 'Significant life milestones' },
  { value: 'wedding', label: 'Wedding', description: 'Wedding or wedding-related events' },
  { value: 'vacation', label: 'Vacation', description: 'Vacation or travel' },
  { value: 'trip', label: 'Trip', description: 'Business or personal trips' },
  { value: 'work', label: 'Work', description: 'Work-related events or deadlines' },
  { value: 'personal', label: 'Personal', description: 'Personal events or occasions' },
  { value: 'other', label: 'Other', description: 'Other types of events' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Nice to have, not urgent' },
  { value: 'medium', label: 'Medium', description: 'Important but not critical' },
  { value: 'high', label: 'High', description: 'Very important, high priority' },
  { value: 'critical', label: 'Critical', description: 'Must achieve, highest priority' }
];

const trainingImpactOptions = [
  { value: 'high', label: 'High Impact', description: 'Significantly affects training schedule' },
  { value: 'medium', label: 'Medium Impact', description: 'Moderately affects training' },
  { value: 'low', label: 'Low Impact', description: 'Minimal effect on training' },
  { value: 'none', label: 'No Impact', description: 'Does not affect training' }
];

export default function AddGoalModal({ isOpen, onClose, onAdd, parentGoalId, parentGoalOptions = [], editingGoal }: AddGoalModalProps) {
  // Step-based state, initialized from editingGoal or parentGoalId
  const [goalFocus, setGoalFocus] = useState(editingGoal?.goalFocus || '');
  const [goalType, setGoalType] = useState(editingGoal?.goalType || '');
  const [goalTracking, setGoalTracking] = useState(editingGoal?.goalTracking || '');
  const [name, setName] = useState(editingGoal?.name || '');
  const [startDate, setStartDate] = useState(editingGoal?.startDate || '');
  const [endDate, setEndDate] = useState(editingGoal?.endDate || '');
  const [ongoing, setOngoing] = useState(editingGoal?.ongoing ?? false);
  const [repeatFrequency, setRepeatFrequency] = useState(editingGoal?.repeatFrequency || '');
  const [repeatInterval, setRepeatInterval] = useState(editingGoal?.repeatInterval || 1);
  const [description, setDescription] = useState(editingGoal?.notes || '');
  const [bodyWeight, setBodyWeight] = useState(editingGoal?.bodyWeight ?? '');
  const [bodyFatPercentage, setBodyFatPercentage] = useState(editingGoal?.bodyFatPercentage ?? '');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(editingGoal?.parentId || parentGoalId || null);
  const [isChildGoal, setIsChildGoal] = useState(!!(editingGoal?.parentId || parentGoalId));
  const [customMetric, setCustomMetric] = useState(editingGoal?.customMetric || '');
  const [goalValue, setGoalValue] = useState(editingGoal?.goalValue ? String(editingGoal.goalValue) : '');
  
  // Additional fields from GoalsTrainingFields
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>(editingGoal?.priority || 'medium');
  const [eventType, setEventType] = useState<'race' | 'competition' | 'assessment' | 'milestone' | 'wedding' | 'vacation' | 'trip' | 'work' | 'personal' | 'other'>(editingGoal?.eventType || 'other');
  const [location, setLocation] = useState(editingGoal?.location || '');
  const [preparationWeeks, setPreparationWeeks] = useState(editingGoal?.preparationWeeks || 0);
  const [trainingImpact, setTrainingImpact] = useState<'none' | 'low' | 'medium' | 'high'>(editingGoal?.trainingImpact || 'medium');
  const [trainingNotes, setTrainingNotes] = useState(editingGoal?.trainingNotes || '');

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
      // Additional fields from GoalsTrainingFields
      priority,
      eventType,
      location,
      preparationWeeks,
      trainingImpact,
      trainingNotes,
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
    setPriority('medium');
    setEventType('other');
    setLocation('');
    setPreparationWeeks(0);
    setTrainingImpact('medium');
    setTrainingNotes('');
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

            {/* Priority Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional fields from GoalsTrainingFields */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Event Details (Optional)</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as 'race' | 'competition' | 'assessment' | 'milestone' | 'wedding' | 'vacation' | 'trip' | 'work' | 'personal' | 'other')}
                    className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                  >
                    {eventTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                    placeholder="Where will this take place?"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Preparation Weeks</label>
                <input
                  type="number"
                  min="0"
                  max="52"
                  value={preparationWeeks}
                  onChange={e => setPreparationWeeks(parseInt(e.target.value) || 0)}
                  className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                  placeholder="How many weeks of preparation needed?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of weeks you want to prepare for this goal/event
                </p>
              </div>
            </div>

            {/* Training Impact Section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Training Impact (Optional)</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Training Impact Level</label>
                  <select
                    value={trainingImpact}
                    onChange={e => setTrainingImpact(e.target.value as 'none' | 'low' | 'medium' | 'high')}
                    className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                  >
                    {trainingImpactOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Training Notes</label>
                  <textarea
                    value={trainingNotes}
                    onChange={e => setTrainingNotes(e.target.value)}
                    className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                    rows={2}
                    placeholder="How will this affect your training? Any specific considerations?"
                  />
                </div>
              </div>
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