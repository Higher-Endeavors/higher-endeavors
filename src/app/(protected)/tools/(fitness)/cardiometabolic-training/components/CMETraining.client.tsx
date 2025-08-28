'use client';

import React, { useState } from 'react';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';
import type { CMEActivityItem, CMEExercise, CMESessionItem } from '../types/cme.zod';
import { getUserSettingsById } from '@/app/lib/actions/userSettings';
import { getHeartRateZonesById } from '@/app/(protected)/user/bio/lib/actions/saveHeartRateZones';
import { saveCMESession } from '../lib/actions/saveCMESession';
import { getCMESessions, getCMESession } from '../lib/hooks/getCMESessions';
import { transformDatabaseToFrontend } from '../lib/actions/transformDatabaseToFrontend';
import { clientLogger } from '@/app/lib/logging/logger.client';
import { useToast } from '@/app/lib/toast';

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
  const toast = useToast();
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      clientLogger.error('Error fetching user preferences:', error);
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

  const handleSessionSelect = async (session: CMESessionItem) => {
    try {
      setSelectedSession(session);
      setIsSessionLoaded(false);
      
      // Load the session data from the database
      const { session: sessionData, exercises: sessionExercises } = await getCMESession(session.cme_session_id, selectedUserId);
      
      // Transform database exercises back to frontend format
      const frontendExercises = sessionExercises.map(dbExercise => 
        transformDatabaseToFrontend(dbExercise, selectedUserId)
      );
      
      // Update session settings
      setSessionName(sessionData.session_name);
      setMacrocyclePhase(sessionData.macrocycle_phase || '');
      setFocusBlock(sessionData.focus_block || '');
      setNotes(sessionData.notes || '');
      
      // Update exercises
      setExercises(frontendExercises);
      
      setIsSessionLoaded(true);
      clientLogger.info('Session loaded successfully:', { sessionName: sessionData.session_name });
      toast.success('Session loaded successfully!');
    } catch (error) {
      clientLogger.error('Error loading session:', error);
      toast.error('Error loading session: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      setSaveError('Session name is required');
      return;
    }

    if (exercises.length === 0) {
      setSaveError('At least one exercise is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await saveCMESession({
        userId: selectedUserId,
        sessionName: sessionName.trim(),
        macrocyclePhase: macrocyclePhase || undefined,
        focusBlock: focusBlock || undefined,
        notes: notes || undefined,
        exercises: exercises.map(exercise => ({
          ...exercise,
          // Ensure all required fields are present
          activityId: exercise.activityId,
          activityName: exercise.activityName,
          useIntervals: exercise.useIntervals,
          intervals: exercise.intervals,
          notes: exercise.notes,
          totalRepeatCount: exercise.totalRepeatCount,
          heartRateData: exercise.heartRateData,
        })),
      });

      if (result.success) {
        setSaveSuccess(true);
        toast.success('Session saved successfully!');
        // Optionally reset the form or redirect
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || 'Failed to save session');
        toast.error('Error saving session: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      clientLogger.error('Error saving session:', error);
      setSaveError('An unexpected error occurred while saving');
      toast.error('Error saving session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
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
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
        userHeartRateZones={selectedUserHeartRateZones}
      />
      
      {/* Add Exercise and Save Session Buttons - positioned like Resistance Training */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 touch-manipulation">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors touch-manipulation"
            style={{ minHeight: '44px' }}
            onClick={handleOpenAddExerciseModal}
            onTouchStart={(e) => e.preventDefault()}
          >
            Add Exercise
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {exercises.length > 0 && (
            <button
              onClick={handleSaveSession}
              disabled={isSaving || exercises.length === 0 || !sessionName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto touch-manipulation"
              style={{ minWidth: '120px', minHeight: '44px' }}
              onTouchStart={(e) => e.preventDefault()}
            >
              {isSaving ? 'Saving...' : 'Save Session'}
            </button>
          )}
        </div>
      </div>
      
      {/* Error and Success Display */}
      {saveError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <p className="text-sm text-red-800 dark:text-red-200">
            ❌ {saveError}
          </p>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ Session saved successfully!
          </p>
        </div>
      )}
      
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
