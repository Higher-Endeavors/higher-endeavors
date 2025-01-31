import React, { useState } from 'react';
import { TrainingSession, SessionExercise, SessionSet } from '../../shared/types';
import { format } from 'date-fns';
import { calculateSessionExerciseVolume } from '../../shared/utils/calculations';

interface SessionDetailsProps {
  session: TrainingSession;
  onSetComplete: (
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    actualReps: number,
    actualLoad: number,
    rpe?: number,
    rir?: number
  ) => void;
  onSessionComplete: () => void;
}

export default function SessionDetails({
  session,
  onSetComplete,
  onSessionComplete
}: SessionDetailsProps) {
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);

  const getLoadAsNumber = (load: string | number | undefined): number => {
    if (typeof load === 'string') return parseFloat(load) || 0;
    if (typeof load === 'number') return load;
    return 0;
  };

  const toggleExercise = (exerciseId: string | undefined) => {
    if (!exerciseId) return;
    setExpandedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const isExerciseComplete = (exercise: SessionExercise): boolean => {
    return exercise.actualSets.every(set => set.actualReps !== undefined);
  };

  const isSessionComplete = (): boolean => {
    return session.exercises.every(isExerciseComplete);
  };

  const getExerciseProgress = (exercise: SessionExercise): number => {
    const completedSets = exercise.actualSets.filter(set => set.actualReps !== undefined).length;
    return (completedSets / exercise.plannedSets) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Session for {format(new Date(session.scheduledDate), 'MMMM d, yyyy')}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              session.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : session.status === 'skipped'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>

        {/* Session Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {session.exercises.filter(isExerciseComplete).length} of {session.exercises.length} exercises completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${(session.exercises.filter(isExerciseComplete).length / session.exercises.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="divide-y">
        {session.exercises.map((exercise) => (
          <div key={exercise.id} className="p-4">
            <button
              onClick={() => exercise.id && toggleExercise(exercise.id)}
              className="w-full flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{exercise.name}</h3>
                  <span className="text-sm text-gray-500">
                    {exercise.pairing}
                  </span>
                </div>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>{exercise.plannedSets} sets</span>
                  <span>{exercise.actualSets[0]?.plannedReps || 0} reps</span>
                  <span>{exercise.actualSets[0]?.plannedLoad || 0}kg</span>
                </div>
                {/* Exercise Progress Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getExerciseProgress(exercise)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 ml-4 transform transition-transform duration-200 ${
                  exercise.id && expandedExercises.includes(exercise.id) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Exercise Details */}
            {exercise.id && expandedExercises.includes(exercise.id) && (
              <div className="mt-4">
                <div className="space-y-4">
                  {exercise.actualSets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="flex items-center space-x-4 p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">Set {set.setNumber}</span>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Reps</label>
                          <input
                            type="number"
                            value={set.actualReps || set.plannedReps}
                            onChange={(e) => {
                              if (!session.id || !exercise.id) return;
                              onSetComplete(
                                session.id,
                                exercise.id,
                                set.setNumber,
                                parseInt(e.target.value),
                                getLoadAsNumber(set.actualLoad || set.plannedLoad),
                                set.rpe,
                                set.rir
                              );
                            }}
                            className="w-full rounded border-gray-300"
                            disabled={session.status === 'completed'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Load (kg)</label>
                          <input
                            type="number"
                            value={set.actualLoad || set.plannedLoad}
                            onChange={(e) => {
                              if (!session.id || !exercise.id) return;
                              onSetComplete(
                                session.id,
                                exercise.id,
                                set.setNumber,
                                set.actualReps || set.plannedReps,
                                parseInt(e.target.value),
                                set.rpe,
                                set.rir
                              );
                            }}
                            className="w-full rounded border-gray-300"
                            disabled={session.status === 'completed'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">RPE</label>
                          <input
                            type="number"
                            value={set.rpe || ''}
                            onChange={(e) => {
                              if (!session.id || !exercise.id) return;
                              onSetComplete(
                                session.id,
                                exercise.id,
                                set.setNumber,
                                set.actualReps || set.plannedReps,
                                getLoadAsNumber(set.actualLoad || set.plannedLoad),
                                parseInt(e.target.value),
                                set.rir
                              );
                            }}
                            min="1"
                            max="10"
                            step="0.5"
                            className="w-full rounded border-gray-300"
                            disabled={session.status === 'completed'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">RIR</label>
                          <input
                            type="number"
                            value={set.rir || ''}
                            onChange={(e) => {
                              if (!session.id || !exercise.id) return;
                              onSetComplete(
                                session.id,
                                exercise.id,
                                set.setNumber,
                                set.actualReps || set.plannedReps,
                                getLoadAsNumber(set.actualLoad || set.plannedLoad),
                                set.rpe,
                                parseInt(e.target.value)
                              );
                            }}
                            min="0"
                            max="5"
                            className="w-full rounded border-gray-300"
                            disabled={session.status === 'completed'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise Notes */}
                {exercise.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded">
                    <p className="text-sm text-yellow-800">{exercise.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 border-t">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Session Volume</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(calculateSessionExerciseVolume(session.exercises))
                .filter(([key]) => key !== 'totalTimeUnderTension')
                .map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span className="font-medium">{Math.round(value)}</span>
                  </div>
                ))}
            </div>
          </div>
          <button
            onClick={onSessionComplete}
            disabled={!isSessionComplete() || session.status === 'completed'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Complete Session
          </button>
        </div>
      </div>
    </div>
  );
} 