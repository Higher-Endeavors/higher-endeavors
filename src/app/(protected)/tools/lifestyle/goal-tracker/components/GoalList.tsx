import React, { useState } from 'react';
import GoalItem, { GoalItemType } from '(protected)/tools/lifestyle/goal-tracker/components/GoalItem';
import AddGoalModal from '(protected)/tools/lifestyle/goal-tracker/modals/AddGoalModal';
import ProgressTrackingModal from '(protected)/tools/lifestyle/goal-tracker/modals/ProgressTrackingModal';
import type { GoalItemType } from '../lib/goal-tracker.zod';

function buildGoalTree(goals: GoalItemType[]) {
  const goalMap: Record<string, GoalItemType & { subGoals: GoalItemType[] }> = {};
  goals.forEach(goal => {
    goalMap[goal.id] = { ...goal, subGoals: [] };
  });
  const roots: (GoalItemType & { subGoals: GoalItemType[] })[] = [];
  goals.forEach(goal => {
    if (goal.parentId) {
      goalMap[goal.parentId]?.subGoals.push(goalMap[goal.id]);
    } else {
      roots.push(goalMap[goal.id]);
    }
  });
  return roots;
}

export default function GoalList() {
  const [goals, setGoals] = useState<GoalItemType[]>([
    {
      id: '1',
      name: 'Lose 20 lbs Body Fat',
      category: 'Body Composition',
      metric: 'lbs',
      startDate: '2024-06-01',
      endDate: '2024-12-01',
      currentValue: 0,
      targetValue: 20,
      desiredRate: 3.33,
      actualRate: 2.5,
      notes: 'Focus on nutrition and resistance training.',
      status: 'active',
      priority: 'high',
      eventType: 'other',
      preparationWeeks: 0,
      trainingImpact: 'high',
      ongoing: false,
    },
    {
      id: '2',
      name: 'Gain 10 lbs Muscle',
      category: 'Body Composition',
      metric: 'lbs',
      startDate: '2024-06-01',
      endDate: '2024-12-01',
      currentValue: 0,
      targetValue: 10,
      desiredRate: 1.66,
      actualRate: 1.2,
      notes: 'Track progress monthly.',
      status: 'active',
      priority: 'high',
      eventType: 'other',
      preparationWeeks: 0,
      trainingImpact: 'high',
      ongoing: false,
    },
    {
      id: '3',
      name: 'Lose 5 lbs in Month 1',
      category: 'Body Composition',
      metric: 'lbs',
      startDate: '2024-06-01',
      endDate: '2024-07-01',
      currentValue: 0,
      targetValue: 5,
      desiredRate: 5,
      actualRate: 4,
      notes: 'First milestone.',
      status: 'active',
      parentId: '1',
      priority: 'high',
      eventType: 'milestone',
      preparationWeeks: 0,
      trainingImpact: 'high',
      ongoing: false,
    },
    {
      id: 'other-1',
      name: 'Read 10 Books',
      category: 'Other',
      metric: 'books',
      startDate: '2024-06-01',
      endDate: '2024-09-01',
      currentValue: 0,
      targetValue: 10,
      desiredRate: 3.33,
      actualRate: 2,
      notes: 'Track books read this summer.',
      status: 'active',
      priority: 'medium',
      eventType: 'other',
      preparationWeeks: 0,
      trainingImpact: 'none',
      ongoing: false,
    },
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSubGoalParentId, setAddSubGoalParentId] = useState<string | null>(null);
  const [progressModalGoalId, setProgressModalGoalId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingGoalId(id);
    setIsAddModalOpen(true);
    setAddSubGoalParentId(null);
  };

  const handleDelete = (id: string) => {
    setGoals(goals => goals.filter(goal => goal.id !== id && goal.parentId !== id));
  };

  const handleAddGoal = (goal: GoalItemType) => {
    setGoals(goals => {
      if (editingGoalId) {
        return goals.map(g => g.id === editingGoalId ? { ...g, ...goal, id: editingGoalId } : g);
      }
      return [...goals, goal];
    });
    setIsAddModalOpen(false);
    setAddSubGoalParentId(null);
    setEditingGoalId(null);
  };

  const handleAddSubGoal = (parentId: string) => {
    setAddSubGoalParentId(parentId);
    setIsAddModalOpen(true);
  };

  const handleTrackProgress = (id: string) => {
    setProgressModalGoalId(id);
  };

  const handleCloseProgressModal = () => {
    setProgressModalGoalId(null);
  };

  const handleSaveProgress = (progress: { value: number; percent: number; notes: string }) => {
    setProgressModalGoalId(null);
  };

  const handleArchive = (id: string) => {
    setGoals(goals => goals.map(goal => goal.id === id ? { ...goal, status: 'archived' } : goal));
  };

  const goalTree = buildGoalTree(goals);

  const renderGoal = (goal: GoalItemType & { subGoals: GoalItemType[] }) => (
    <GoalItem
      key={goal.id}
      goal={goal}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddSubGoal={handleAddSubGoal}
      onTrackProgress={handleTrackProgress}
      onArchive={handleArchive}
    >
      {goal.subGoals.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-blue-200 pl-4">
          {goal.subGoals.map(sub => renderGoal(sub as GoalItemType & { subGoals: GoalItemType[] }))}
        </div>
      )}
    </GoalItem>
  );

  const progressGoal = goals.find(g => g.id === progressModalGoalId);
  const editingGoal = editingGoalId ? goals.find(g => g.id === editingGoalId) : undefined;

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="space-y-4">
        {goalTree.map(goal => renderGoal(goal))}
      </div>
      <div className="mt-6 flex">
        <button
          onClick={() => { setIsAddModalOpen(true); setAddSubGoalParentId(null); setEditingGoalId(null); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Goal
        </button>
      </div>
      <AddGoalModal
        key={editingGoal?.id || 'new'}
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setAddSubGoalParentId(null); setEditingGoalId(null); }}
        onAdd={handleAddGoal}
        parentGoalId={addSubGoalParentId}
        parentGoalOptions={goals.filter(g => !g.parentId)}
        editingGoal={editingGoal}
      />
      {progressGoal && progressGoal.category === 'Other' && (
        <ProgressTrackingModal
          isOpen={!!progressModalGoalId}
          onClose={handleCloseProgressModal}
          goalName={progressGoal.name}
          metricLabel={progressGoal.metric || 'units'}
          onSave={handleSaveProgress}
        />
      )}
    </div>
  );
}
