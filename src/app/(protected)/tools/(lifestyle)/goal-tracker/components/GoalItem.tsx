import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type GoalItemType = {
  id: string;
  name: string;
  category: string;
  metric: string;
  startDate: string;
  endDate: string;
  currentValue: number;
  targetValue: number;
  desiredRate: number; // e.g. lbs/month
  actualRate: number; // e.g. lbs/month
  notes?: string;
  status: GoalStatus;
  parentId?: string; // New: parent goal id for sub-goals
};

interface GoalItemProps {
  goal: GoalItemType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubGoal: (parentId: string) => void;
  onTrackProgress?: (id: string) => void;
  children?: React.ReactNode;
}

export default function GoalItem({ goal, onEdit, onDelete, onAddSubGoal, onTrackProgress, children }: GoalItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Calculate progress (placeholder logic)
  const progressPercent = Math.min(
    ((goal.currentValue - goal.currentValue) / (goal.targetValue - goal.currentValue)) * 100,
    100
  );
  // Placeholder for actual vs desired progress
  const actualProgress = 40; // %
  const desiredProgress = 60; // %

  // Placeholder for days remaining (in a real app, calculate from endDate)
  const daysRemaining = 42;

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen((open) => !open);
  };

  const handleMenuClose = () => setMenuOpen(false);

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-lg dark:text-slate-900">{goal.name}</span>
          <span className="text-xs text-gray-500">{goal.category} &bull; {goal.metric}</span>
        </div>
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            aria-label="Goal item options"
            aria-expanded={menuOpen}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={handleMenuClose} />
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  {/* Track Progress at the top */}
                  {goal.category === 'Other' && onTrackProgress && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onTrackProgress(goal.id);
                        handleMenuClose();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >Track Progress</button>
                  )}
                  {goal.category === 'Body Composition' && (
                    <a
                      href="/tools/body-composition"
                      className="w-full block text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={handleMenuClose}
                    >Track Progress</a>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(goal.id);
                      handleMenuClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >Edit</button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(goal.id);
                      handleMenuClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >Delete</button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onAddSubGoal(goal.id);
                      handleMenuClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >Add Sub-Goal</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-4 text-xs text-gray-700">
          <span>Start: {goal.startDate}</span>
          <span>End: {goal.endDate}</span>
          <span>Status: <span className="font-semibold capitalize">{goal.status}</span></span>
          <span className="text-blue-600 font-semibold">{daysRemaining} days remaining</span>
        </div>
        <div className="mt-2 text-gray-700">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{actualProgress}% / {desiredProgress}%</span>
          </div>
          <div className="relative w-full h-4 bg-gray-200 rounded-full">
            <div
              className="absolute left-0 top-0 h-4 bg-blue-500 rounded-full"
              style={{ width: `${actualProgress}%`, zIndex: 2 }}
            />
            <div
              className="absolute left-0 top-0 h-4 bg-green-400 opacity-50 rounded-full"
              style={{ width: `${desiredProgress}%`, zIndex: 1 }}
            />
          </div>
        </div>
        {goal.notes && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">Notes:</span> {goal.notes}
          </div>
        )}
        {/* Render sub-goals if any */}
        {children}
      </div>
    </div>
  );
}
