import React, { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

interface TrainingSession {
  id: string;
  name: string;
  type: 'resistance' | 'cme' | 'recovery' | 'rest';
  activity?: string; // For CME: running, cycling, swimming, etc.
  time?: string; // Optional time slot
  duration?: number; // Optional duration in minutes
}

interface WeeklyScheduleProps {
  schedule: TrainingSession[];
  onScheduleChange: (schedule: TrainingSession[]) => void;
}

const activityOptions = [
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'rowing', label: 'Rowing' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'other', label: 'Other' },
];

const typeOptions = [
  { value: 'resistance', label: 'Resistance Training', color: 'bg-blue-100 text-blue-700' },
  { value: 'cme', label: 'Cardiometabolic Exercise', color: 'bg-green-100 text-green-700' },
  { value: 'recovery', label: 'Recovery/Active Rest', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'rest', label: 'Complete Rest', color: 'bg-gray-100 text-gray-700' },
];

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function WeeklySchedule({ schedule, onScheduleChange }: WeeklyScheduleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingSession, setEditingSession] = useState<string | null>(null);

  // Generate unique ID for new sessions
  const generateId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new session
  const handleAddSession = (day: string) => {
    const newSession: TrainingSession = {
      id: generateId(),
      name: '',
      type: 'resistance',
      time: '',
      duration: 60,
    };
    
    const updatedSchedule = [...schedule, { ...newSession, day }];
    onScheduleChange(updatedSchedule);
    setEditingSession(newSession.id);
  };

  // Update session
  const handleUpdateSession = (id: string, updates: Partial<TrainingSession>) => {
    const updatedSchedule = schedule.map(session => 
      session.id === id ? { ...session, ...updates } : session
    );
    onScheduleChange(updatedSchedule);
  };

  // Remove session
  const handleRemoveSession = (id: string) => {
    const updatedSchedule = schedule.filter(session => session.id !== id);
    onScheduleChange(updatedSchedule);
  };

  // Get sessions for a specific day
  const getSessionsForDay = (day: string) => {
    return schedule.filter(session => (session as any).day === day);
  };

  // Get type color
  const getTypeColor = (type: string) => {
    return typeOptions.find(option => option.value === type)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 focus:outline-none px-0 py-0 bg-transparent border-none"
      >
        <span>Default Weekly Training Schedule</span>
        <HiChevronDown className={`h-6 w-6 transform transition-transform duration-200 ${isOpen ? '' : '-rotate-180'}`} />
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Define your default weekly training structure. This will be used to generate placeholder data in the calendar and other planning tools.
          </p>
          
          {daysOfWeek.map((day) => {
            const daySessions = getSessionsForDay(day.value);
            
            return (
              <div key={day.value} className="border rounded-lg bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">{day.label}</h4>
                  <button
                    type="button"
                    onClick={() => handleAddSession(day.value)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    + Add Session
                  </button>
                </div>
                
                {daySessions.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No sessions scheduled</div>
                ) : (
                  <div className="space-y-2">
                    {daySessions.map((session) => (
                      <div key={session.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        {editingSession === session.id ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={session.name}
                              onChange={(e) => handleUpdateSession(session.id, { name: e.target.value })}
                              placeholder="Session name"
                              className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700"
                            />
                            <select
                              value={session.type}
                              onChange={(e) => handleUpdateSession(session.id, { type: e.target.value as any })}
                              className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700"
                            >
                              {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {session.type === 'cme' && (
                              <select
                                value={session.activity || ''}
                                onChange={(e) => handleUpdateSession(session.id, { activity: e.target.value })}
                                className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700"
                              >
                                <option value="">Select activity</option>
                                {activityOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            <div className="flex gap-1">
                              <input
                                type="time"
                                value={session.time || ''}
                                onChange={(e) => handleUpdateSession(session.id, { time: e.target.value })}
                                className="px-2 py-1 text-sm rounded border border-gray-300 text-gray-700"
                              />
                              <input
                                type="number"
                                value={session.duration || ''}
                                onChange={(e) => handleUpdateSession(session.id, { duration: Number(e.target.value) })}
                                placeholder="min"
                                min="0"
                                className="w-16 px-2 py-1 text-sm rounded border border-gray-300 text-gray-700"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(session.type)}`}>
                              {typeOptions.find(opt => opt.value === session.type)?.label}
                            </span>
                            {session.activity && (
                              <span className="text-sm text-gray-600">
                                {activityOptions.find(opt => opt.value === session.activity)?.label}
                              </span>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {session.name || 'Untitled Session'}
                            </span>
                            {session.time && (
                              <span className="text-sm text-gray-500">
                                at {session.time}
                              </span>
                            )}
                            {session.duration && (
                              <span className="text-sm text-gray-500">
                                ({session.duration}min)
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingSession(editingSession === session.id ? null : session.id)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                          >
                            {editingSession === session.id ? 'Save' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSession(session.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Quick Templates */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Quick Templates</h5>
            <p className="text-sm text-blue-700 mb-3">Apply common training patterns to your schedule:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement template application
                  console.log('Apply 3-day split template');
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
              >
                3-Day Split
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement template application
                  console.log('Apply 4-day upper/lower template');
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
              >
                4-Day Upper/Lower
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement template application
                  console.log('Apply 5-day bro split template');
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
              >
                5-Day Bro Split
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement template application
                  console.log('Apply endurance focus template');
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
              >
                Endurance Focus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
