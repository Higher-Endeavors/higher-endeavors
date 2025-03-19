'use client';

import React, { useState, useEffect } from 'react';
import { Workout, WorkoutSchedule } from '@/app/lib/utils/garmin/trainingDataAccess';

interface GarminWorkoutScheduleProps {
  userId: number;
}

export default function GarminWorkoutSchedule({ userId }: GarminWorkoutScheduleProps) {
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newSchedule, setNewSchedule] = useState<Partial<WorkoutSchedule>>({
    workoutId: 0,
    date: ''
  });

  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Fetch schedules and workouts data
  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;
      
      try {
        setLoading(true);
        
        // Fetch schedules
        const schedulesUrl = `/api/garmin/training?userId=${userId}&entityType=schedule&startDate=${startDate}&endDate=${endDate}`;
        const schedulesResponse = await fetch(schedulesUrl);
        
        if (!schedulesResponse.ok) {
          throw new Error('Failed to fetch workout schedules');
        }
        
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData);
        
        // Fetch workouts for the schedule form
        const workoutsUrl = `/api/garmin/training?userId=${userId}&entityType=workout`;
        const workoutsResponse = await fetch(workoutsUrl);
        
        if (!workoutsResponse.ok) {
          throw new Error('Failed to fetch workouts');
        }
        
        const workoutsData = await workoutsResponse.json();
        setWorkouts(workoutsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [userId, startDate, endDate]);

  // Get workout name by ID
  const getWorkoutById = (workoutId: number): Workout | undefined => {
    return workouts.find(workout => workout.id === workoutId);
  };

  // Get sport icon
  const getSportIcon = (sport: string): string => {
    const sportIcons: {[key: string]: string} = {
      RUNNING: '🏃',
      CYCLING: '🚴',
      SWIMMING: '🏊',
      STRENGTH_TRAINING: '🏋️',
      WALKING: '🚶',
      HIKING: '🥾',
      YOGA: '🧘',
      CARDIO: '❤️',
      DEFAULT: '🏆'
    };
    
    return sportIcons[sport] || sportIcons.DEFAULT;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create a new schedule
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSchedule.workoutId || !newSchedule.date) {
      setError('Please select a workout and date');
      return;
    }
    
    try {
      const response = await fetch('/api/garmin/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          entityType: 'schedule',
          schedule: {
            workoutId: newSchedule.workoutId,
            date: newSchedule.date
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workout schedule');
      }
      
      // Refresh the schedule list
      const schedulesUrl = `/api/garmin/training?userId=${userId}&entityType=schedule&startDate=${startDate}&endDate=${endDate}`;
      const refreshResponse = await fetch(schedulesUrl);
      const refreshData = await refreshResponse.json();
      setSchedules(refreshData);
      
      // Reset form
      setNewSchedule({ workoutId: 0, date: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    }
  };

  // Delete a schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/garmin/training?userId=${userId}&id=${scheduleId}&entityType=schedule`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workout schedule');
      }
      
      // Update the schedules list
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  // Group schedules by date
  const groupSchedulesByDate = () => {
    const grouped: {[key: string]: WorkoutSchedule[]} = {};
    
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    
    return grouped;
  };

  const groupedSchedules = groupSchedulesByDate();
  const sortedDates = Object.keys(groupedSchedules).sort();

  if (loading && (!startDate || !endDate)) {
    return <div className="p-4 text-center">Initializing date range...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Workout Schedule</h2>
      
      {/* Date range selector */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Workout to Schedule'}
        </button>
      </div>
      
      {/* Add schedule form */}
      {showAddForm && (
        <div className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
          <h3 className="font-medium mb-3">Schedule a Workout</h3>
          <form onSubmit={handleCreateSchedule}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="workout-select" className="block text-sm font-medium mb-1">Select Workout</label>
                <select
                  id="workout-select"
                  value={newSchedule.workoutId || ''}
                  onChange={(e) => setNewSchedule({...newSchedule, workoutId: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">-- Select a workout --</option>
                  {workouts.map(workout => (
                    <option key={workout.id} value={workout.id}>
                      {workout.workoutName} ({workout.sport})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="schedule-date" className="block text-sm font-medium mb-1">Select Date</label>
                <input
                  type="date"
                  id="schedule-date"
                  value={newSchedule.date || ''}
                  onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <button 
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Schedule Workout
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
          <button 
            className="ml-2 text-red-500 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="text-center p-8">Loading workout schedules...</div>
      ) : (
        <>
          {/* Schedules list */}
          {sortedDates.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded">
              No workouts scheduled for this date range.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map(date => (
                <div key={date} className="border rounded shadow-sm overflow-hidden">
                  <div className="bg-gray-100 p-3 font-medium">
                    {formatDate(date)}
                  </div>
                  <div className="divide-y">
                    {groupedSchedules[date].map(schedule => {
                      const workout = getWorkoutById(schedule.workoutId);
                      if (!workout) return null;
                      
                      return (
                        <div key={schedule.id} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-3">{getSportIcon(workout.sport)}</span>
                            <div>
                              <div className="font-medium">{workout.workoutName}</div>
                              <div className="text-sm text-gray-600">{workout.sport}</div>
                            </div>
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteSchedule(schedule.id!)}
                            aria-label="Remove schedule"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 