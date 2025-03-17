'use client';

import React, { useState, useEffect } from 'react';
import { TrainingSession, Program } from '../shared/types';
import SessionList from './components/SessionList';
import SessionDetails from './components/SessionDetails';
import SessionFeedbackModal from './components/SessionFeedbackModal';
import { calculateSessionVolume, calculateVolumeProgress } from '../shared/utils/calculations';

export default function ActPage() {
  // State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/resistance-programs');
        const data = await response.json();
        setPrograms(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch sessions when program is selected
  useEffect(() => {
    if (selectedProgram) {
      const fetchSessions = async () => {
        try {
          const response = await fetch(`/api/resistance-sessions?programId=${selectedProgram}`);
          const data = await response.json();
          setSessions(data);
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
      };
      fetchSessions();
    }
  }, [selectedProgram]);

  // Handlers
  const handleProgramChange = (programId: string) => {
    setSelectedProgram(programId);
    setSelectedSession(null);
  };

  const handleSessionSelect = (session: TrainingSession) => {
    setSelectedSession(session);
  };

  const handleSetComplete = async (
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    actualReps: number,
    actualLoad: number,
    rpe?: number,
    rir?: number
  ) => {
    if (!selectedSession) return;

    const updatedSession = {
      ...selectedSession,
      exercises: selectedSession.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            actualSets: exercise.actualSets.map(set => {
              if (set.setNumber === setNumber) {
                return {
                  ...set,
                  actualReps,
                  actualLoad,
                  rpe,
                  rir
                };
              }
              return set;
            })
          };
        }
        return exercise;
      })
    };

    try {
      const response = await fetch('/api/resistance-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSession),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      setSelectedSession(updatedSession);
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? updatedSession : session
        )
      );
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleSessionComplete = () => {
    if (!selectedSession) return;
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    if (!selectedSession) return;

    const updatedSession = {
      ...selectedSession,
      status: 'completed',
      feedback
    };

    try {
      const response = await fetch('/api/resistance-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSession),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      setSelectedSession(updatedSession);
      setSessions(prev => 
        prev.map(session => 
          session.id === selectedSession.id ? updatedSession : session
        )
      );
      setIsFeedbackModalOpen(false);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resistance Training Sessions</h1>

      {/* Program Selection */}
      <div className="mb-6">
        <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
          Select Program
        </label>
        <select
          id="program"
          value={selectedProgram}
          onChange={(e) => handleProgramChange(e.target.value)}
          className="block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900"
        >
          <option value="">Select a program</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProgram && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Session List */}
          <div className="lg:col-span-4">
            <SessionList
              sessions={sessions}
              selectedSessionId={selectedSession?.id}
              onSessionSelect={handleSessionSelect}
            />
          </div>

          {/* Session Details */}
          <div className="lg:col-span-8">
            {selectedSession ? (
              <SessionDetails
                session={selectedSession}
                onSetComplete={handleSetComplete}
                onSessionComplete={handleSessionComplete}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a session to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <SessionFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
} 