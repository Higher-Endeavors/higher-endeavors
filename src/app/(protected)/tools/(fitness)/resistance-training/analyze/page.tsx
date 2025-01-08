'use client';

import React, { useState, useEffect } from 'react';
import { Program, TrainingSession } from '../shared/types';
import VolumeChart from './components/VolumeChart';
import ProgressionChart from './components/ProgressionChart';
import FeedbackChart from './components/FeedbackChart';
import { calculateSessionVolume, calculateVolumeProgress } from '../shared/utils/calculations';

export default function AnalyzePage() {
  // State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dateRange, setDateRange] = useState<{start: Date; end: Date}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  });
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

  // Fetch sessions when program or date range changes
  useEffect(() => {
    if (selectedProgram) {
      const fetchSessions = async () => {
        try {
          const response = await fetch(
            `/api/resistance-sessions?programId=${selectedProgram}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
          );
          const data = await response.json();
          setSessions(data);
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
      };
      fetchSessions();
    }
  }, [selectedProgram, dateRange]);

  // Calculate metrics
  const calculateMetrics = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return null;

    const totalVolume = completedSessions.reduce((acc, session) => {
      const volume = calculateSessionVolume(session.exercises);
      return {
        totalReps: acc.totalReps + volume.totalReps,
        totalLoad: acc.totalLoad + volume.totalLoad,
        totalTimeUnderTension: acc.totalTimeUnderTension + volume.totalTimeUnderTension
      };
    }, {
      totalReps: 0,
      totalLoad: 0,
      totalTimeUnderTension: 0
    });

    const averages = {
      repsPerSession: totalVolume.totalReps / completedSessions.length,
      loadPerSession: totalVolume.totalLoad / completedSessions.length,
      timeUnderTensionPerSession: totalVolume.totalTimeUnderTension / completedSessions.length
    };

    return { totalVolume, averages };
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
      <h1 className="text-3xl font-bold mb-6">Training Analysis</h1>

      {/* Program Selection and Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
            Select Program
          </label>
          <select
            id="program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) =>
                setDateRange(prev => ({
                  ...prev,
                  start: new Date(e.target.value)
                }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) =>
                setDateRange(prev => ({
                  ...prev,
                  end: new Date(e.target.value)
                }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {selectedProgram && sessions.length > 0 ? (
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculateMetrics() && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Total Volume</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Total Reps</dt>
                      <dd className="text-sm font-medium">
                        {Math.round(calculateMetrics()!.totalVolume.totalReps).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Total Load (kg)</dt>
                      <dd className="text-sm font-medium">
                        {Math.round(calculateMetrics()!.totalVolume.totalLoad).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Time Under Tension (s)</dt>
                      <dd className="text-sm font-medium">
                        {Math.round(calculateMetrics()!.totalVolume.totalTimeUnderTension).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Session Averages</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Reps per Session</dt>
                      <dd className="text-sm font-medium">
                        {Math.round(calculateMetrics()!.averages.repsPerSession)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Load per Session (kg)</dt>
                      <dd className="text-sm font-medium">
                        {Math.round(calculateMetrics()!.averages.loadPerSession)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">TUT per Session (s)</dt>
                      <dd className="text-sm font-medium">
                        {Math.round(calculateMetrics()!.averages.timeUnderTensionPerSession)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Completion Rate</h3>
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        {sessions.filter(s => s.status === 'completed').length} of {sessions.length} sessions completed
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${(sessions.filter(s => s.status === 'completed').length / sessions.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Volume Progression</h3>
              <VolumeChart sessions={sessions} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Load Progression</h3>
              <ProgressionChart sessions={sessions} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Feedback Analysis</h3>
            <FeedbackChart sessions={sessions} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {selectedProgram
            ? 'No training sessions found for the selected date range'
            : 'Select a program to view analysis'}
        </div>
      )}
    </div>
  );
} 