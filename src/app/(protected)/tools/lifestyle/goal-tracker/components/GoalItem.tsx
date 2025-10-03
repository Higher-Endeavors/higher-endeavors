import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import type { GoalItemType, GoalStatus } from '../lib/goal-tracker.zod';

interface GoalItemProps {
  goal: GoalItemType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubGoal: (parentId: string) => void;
  onTrackProgress?: (id: string) => void;
  onArchive: (id: string) => void;
  children?: React.ReactNode;
}

export default function GoalItem({ goal, onEdit, onDelete, onAddSubGoal, onTrackProgress, onArchive, children }: GoalItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate progress (placeholder logic)
  const progressPercent = goal.targetValue 
    ? Math.min(
        ((goal.currentValue - goal.currentValue) / (goal.targetValue - goal.currentValue)) * 100,
        100
      )
    : 0;
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
    <div className={`bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group ${goal.status === 'archived' ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-lg dark:text-slate-900">{goal.name}</span>
          <span className="text-xs text-gray-500">{goal.category} &bull; {goal.metric}</span>
          {goal.status === 'archived' && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-300 text-gray-700 rounded">Archived</span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            aria-label="Goal item options"
            aria-expanded={menuOpen}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={goal.status === 'archived'}
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
                      onAddSubGoal(goal.id);
                      handleMenuClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >Add Child Goal</button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowArchiveConfirm(true);
                      handleMenuClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >Archive</button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteConfirm(true);
                      handleMenuClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >Delete</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-4 text-xs text-gray-700">
          <span>Start: {goal.startDate}</span>
          <span>End: {goal.endDate || 'Ongoing'}</span>
          <span>Status: <span className="font-semibold capitalize">{goal.status}</span></span>
          <span className="text-blue-600 font-semibold">{daysRemaining} days remaining</span>
        </div>
        {goal.targetValue && (
          <div className="mt-2 text-gray-700">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>
                <span className="text-blue-500">{actualProgress}%</span>
                {' / '}
                <span className="text-green-600">{desiredProgress}%</span>
              </span>
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
            <div className="flex gap-4 mt-2 text-xs items-center">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-500 rounded"></span> Actual Progress</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-400 opacity-50 rounded"></span> Desired Progress</span>
              <span className="text-gray-500">Percentages: <span className="text-blue-500">Actual</span> / <span className="text-green-600">Desired</span></span>
            </div>
          </div>
        )}
        {goal.notes && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">Notes:</span> {goal.notes}
          </div>
        )}
        {/* Render sub-goals if any */}
        {children}
      </div>
      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <div className="mb-4 text-gray-800 font-semibold">Archive this goal?</div>
            <div className="mb-4 text-sm text-gray-600">You can restore archived goals later. They will be hidden from active lists.</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-gray-200 text-gray-700" onClick={() => setShowArchiveConfirm(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-yellow-600 text-white" onClick={() => { onArchive(goal.id); setShowArchiveConfirm(false); }}>Archive</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <div className="mb-4 text-gray-800 font-semibold">Delete this goal?</div>
            <div className="mb-4 text-sm text-gray-600">This action cannot be undone. Are you sure you want to permanently delete this goal?</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-gray-200 text-gray-700" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => { onDelete(goal.id); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
