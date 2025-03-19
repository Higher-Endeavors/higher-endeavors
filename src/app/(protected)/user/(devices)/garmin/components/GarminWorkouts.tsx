'use client';

import React, { useState, useEffect } from 'react';
import { Workout } from '@/app/lib/utils/garmin/trainingDataAccess';

interface GarminWorkoutsProps {
  userId: number;
  onEditWorkout?: (workoutId: number) => void;
}

export default function GarminWorkouts({ userId, onEditWorkout }: GarminWorkoutsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [sports, setSports] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch workouts data
  useEffect(() => {
    async function fetchWorkouts() {
      try {
        setLoading(true);
        const url = selectedSport 
          ? `/api/garmin/training?userId=${userId}&sport=${selectedSport}&entityType=workout`
          : `/api/garmin/training?userId=${userId}&entityType=workout`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }
        
        const data = await response.json();
        setWorkouts(data);
        
        // Extract unique sports if no sport filter is applied
        if (!selectedSport) {
          const uniqueSports = Array.from(new Set(data.map((workout: Workout) => workout.sport)));
          setSports(uniqueSports as string[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchWorkouts();
  }, [userId, selectedSport]);

  // Handle deleting a workout
  const handleDeleteWorkout = async (workoutId: number) => {
    try {
      const response = await fetch(`/api/garmin/training?userId=${userId}&id=${workoutId}&entityType=workout`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }
      
      // Remove the deleted workout from the state
      setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout');
    }
  };

  // Format duration from seconds to readable format (HH:MM:SS)
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date to readable format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not available';
    
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get appropriate sport icon
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

  if (loading) return <div className="p-4 text-center">Loading workouts...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (workouts.length === 0) return <div className="p-4 text-center">No workouts found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Garmin Workouts</h2>
      
      {/* Sport filter */}
      <div className="mb-4">
        <label htmlFor="sport-filter" className="mr-2 font-medium">Filter by sport:</label>
        <select 
          id="sport-filter"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Sports</option>
          {sports.map(sport => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
      </div>
      
      {/* Workouts list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map(workout => (
          <div key={workout.id} className="border rounded-lg shadow-sm p-4 bg-white">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{getSportIcon(workout.sport)}</span>
              <h3 className="text-lg font-semibold truncate">{workout.workoutName}</h3>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              {formatDate(workout.createdDate)}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Sport:</span> {workout.sport}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {formatDuration(workout.estimatedDurationInSecs)}
              </div>
              
              {workout.estimatedDistanceInMeters && (
                <div>
                  <span className="font-medium">Distance:</span> {(workout.estimatedDistanceInMeters / 1000).toFixed(2)} km
                </div>
              )}
              
              <div>
                <span className="font-medium">Steps:</span> {workout.steps.length}
              </div>
            </div>
            
            {workout.description && (
              <div className="mt-3 pt-3 border-t text-sm">
                <span className="font-medium">Description:</span> {workout.description}
              </div>
            )}
            
            <div className="mt-4 flex justify-between">
              <div className="flex space-x-2">
                <button 
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                  onClick={() => console.log('View workout details', workout.id)}
                >
                  View
                </button>
                {onEditWorkout && (
                  <button 
                    className="text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded"
                    onClick={() => onEditWorkout(workout.id!)}
                  >
                    Edit
                  </button>
                )}
                <button 
                  className="text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded"
                  onClick={() => console.log('Schedule workout', workout.id)}
                >
                  Schedule
                </button>
              </div>
              
              {deleteConfirm === workout.id ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-red-600">Confirm?</span>
                  <button 
                    className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                    onClick={() => handleDeleteWorkout(workout.id!)}
                  >
                    Yes
                  </button>
                  <button 
                    className="text-sm bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button 
                  className="text-sm text-red-500 hover:text-red-600"
                  onClick={() => setDeleteConfirm(workout.id!)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 