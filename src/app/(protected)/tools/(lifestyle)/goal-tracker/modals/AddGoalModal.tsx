import React, { useState, useEffect } from 'react';

import type { GoalItemType } from '../components/GoalItem';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: any) => void;
  parentGoalId?: string | null;
  parentGoalOptions?: GoalItemType[];
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

export default function AddGoalModal({ isOpen, onClose, onAdd, parentGoalId, parentGoalOptions = [] }: AddGoalModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [bodyCompSub, setBodyCompSub] = useState(bodyCompSubOptions[0].value);
  const [metric, setMetric] = useState(metricOptions[0].value);
  const [customMetric, setCustomMetric] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ongoing, setOngoing] = useState(false);
  const [description, setDescription] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isChildGoal, setIsChildGoal] = useState(false);

  useEffect(() => {
    if (parentGoalId) {
      setSelectedParentId(parentGoalId);
      setIsChildGoal(true);
    } else {
      setSelectedParentId(null);
      setIsChildGoal(false);
    }
  }, [parentGoalId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      name,
      category,
      subCategory: category === 'Body Composition' ? bodyCompSub : undefined,
      metric: category === 'Other' ? customMetric : metric,
      startDate,
      endDate: ongoing ? '' : endDate,
      currentValue: 0,
      targetValue: 0,
      desiredRate: 0,
      actualRate: 0,
      notes: description,
      status: 'active',
      bodyWeight: category === 'Body Composition' ? bodyWeight : undefined,
      bodyFatPercentage: category === 'Body Composition' ? bodyFatPercentage : undefined,
      parentId: isChildGoal ? selectedParentId || undefined : undefined,
      ongoing,
    });
    setName('');
    setCategory('');
    setBodyCompSub(bodyCompSubOptions[0].value);
    setMetric(metricOptions[0].value);
    setCustomMetric('');
    setStartDate('');
    setEndDate('');
    setOngoing(false);
    setDescription('');
    setBodyWeight('');
    setBodyFatPercentage('');
    setSelectedParentId(null);
    setIsChildGoal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            setCategory('');
            setSelectedParentId(null);
            setIsChildGoal(false);
            setOngoing(false);
            onClose();
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type / Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              required
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ''} hidden={opt.value === ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {category === 'Body Composition' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Composition Goal</label>
              <select
                value={bodyCompSub}
                onChange={e => setBodyCompSub(e.target.value)}
                className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2 mb-2"
              >
                {bodyCompSubOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Body Weight</label>
                  <input
                    type="number"
                    value={bodyWeight}
                    onChange={e => setBodyWeight(e.target.value)}
                    className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                    placeholder="lbs or kg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Body Fat Percentage</label>
                  <input
                    type="number"
                    value={bodyFatPercentage}
                    onChange={e => setBodyFatPercentage(e.target.value)}
                    className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                    placeholder="%"
                  />
                </div>
              </div>
            </div>
          )}
          {category === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Tracking Metric</label>
              <input
                type="text"
                value={customMetric}
                onChange={e => setCustomMetric(e.target.value)}
                className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                placeholder="Enter custom metric (e.g. pages, hours, etc.)"
                required
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                required
              />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-between">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <label className="flex items-center gap-1 text-xs font-normal text-gray-700">
                  <input
                    type="checkbox"
                    checked={ongoing}
                    onChange={e => setOngoing(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  Ongoing
                </label>
              </div>
              {!ongoing && (
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                  required
                />
              )}
            </div>
          </div>
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
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 