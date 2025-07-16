'use client';

import { useState, useEffect } from 'react';
import UserSelector from '../../../../components/UserSelector';
import ProgramBrowser from './ProgramBrowser';
import ProgramSettings from './ProgramSettings';
import ExerciseList from './ExerciseList';
import SessionSummary from './SessionSummary';
import AddExerciseModal from '../modals/AddExerciseModal';
import WeekTabs from './WeekTabs';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '../types/resistance-training.zod';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';
import type { ExerciseWithSource } from '../modals/AddExerciseModal';
import { generateProgressedWeeks } from '../../lib/calculations/resistanceTrainingCalculations';
import { saveResistanceProgram } from '../lib/actions/saveResistanceProgram';

export default function ResistanceTrainingClient({
  exercises,
  initialUserId,
  userId,
  fitnessSettings,
}: {
  exercises: ExerciseLibraryItem[];
  initialUserId: number;
  userId: number;
  fitnessSettings?: FitnessSettings;
}) {
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [programLength, setProgramLength] = useState(4);
  // Progression settings state
  const [progressionSettings, setProgressionSettings] = useState({
    type: 'None',
    settings: {
      volume_increment_percentage: 0,
      load_increment_percentage: 0,
      weekly_volume_percentages: [100, 100, 100, 100],
    },
  });
  // Week 1 (base) exercises
  const [baseWeekExercises, setBaseWeekExercises] = useState<ProgramExercisesPlanned[]>([]);
  // All weeks' exercises
  const [weeklyExercises, setWeeklyExercises] = useState<ProgramExercisesPlanned[][]>(
    Array.from({ length: programLength }, (_, i) => (i === 0 ? baseWeekExercises : []))
  );
  const [editingExercise, setEditingExercise] = useState<ProgramExercisesPlanned | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  // Track which weeks have been manually edited (locked)
  const [lockedWeeks, setLockedWeeks] = useState<Set<number>>(new Set());
  // Add state for programName (to be set from ProgramSettings)
  const [programName, setProgramName] = useState('');
  const [saveWarning, setSaveWarning] = useState('');
  // Add state for phaseFocus, periodizationType, progressionRules, programDuration, notes
  const [phaseFocus, setPhaseFocus] = useState('');
  const [periodizationType, setPeriodizationType] = useState('None');
  const [progressionRulesState, setProgressionRulesState] = useState({});
  const [programDuration, setProgramDuration] = useState(programLength);
  const [notes, setNotes] = useState('');
  const [saveResult, setSaveResult] = useState<string | null>(null);

  // Update programDuration when programLength changes
  useEffect(() => {
    setProgramDuration(programLength);
  }, [programLength]);

  // Add Exercise
  const handleAddExercise = (exercise: ProgramExercisesPlanned) => {
    setWeeklyExercises(prev => prev.map(arr => [...arr, exercise]));
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Edit Exercise
  const handleEditExercise = (id: number) => {
    const exerciseToEdit = weeklyExercises[activeWeek - 1].find(ex => ex.exerciseLibraryId === id);
    if (exerciseToEdit) {
      setEditingExercise(exerciseToEdit);
      setIsModalOpen(true);
    }
  };

  const handleUpdateExercise = (updatedExercise: ProgramExercisesPlanned) => {
    if (activeWeek === 1) {
      setWeeklyExercises(prev => prev.map((arr, idx) => idx === 0 ? arr.map(ex => ex.exerciseLibraryId === updatedExercise.exerciseLibraryId ? updatedExercise : ex) : arr));
    } else {
      setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? arr.map(ex => ex.exerciseLibraryId === updatedExercise.exerciseLibraryId ? updatedExercise : ex) : arr));
      setLockedWeeks(prev => new Set(prev).add(activeWeek - 1));
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Delete Exercise
  const handleDeleteExercise = (id: number) => {
    if (activeWeek === 1) {
      const newBase = baseWeekExercises.filter(ex => ex.exerciseLibraryId !== id);
      setBaseWeekExercises(newBase);
      // recalculateAllWeeks(newBase); // This line is removed
    } else {
      setWeeklyExercises(prev => prev.map((arr, idx) => idx === activeWeek - 1 ? arr.filter(ex => ex.exerciseLibraryId !== id) : arr));
    }
  };

  // Simplified handleAddOrUpdateExercise
  const handleAddOrUpdateExercise = (exercise: ProgramExercisesPlanned) => {
    if (editingExercise) {
      setWeeklyExercises(prev =>
        prev.map((arr, idx) =>
          idx === activeWeek - 1
            ? [
                ...arr.filter(ex => ex.exerciseLibraryId !== editingExercise.exerciseLibraryId),
                exercise
              ]
            : arr
        )
      );
      if (activeWeek !== 1) {
        setLockedWeeks(prev => new Set(prev).add(activeWeek - 1));
      }
    } else {
      handleAddExercise(exercise);
      if (activeWeek !== 1) {
        setLockedWeeks(prev => new Set(prev).add(activeWeek - 1));
      }
    }
    setEditingExercise(null);
    setIsModalOpen(false);
  };

  // Save handler
  const handleSaveProgram = async () => {
    if (!programName.trim()) {
      setSaveWarning('Please enter a Program Name before saving.');
      return;
    }
    setSaveWarning('');
    setSaveResult(null);
    const result = await saveResistanceProgram({
      userId: selectedUserId,
      programName,
      phaseFocus,
      periodizationType,
      progressionRules: progressionSettings,
      programDuration,
      notes,
      weeklyExercises,
    });
    if (result.success) {
      setSaveResult('Program saved successfully!');
    } else {
      setSaveResult('Error saving program: ' + (result.error || 'Unknown error'));
    }
  };

  // Pass progression settings and program length to ProgramSettings
  // ProgramSettings should call setProgramLength and setProgressionSettings on change

  return (
    <>
      <div className="max-w-md">
        <UserSelector
          onUserSelect={userId => {
            if (userId !== null) setSelectedUserId(userId);
          }}
          currentUserId={selectedUserId}
        />
      </div>
      <ProgramBrowser />
      <ProgramSettings
        programLength={programLength}
        setProgramLength={setProgramLength}
        progressionSettings={progressionSettings}
        setProgressionSettings={setProgressionSettings}
        programName={programName}
        setProgramName={setProgramName}
        phaseFocus={phaseFocus}
        setPhaseFocus={setPhaseFocus}
        periodizationType={periodizationType}
        setPeriodizationType={setPeriodizationType}
        notes={notes}
        setNotes={setNotes}
      />
      <WeekTabs
        activeWeek={activeWeek}
        programLength={programLength}
        onWeekChange={setActiveWeek}
      />
      <ExerciseList
        exercises={exercises}
        isLoading={false}
        userId={selectedUserId}
        plannedExercises={weeklyExercises[activeWeek - 1] || []}
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
        activeWeek={activeWeek}
      />
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={() => {
            setEditingExercise(null);
            setIsModalOpen(true);
          }}
        >
          Add Exercise
        </button>
        {weeklyExercises.some(week => week.length > 0) && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            style={{ minWidth: '120px' }}
            onClick={handleSaveProgram}
          >
            Save Program
          </button>
        )}
      </div>
      {saveWarning && (
        <div className="text-red-600 text-right mt-2">{saveWarning}</div>
      )}
      {saveResult && (
        <div className={`mt-2 text-right ${saveResult.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{saveResult}</div>
      )}
      <AddExerciseModal
        key={editingExercise?.exerciseLibraryId || 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExercise(null);
        }}
        onAdd={handleAddOrUpdateExercise}
        exercises={exercises.map(e => ({ ...e, source: 'library' }))}
        userId={selectedUserId}
        editingExercise={editingExercise}
        fitnessSettings={fitnessSettings}
      />
      {weeklyExercises[activeWeek - 1]?.length > 0 && (
        <div className="mt-6">
          <SessionSummary exercises={weeklyExercises[activeWeek - 1]} />
        </div>
      )}
    </>
  );
} 