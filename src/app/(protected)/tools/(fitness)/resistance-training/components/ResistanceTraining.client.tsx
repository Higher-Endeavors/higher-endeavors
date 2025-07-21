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
import { updateResistanceProgram } from '../lib/actions/updateResistanceProgram';
import { getResistanceProgram } from '../lib/hooks/getResistanceProgram';

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
  const [isLoadingProgram, setIsLoadingProgram] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  // Add mode state
  const [mode, setMode] = useState<'plan' | 'act'>('plan');

  // Update programDuration when programLength changes
  useEffect(() => {
    setProgramDuration(programLength);
  }, [programLength]);

  // Load program handler
  const handleLoadProgram = async (program: any) => {
    try {
      setIsLoadingProgram(true);
      const { program: loadedProgram, exercises } = await getResistanceProgram(program.resistanceProgramId, selectedUserId);
      
      // Type assertion for exercises with programInstance
      const exercisesWithWeek = exercises as (ProgramExercisesPlanned & { programInstance?: number })[];
      
      // Update program settings
      setProgramName(loadedProgram.programName);
      setPhaseFocus(loadedProgram.phaseFocus || '');
      setPeriodizationType(loadedProgram.periodizationType || 'None');
      setProgressionRulesState(loadedProgram.progressionRules || {});
      setProgramDuration(loadedProgram.programDuration || 4);
      setNotes(loadedProgram.notes || '');
      
      // Update program length if needed
      if (loadedProgram.programDuration && loadedProgram.programDuration !== programLength) {
        setProgramLength(loadedProgram.programDuration);
      }
      
      // Group exercises by week (program_instance)
      const exercisesByWeek: ProgramExercisesPlanned[][] = [];
      const maxWeek = Math.max(...exercisesWithWeek.map(ex => ex.programInstance || 1), 1);
      
      for (let week = 1; week <= maxWeek; week++) {
        const weekExercises = exercisesWithWeek.filter(ex => (ex.programInstance || 1) === week);
        exercisesByWeek.push(weekExercises);
      }
      
      // Fill any missing weeks with empty arrays
      while (exercisesByWeek.length < maxWeek) {
        exercisesByWeek.push([]);
      }
      
      setWeeklyExercises(exercisesByWeek);
      setBaseWeekExercises(exercisesByWeek[0] || []);
      setActiveWeek(1);
      
      // Clear any locked weeks since we're loading a new program
      setLockedWeeks(new Set());
      
      // Set the program ID we're editing
      setEditingProgramId(loadedProgram.resistanceProgramId);
      
      console.log('Program loaded successfully:', loadedProgram.programName);
    } catch (error) {
      console.error('Error loading program:', error);
      // You could add a toast notification here
    } finally {
      setIsLoadingProgram(false);
    }
  };

  // Add new exercise to all weeks
  const handleAddExercise = (exercise: ProgramExercisesPlanned) => {
    setWeeklyExercises(prev => prev.map(arr => [...arr, exercise]));
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Open edit modal for existing exercise
  const handleEditExercise = (id: number) => {
    const exerciseToEdit = weeklyExercises[activeWeek - 1].find(ex => 
      ex.exerciseLibraryId === id || ex.userExerciseLibraryId === id
    );
    if (exerciseToEdit) {
      setEditingExercise(exerciseToEdit);
      setIsModalOpen(true);
    }
  };



  // Delete exercise from all weeks
  const handleDeleteExercise = (id: number) => {
    setWeeklyExercises(prev => prev.map(weekExercises => 
      weekExercises.filter(ex => (ex.exerciseLibraryId !== id) && (ex.userExerciseLibraryId !== id))
    ));
    
    // Also update baseWeekExercises if it exists
    if (baseWeekExercises.length > 0) {
      setBaseWeekExercises(prev => prev.filter(ex => (ex.exerciseLibraryId !== id) && (ex.userExerciseLibraryId !== id)));
    }
  };

  // Save exercise (add new or update existing)
  const handleSaveExercise = (exercise: ProgramExercisesPlanned) => {
    if (editingExercise) {
      const editingId = editingExercise.exerciseLibraryId || editingExercise.userExerciseLibraryId;
      setWeeklyExercises(prev =>
        prev.map((arr, idx) =>
          idx === activeWeek - 1
            ? arr.map(ex => {
                const exId = ex.exerciseLibraryId || ex.userExerciseLibraryId;
                return exId === editingId ? exercise : ex;
              })
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
    
    let result;
    
    if (editingProgramId) {
      // Update existing program
      result = await updateResistanceProgram({
        programId: editingProgramId,
        userId: selectedUserId,
        programName,
        phaseFocus,
        periodizationType,
        progressionRules: progressionSettings,
        programDuration,
        notes,
        weeklyExercises,
      });
    } else {
      // Create new program
      result = await saveResistanceProgram({
        userId: selectedUserId,
        programName,
        phaseFocus,
        periodizationType,
        progressionRules: progressionSettings,
        programDuration,
        notes,
        weeklyExercises,
      });
    }
    
    if (result.success) {
      setSaveResult(editingProgramId ? 'Program updated successfully!' : 'Program saved successfully!');
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
      <ProgramBrowser 
        currentUserId={selectedUserId}
        onProgramSelect={handleLoadProgram}
        onProgramDelete={(programId) => {
          // TODO: Handle program deletion
          console.log('Program deleted:', programId);
        }}
      />
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
        isLoading={isLoadingProgram}
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
        mode={mode}
        setMode={setMode}
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => {
              setEditingExercise(null);
              setIsModalOpen(true);
            }}
            disabled={mode === 'act'}
          >
            Add Exercise
          </button>
          {editingProgramId && mode === 'plan' && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() => {
                setEditingProgramId(null);
                setProgramName('');
                setPhaseFocus('');
                setPeriodizationType('None');
                setProgressionRulesState({});
                setProgramDuration(4);
                setNotes('');
                setWeeklyExercises([[]]);
                setBaseWeekExercises([]);
                setActiveWeek(1);
                setLockedWeeks(new Set());
                setSaveResult(null);
              }}
            >
              New Program
            </button>
          )}
        </div>
        {weeklyExercises.some(week => week.length > 0) && mode === 'plan' && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            style={{ minWidth: '120px' }}
            onClick={handleSaveProgram}
          >
            {editingProgramId ? 'Update Program' : 'Save Program'}
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
        key={editingExercise?.exerciseLibraryId || editingExercise?.userExerciseLibraryId || 'new'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExercise(null);
        }}
        onAdd={handleSaveExercise}
        exercises={exercises}
        userId={selectedUserId}
        editingExercise={editingExercise}
        fitnessSettings={fitnessSettings}
      />
      {weeklyExercises[activeWeek - 1]?.length > 0 && (
        <div className="mt-6">
          <SessionSummary exercises={weeklyExercises[activeWeek - 1]} preferredLoadUnit={(fitnessSettings?.resistanceTraining?.loadUnit === 'kg' ? 'kg' : 'lbs')} />
        </div>
      )}
    </>
  );
} 