'use client';

import React, { useState } from 'react';
import UserSelector from '../../../../components/UserSelector';
import ProgramBrowser from './SessionBrowser';
import SessionSettings from './SessionSettings';
import ExerciseList from './ExerciseList';
import SessionSummary from './SessionSummary';
import AddExerciseModal from '../modals/AddExerciseModal';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';

interface CMEExercise {
  activityId: number;
  activityName: string;
  activitySource: 'library' | 'user';
  useIntervals: boolean;
  intervals: Array<{
    stepType: string;
    duration: number;
    intensity: string;
    intensityMetric: string;
    notes: string;
  }>;
  notes: string;
  createdAt: string;
  userId: number;
}

interface CMESessionItem {
  sessionId: number;
  sessionName: string;
  createdAt: string;
  duration: number;
  intensity: string;
  activityType: string;
  targetHeartRate?: number;
  notes?: string;
  userId: number;
  templateInfo?: {
    difficultyLevel: string;
    categories: Array<{ name: string }>;
  };
}

export default function CardiometabolicTrainingClient({
  initialUserId,
  userId,
  fitnessSettings,
}: {
  initialUserId: number;
  userId: number;
  fitnessSettings?: FitnessSettings;
}) {
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CMESessionItem | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Session settings state
  const [sessionName, setSessionName] = useState('');
  const [macrocyclePhase, setMacrocyclePhase] = useState('');
  const [focusBlock, setFocusBlock] = useState('');
  const [notes, setNotes] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Exercise management state
  const [exercises, setExercises] = useState<CMEExercise[]>([]);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<CMEExercise | null>(null);

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
        isOpen={isAddExerciseModalOpen}
        onClose={handleCloseAddExerciseModal}
        onAdd={handleAddExercise}
        currentUserId={selectedUserId}
        editingExercise={editingExercise}
      />
    </>
  );
}
