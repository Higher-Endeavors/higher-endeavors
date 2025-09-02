'use client';

import React from 'react';
import ActivityItem from './ActivityItem';
import type { CMEExercise } from '../types/cme.zod';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface ActivityListProps {
  activities: CMEExercise[];
  onEditActivity: (activityId: number) => void;
  onDeleteActivity: (activityId: number) => void;
  userHeartRateZones?: any[]; // Add this prop for heart rate zone data
}

export default function ActivityList({ activities, onEditActivity, onDeleteActivity, userHeartRateZones }: ActivityListProps) {
  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Activity List</h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium mb-2">No Activities Added</p>
          <p className="text-sm">Add your first activity to get started with your cardio session</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.activityId}
              activity={activity}
              onEdit={onEditActivity}
              onDelete={onDeleteActivity}
              userHeartRateZones={userHeartRateZones}
            />
          ))}
        </div>
      )}
    </div>
  );
}