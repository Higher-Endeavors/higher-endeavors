'use client';

import { useState } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import GarminWorkouts from '@/app/(protected)/user/(devices)/garmin/components/GarminWorkouts';
import GarminWorkoutSchedule from '@/app/(protected)/user/(devices)/garmin/components/GarminWorkoutSchedule';
import GarminWorkoutEditor from '@/app/(protected)/user/(devices)/garmin/components/GarminWorkoutEditor';
import { Tabs } from 'flowbite-react';
import { Workout } from '@/app/lib/utils/garmin/trainingDataAccess';

function GarminTrainingDashboardContent() {
  const { data: session } = useSession({ required: true });
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const [showEditor, setShowEditor] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('workouts');

  // Check if user is authenticated
  if (!session || !userId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Authentication Required</h1>
          <p className="text-yellow-700">
            Please sign in to access your Garmin Training dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Handle creating a new workout
  const handleCreateWorkout = () => {
    setSelectedWorkout(undefined);
    setShowEditor(true);
  };

  // Handle editing an existing workout
  const handleEditWorkout = (workoutId: number) => {
    setSelectedWorkout(workoutId);
    setShowEditor(true);
  };

  // Handle saving a workout
  const handleSaveWorkout = async (workout: Workout) => {
    try {
      const method = selectedWorkout ? 'PUT' : 'POST';
      const body = selectedWorkout 
        ? { userId, entityType: 'workout', id: selectedWorkout, workout }
        : { userId, entityType: 'workout', workout };
      
      const response = await fetch('/api/garmin/training', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${selectedWorkout ? 'update' : 'create'} workout`);
      }
      
      // Close the editor and refresh the workouts list
      setShowEditor(false);
      setActiveTab('workouts');
      
      // The workouts component will refetch data on its own
    } catch (error) {
      console.error('Error saving workout:', error);
      alert(`Failed to save workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle canceling workout editing
  const handleCancelEdit = () => {
    setShowEditor(false);
    setSelectedWorkout(undefined);
  };

  // If the editor is open, show it instead of the tabs
  if (showEditor) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Garmin Training Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {selectedWorkout ? 'Edit Workout' : 'Create New Workout'}
          </p>
        </div>

        <GarminWorkoutEditor 
          userId={userId}
          workoutId={selectedWorkout}
          onSave={handleSaveWorkout}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
      <div className="container mx-auto p-4">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Garmin Training Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your workouts and training schedule
            </p>
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={handleCreateWorkout}
          >
            Create New Workout
          </button>
        </div>

        <Tabs>
          <Tabs.Item active={activeTab === 'workouts'} title="My Workouts" onClick={() => setActiveTab('workouts')}>
            <div className="bg-white rounded-lg border p-4">
              <GarminWorkouts userId={userId} onEditWorkout={handleEditWorkout} />
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'schedule'} title="Training Schedule" onClick={() => setActiveTab('schedule')}>
            <div className="bg-white rounded-lg border p-4">
              <GarminWorkoutSchedule userId={userId} />
            </div>
          </Tabs.Item>
        </Tabs>
      </div>
  );
} 

export default function GarminTrainingDashboard() {
  return (
    <SessionProvider>
      <GarminTrainingDashboardContent />
    </SessionProvider>
  );
}