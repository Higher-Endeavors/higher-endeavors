import React from 'react';
import { TrainingSession } from '../../shared/types';
import { format } from 'date-fns';

interface SessionListProps {
  sessions: TrainingSession[];
  selectedSessionId?: string;
  onSessionSelect: (session: TrainingSession) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'skipped':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default function SessionList({ sessions, selectedSessionId, onSessionSelect }: SessionListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Training Sessions</h2>
      </div>
      <div className="divide-y">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No sessions found
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-150 ${
                session.id === selectedSessionId ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-gray-900">
                  {format(new Date(session.scheduledDate), 'MMM d, yyyy')}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    session.status
                  )}`}
                >
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {session.exercises.length} exercises
              </div>
              {session.feedback && (
                <div className="mt-2">
                  <div className="flex space-x-4 text-xs">
                    <span className="text-gray-500">
                      Feeling: {session.feedback.feeling}
                    </span>
                    <span className="text-gray-500">
                      Energy: {session.feedback.energyLevel}
                    </span>
                  </div>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
} 