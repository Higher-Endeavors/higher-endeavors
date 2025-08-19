'use client';

import React, { useState } from 'react';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';
import type { CMEActivityItem, CMEExercise, CMESessionItem } from '../types/cme.zod';
import { getUserSettingsById } from '@/app/lib/actions/userSettings';
import { getHeartRateZonesById } from '@/app/(protected)/user/bio/lib/actions/saveHeartRateZones';

// Components
import UserSelector from '../../../../components/UserSelector';
import ProgramBrowser from './SessionBrowser';
import SessionSettings from './SessionSettings';
import ExerciseList from './ExerciseList';
import SessionSummary from './SessionSummary';
import AddExerciseModal from '../modals/AddExerciseModal';

export default function CardiometabolicTrainingClient({
  initialUserId,
  userId,
  fitnessSettings,
  userHeartRateZones,
  activities,
}: {
  initialUserId: number;
  userId: number;
  fitnessSettings?: FitnessSettings;
  userHeartRateZones?: any[];
  activities: CMEActivityItem[];
}) {
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CMESessionItem | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // User preferences state - initialized from props
  const [selectedUserFitnessSettings, setSelectedUserFitnessSettings] = useState<FitnessSettings | undefined>(() => fitnessSettings);
  const [selectedUserHeartRateZones, setSelectedUserHeartRateZones] = useState<any[]>(() => userHeartRateZones || []);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  // Session state
  const [sessionName, setSessionName] = useState('');
  const [macrocyclePhase, setMacrocyclePhase] = useState('');
  const [focusBlock, setFocusBlock] = useState('');
  const [notes, setNotes] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Exercise state
  const [exercises, setExercises] = useState<CMEExercise[]>([]);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<CMEExercise | null>(null);

  // Fetch user preferences when user changes
  const fetchUserPreferences = async (userId: number) => {
    try {
      setPreferencesError(null);
      const [userSettings, userHRZones] = await Promise.all([
        getUserSettingsById(userId),
        getHeartRateZonesById(userId)
      ]);
      setSelectedUserFitnessSettings(userSettings?.fitness);
      setSelectedUserHeartRateZones(userHRZones?.data || []);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      setPreferencesError('Failed to load user preferences. Using default settings.');
      setSelectedUserFitnessSettings(fitnessSettings); // Fallback
      setSelectedUserHeartRateZones(userHeartRateZones || []); // Fallback
    }
  };

  const handleUserSelect = (userId: number | null) => {
    if (userId) {
      setSelectedUserId(userId);
      setSelectedSession(null);
      setIsSessionLoaded(false);
      // Reset session settings when user changes
      setSessionName('');
      setMacrocyclePhase('');
      setFocusBlock('');
      setNotes('');
      setDifficultyLevel('');
      setSelectedCategories([]);
      // Reset exercises when user changes
      setExercises([]);
      setEditingExercise(null);
      // Fetch new user preferences
      fetchUserPreferences(userId);
    }
  };

  const handleAdminStatusChange = (isAdmin: boolean) => {
    setIsAdmin(isAdmin);
  };

  const handleSessionSelect = (session: CMESessionItem) => {
    setSelectedSession(session);
    setIsSessionLoaded(true);
    
    // Load session settings if available
    if (session) {
      setSessionName(session.sessionName);
      setNotes(session.notes || '');
      // TODO: Load other session settings from the session data
    }
  };

  const handleSessionDelete = (sessionId: number) => {
    if (selectedSession?.sessionId === sessionId) {
      setSelectedSession(null);
      setIsSessionLoaded(false);
    }
  };

  const handleNewSession = () => {
    setSelectedSession(null);
    setIsSessionLoaded(false);
    // Reset session settings for new session
    setSessionName('');
    setMacrocyclePhase('');
    setFocusBlock('');
    setNotes('');
    setDifficultyLevel('');
    setSelectedCategories([]);
    // Reset exercises for new session
    setExercises([]);
    setEditingExercise(null);
    // TODO: Implement new session creation logic
  };

  const handleAddExercise = (exercise: CMEExercise) => {
    if (editingExercise) {
      // Update existing exercise
      setExercises(prev => prev.map(ex => 
        ex.activityId === editingExercise.activityId ? exercise : ex
      ));
      setEditingExercise(null);
    } else {
      // Add new exercise
      setExercises(prev => [...prev, exercise]);
    }
    setIsAddExerciseModalOpen(false);
  };

  const handleEditExercise = (exerciseId: number) => {
    const exerciseToEdit = exercises.find(ex => ex.activityId === exerciseId);
    if (exerciseToEdit) {
      setEditingExercise(exerciseToEdit);
      setIsAddExerciseModalOpen(true);
    }
  };

  const handleDeleteExercise = (exerciseId: number) => {
    setExercises(prev => prev.filter(ex => ex.activityId !== exerciseId));
  };

  const handleOpenAddExerciseModal = () => {
    setEditingExercise(null);
    setIsAddExerciseModalOpen(true);
  };

  const handleCloseAddExerciseModal = () => {
    setIsAddExerciseModalOpen(false);
    setEditingExercise(null);
  };

  return (
    <>
      <div className="max-w-md">
        <UserSelector
          onUserSelect={handleUserSelect}
          currentUserId={selectedUserId}
          showAdminFeatures={true}
          onAdminStatusChange={handleAdminStatusChange}
        />
      </div>
      
      {/* Error Display */}
      {preferencesError && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {preferencesError}
          </p>
        </div>
      )}
      
      <ProgramBrowser
        onSessionSelect={handleSessionSelect}
        currentUserId={selectedUserId}
        isAdmin={isAdmin}
        onSessionDelete={handleSessionDelete}
        newSessionHandler={handleNewSession}
        isSessionLoaded={isSessionLoaded}
      />
      <SessionSettings
        sessionName={sessionName}
        setSessionName={setSessionName}
        macrocyclePhase={macrocyclePhase}
        setMacrocyclePhase={setMacrocyclePhase}
        focusBlock={focusBlock}
        setFocusBlock={setFocusBlock}
        notes={notes}
        setNotes={setNotes}
        difficultyLevel={difficultyLevel}
        setDifficultyLevel={setDifficultyLevel}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        isAdmin={isAdmin}
        isLoading={false}
        isTemplateSession={false}
      />
      <ExerciseList 
        exercises={exercises}
        onAddExercise={handleOpenAddExerciseModal}
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
      />
      
      {/* Add Exercise Button - Positioned below ExerciseList to match Resistance Training layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 touch-manipulation">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{ minHeight: '44px' }}
            onClick={handleOpenAddExerciseModal}
            onTouchStart={(e) => e.preventDefault()}
          >
            Add Exercise
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Right side buttons can be added here in the future if needed */}
        </div>
      </div>
      
      <SessionSummary exercises={exercises} />
      
      <AddExerciseModal
        key={editingExercise?.activityId || 'new'}
        isOpen={isAddExerciseModalOpen}
        onClose={handleCloseAddExerciseModal}
        onAdd={handleAddExercise}
        currentUserId={selectedUserId}
        selectedUserId={selectedUserId}
        editingExercise={editingExercise}
        fitnessSettings={selectedUserFitnessSettings}
        userHeartRateZones={selectedUserHeartRateZones}
        activities={activities}
      />
    </>
  );
}
