'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserSelector from '(protected)/components/UserSelector';
import ProgramBrowser from '(protected)/tools/fitness/resistance-training/program/components/ProgramBrowser';
import ProgramSettings from '(protected)/tools/fitness/resistance-training/program/components/ProgramSettings';
import ExerciseList from '(protected)/tools/fitness/resistance-training/program/components/ExerciseList';
import SessionSummary from '(protected)/tools/fitness/resistance-training/program/components/SessionSummary';
import AddExerciseModal from '(protected)/tools/fitness/resistance-training/program/modals/AddExerciseModal';
import DayTabs from '(protected)/tools/fitness/resistance-training/program/components/DayTabs';
import { ExerciseLibraryItem, ProgramExercisesPlanned } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import type { FitnessSettings } from 'lib/types/userSettings.zod';
import { generateProgressedWeeks } from '(protected)/tools/fitness/lib/calculations/resistanceTrainingCalculations';
import { saveResistanceProgram } from '(protected)/tools/fitness/resistance-training/lib/actions/saveResistanceProgram';
import { updateResistanceProgram } from '(protected)/tools/fitness/resistance-training/lib/actions/updateResistanceProgram';
import { saveResistanceTemplate } from '(protected)/tools/fitness/resistance-training/lib/actions/saveResistanceTemplate';
import { updateResistanceSession } from '(protected)/tools/fitness/resistance-training/lib/actions/updateResistanceSession';
import { getResistanceProgram } from '(protected)/tools/fitness/resistance-training/lib/hooks/getResistanceProgram';
import { getUserExerciseLibrary } from '(protected)/tools/fitness/lib/hooks/getUserExerciseLibrary';
import { getExerciseLibrary } from '(protected)/tools/fitness/lib/hooks/getExerciseLibrary';
import { getCMEActivityLibrary } from '(protected)/tools/fitness/lib/hooks/getCMEActivityLibrary';
import { transformCMEActivitiesToExerciseLibrary } from '(protected)/tools/fitness/resistance-training/lib/actions/cmeTransformations';
import { clientLogger } from 'lib/logging/logger.client';
import { useToast } from 'lib/toast';

// Custom hook for exercise management
const useExerciseManager = (userId: number, initialExercises: ExerciseLibraryItem[]) => {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>(initialExercises);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);

  const fetchExercisesForUser = useCallback(async (targetUserId: number) => {
    setIsLoadingExercises(true);
    try {
      const [libraryExercises, userExercises, cmeActivities] = await Promise.all([
        getExerciseLibrary(),
        getUserExerciseLibrary(userId, targetUserId),
        getCMEActivityLibrary()
      ]);

      const transformedCMEActivities = transformCMEActivitiesToExerciseLibrary(cmeActivities);
      const allExercises = [...userExercises, ...libraryExercises, ...transformedCMEActivities];
      setExercises(allExercises);
    } catch (error) {
      clientLogger.error('Error fetching exercises for user:', error);
      setExercises(initialExercises);
    } finally {
      setIsLoadingExercises(false);
    }
  }, [userId, initialExercises]);

  const loadInitialExercises = useCallback(async () => {
    if (initialExercises.length > 0) {
      setExercises(initialExercises);
      return;
    }
    
    await fetchExercisesForUser(userId);
  }, [userId, initialExercises, fetchExercisesForUser]);

  // Load initial exercises on mount
  useEffect(() => {
    loadInitialExercises();
  }, [loadInitialExercises]);

  return {
    exercises,
    isLoadingExercises,
    fetchExercisesForUser
  };
};

export default function ResistanceTrainingClient({
  exercises: initialExercises,
  initialUserId,
  userId,
  fitnessSettings,
}: {
  exercises: ExerciseLibraryItem[];
  initialUserId: number;
  userId: number;
  fitnessSettings?: FitnessSettings;
}) {
  const toast = useToast();
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [programLength, setProgramLength] = useState(4);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(1);
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
  const [activeDay, setActiveDay] = useState(1);
  // Track which weeks have been manually edited (locked)
  const [lockedWeeks, setLockedWeeks] = useState<Set<number>>(new Set());
  // Track if we're in initial setup mode (ends when user makes changes to Day 2+)
  const [isInitialSetup, setIsInitialSetup] = useState(true);
  // Track manually edited exercises for granular control
  const [manuallyEditedExercises, setManuallyEditedExercises] = useState<{
    [weekIndex: number]: {
      [exerciseId: string]: {
        fields: Set<'load' | 'reps' | 'sets'>;
        lastEdited: Date;
      }
    }
  }>({});
  // Add state for programName (to be set from ProgramSettings)
  const [programName, setProgramName] = useState('');
  // Add state for phaseFocus, periodizationType, progressionRules, programDuration, notes
  const [phaseFocus, setPhaseFocus] = useState('');
  const [periodizationType, setPeriodizationType] = useState('None');
  const [progressionRulesState, setProgressionRulesState] = useState({});
  const [programDuration, setProgramDuration] = useState(programLength);
  const [notes, setNotes] = useState('');
  const [isLoadingProgram, setIsLoadingProgram] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  // Add mode state
  const [mode, setMode] = useState<'plan' | 'act'>('plan');
  // Add actuals state for SessionSummary - use programExercisesPlannedId as key to prevent data mixing
  const [actuals, setActuals] = useState<{ [programExercisesPlannedId: number]: { [setIdx: number]: { reps: string; load: string; duration?: string } } }>({});
  
  // Session editing state
  const [sessionEditMode, setSessionEditMode] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [updatedActuals, setUpdatedActuals] = useState<{ [programExercisesPlannedId: number]: { [setIdx: number]: { reps: string; load: string; duration?: string } } }>({});
  const [modifiedFields, setModifiedFields] = useState<{ [programExercisesPlannedId: number]: { [setIdx: number]: { reps: boolean; load: boolean; duration: boolean } } }>({});
  // Add admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  // Add state to track if current program is a template
  const [isTemplateProgram, setIsTemplateProgram] = useState(false);
  // Add tier continuum state for templates
  const [tierContinuumId, setTierContinuumId] = useState<number>(1);

  // Use the custom hook for exercise management
  const { exercises, isLoadingExercises, fetchExercisesForUser } = useExerciseManager(userId, initialExercises);

  // Track progression changes to unlock all weeks when progression settings change
  const [lastProgressionSettings, setLastProgressionSettings] = useState(progressionSettings);
  const progressionChanged = useMemo(() => {
    return JSON.stringify(progressionSettings) !== JSON.stringify(lastProgressionSettings);
  }, [progressionSettings, lastProgressionSettings]);

  // Update programDuration when programLength changes
  useEffect(() => {
    setProgramDuration(programLength);
  }, [programLength]);

  // Update weeklyExercises array when programLength changes
  useEffect(() => {
    setWeeklyExercises(prev => {
      const newArray = Array.from({ length: programLength }, (_, i) => {
        if (i < prev.length) {
          return prev[i]; // Keep existing week data
        } else {
          // New weeks - apply progression if available
          if (progressionSettings.type !== 'None' && baseWeekExercises.length > 0) {
            const progressedWeeks = generateProgressedWeeks(baseWeekExercises, programLength, progressionSettings);
            return progressedWeeks[i + 1] || [];
          } else {
            return []; // Add empty arrays for new weeks
          }
        }
      });
      return newArray;
    });
  }, [programLength, progressionSettings, baseWeekExercises]);

  // Handle progression settings changes - only unlock weeks, don't recalculate existing data
  useEffect(() => {
    if (progressionChanged && progressionSettings.type !== 'None' && baseWeekExercises.length > 0) {
      // Unlock all weeks when progression changes
      setLockedWeeks(new Set());
      setManuallyEditedExercises({});
      
      // Update last progression settings
      setLastProgressionSettings(progressionSettings);
      
      // Show user feedback
      toast.info('Progression settings updated - existing data preserved');
    }
  }, [progressionChanged, progressionSettings, baseWeekExercises, toast]);

  // Load program handler
  const handleLoadProgram = async (program: any) => {
    try {
      setIsLoadingProgram(true);
      // Use the program's actual userId instead of selectedUserId to handle templates correctly
      const { program: loadedProgram, exercises } = await getResistanceProgram(program.resistanceProgramId, program.userId);
      
      // Type assertion for exercises with programInstance
      const exercisesWithWeek = exercises as (ProgramExercisesPlanned & { programInstance?: number })[];
      
      // Update program settings
      setProgramName(loadedProgram.programName);
      setPhaseFocus(loadedProgram.phaseFocus || '');
      setPeriodizationType(loadedProgram.periodizationType || 'None');
      const loadedProgressionRules = loadedProgram.progressionRules || {
        type: 'None',
        settings: {
          volume_increment_percentage: 0,
          load_increment_percentage: 0,
          weekly_volume_percentages: [100, 100, 100, 100],
        },
      };
      setProgressionSettings(loadedProgressionRules);
      setLastProgressionSettings(loadedProgressionRules);
      setProgramDuration(loadedProgram.programDuration || 4);
      setNotes(loadedProgram.notes || '');
      
      // Update template-related settings if this is a template
      if (loadedProgram.templateInfo) {
        setTierContinuumId(loadedProgram.templateInfo.tierContinuumId || 1);
        setSelectedCategories(loadedProgram.templateInfo.categories?.map(cat => cat.id) || []);
        setIsTemplateProgram(true);
      } else {
        setTierContinuumId(1);
        setSelectedCategories([]);
        setIsTemplateProgram(false);
      }
      
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
      setActiveDay(1);
      
      // Clear any locked weeks since we're loading a new program
      setLockedWeeks(new Set());
      setManuallyEditedExercises({});
      setIsInitialSetup(false); // Loaded program is not initial setup
      
      // Set the program ID we're editing
      setEditingProgramId(loadedProgram.resistanceProgramId);
      
      clientLogger.info('Program loaded successfully:', { programName: loadedProgram.programName });
    } catch (error) {
      clientLogger.error('Error loading resistance training program', error);
      // You could add a toast notification here
    } finally {
      setIsLoadingProgram(false);
    }
  };

  // Add new exercise to specific week (or all weeks if no target week specified)
  const handleAddExercise = (exercise: ProgramExercisesPlanned, targetWeek?: number) => {
    if (targetWeek !== undefined) {
      // Add to specific week only
      setWeeklyExercises(prev =>
        prev.map((arr, idx) =>
          idx === targetWeek ? [...arr, exercise] : arr
        )
      );
    } else {
      // Add to all weeks (for initial program setup)
      setWeeklyExercises(prev => prev.map(arr => [...arr, exercise]));
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Add new exercise with progression applied to all weeks
  const handleAddExerciseWithProgression = (exercise: ProgramExercisesPlanned) => {
    if (progressionSettings.type === 'None') {
      // No progression - add to all weeks as-is
      handleAddExercise(exercise);
    } else {
      // Apply progression to the new exercise
      const progressedWeeks = generateProgressedWeeks([exercise], programLength, progressionSettings);
      
      setWeeklyExercises(prev =>
        prev.map((weekExercises, weekIndex) => [
          ...weekExercises,
          progressedWeeks[weekIndex + 1]?.[0] || exercise
        ])
      );
    }
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // Helper function to detect what fields were edited
  const detectEditedFields = (original: ProgramExercisesPlanned, edited: ProgramExercisesPlanned): Set<'load' | 'reps' | 'sets'> => {
    const editedFields = new Set<'load' | 'reps' | 'sets'>();
    
    const originalSets = original.plannedSets || [];
    const editedSets = edited.plannedSets || [];
    
    // Compare sets length
    if (originalSets.length !== editedSets.length) {
      editedFields.add('sets');
    }
    
    // Compare reps and load for each set
    originalSets.forEach((originalSet, index) => {
      const editedSet = editedSets[index];
      if (editedSet) {
        if (originalSet.reps !== editedSet.reps) {
          editedFields.add('reps');
        }
        if (originalSet.load !== editedSet.load) {
          editedFields.add('load');
        }
      }
    });
    
    return editedFields;
  };

  // Session editing functions
  const handleEditSession = () => {
    setSessionEditMode(true);
    setEditingSessionId(null);
    setUpdatedActuals({});
    setModifiedFields({});
  };

  const handleCancelSessionEdit = () => {
    setSessionEditMode(false);
    setEditingSessionId(null);
    setUpdatedActuals({});
    setModifiedFields({});
  };

  const handleEditExerciseSession = (exerciseId: number) => {
    setEditingSessionId(exerciseId);
  };

  const handleCancelExerciseEdit = () => {
    setEditingSessionId(null);
  };

  const handleSessionFieldChange = (exerciseId: number, setIdx: number, field: 'reps' | 'load' | 'duration', value: string) => {
    setUpdatedActuals(prev => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        [setIdx]: {
          ...(prev[exerciseId]?.[setIdx] || {}),
          [field]: value
        }
      }
    }));

    setModifiedFields(prev => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        [setIdx]: {
          ...(prev[exerciseId]?.[setIdx] || {}),
          [field]: true
        }
      }
    }));
  };

  const handleSaveSessionChanges = async () => {
    if (!editingProgramId) return;

    const exercisesToUpdate = Object.keys(updatedActuals).map(programExercisesPlannedId => {
      const exerciseId = parseInt(programExercisesPlannedId);
      const exercise = currentSessionExercises.find(ex => ex.programExercisesPlannedId === exerciseId);
      if (!exercise) return null;

      const updatedSets = (exercise.plannedSets || []).map((set, setIdx) => {
        const updatedData = updatedActuals[exerciseId]?.[setIdx] || {};
        const originalActualSet = exercise.actualSets?.[setIdx];
        return createSetObject(set, updatedData, originalActualSet);
      });

      return {
        programExercisesId: exerciseId,
        actualSets: updatedSets
      };
    }).filter((exercise): exercise is { programExercisesId: number; actualSets: any[] } => exercise !== null);

    if (exercisesToUpdate.length === 0) {
      handleCancelSessionEdit();
      return;
    }

    try {
      const result = await updateResistanceSession({
        userId: selectedUserId,
        resistanceProgramId: editingProgramId,
        exercises: exercisesToUpdate
      });

      if (result.success) {
        // Reload the program to get updated data
        const currentProgram = { resistanceProgramId: editingProgramId, userId: selectedUserId };
        await handleLoadProgram(currentProgram);
        handleCancelSessionEdit();
        toast.success('Session updated successfully!');
      } else {
        toast.error('Error updating session: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Error updating session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Helper function to create set object (copied from ExerciseList)
  const createSetObject = (set: any, actual: any, originalActualSet?: any) => {
    // Start with the original actual set data (if it exists) or the planned set data
    const result: any = originalActualSet ? { ...originalActualSet } : { ...set };
    
    // Ensure we have the set number
    result.set = set.set;
    
    // Update only the fields that were explicitly changed
    if (actual.reps !== undefined && actual.reps !== '') {
      result.reps = Number(actual.reps);
    } else if (actual.reps === '') {
      // If field was cleared, remove it from result
      delete result.reps;
    }
    
    if (actual.load !== undefined && actual.load !== '') {
      result.load = actual.load;
    } else if (actual.load === '') {
      delete result.load;
    }
    
    if (actual.duration !== undefined && actual.duration !== '') {
      result.duration = Number(actual.duration);
    } else if (actual.duration === '') {
      delete result.duration;
    }
    
    if (actual.distance !== undefined && actual.distance !== '') {
      result.distance = Number(actual.distance);
    } else if (actual.distance === '') {
      delete result.distance;
    }
    
    if (actual.rest !== undefined && actual.rest !== '') {
      result.restSec = Number(actual.rest);
    } else if (actual.rest === '') {
      delete result.restSec;
    }
    
    if (actual.rpe !== undefined && actual.rpe !== '') {
      result.rpe = Number(actual.rpe);
    } else if (actual.rpe === '') {
      delete result.rpe;
    }
    
    if (actual.rir !== undefined && actual.rir !== '') {
      result.rir = Number(actual.rir);
    } else if (actual.rir === '') {
      delete result.rir;
    }
    
    return result;
  };

  // Open edit modal for existing exercise
  const handleEditExercise = (programExercisesId: number) => {
    const currentWeek = Math.ceil(activeDay / sessionsPerWeek);
    
    const exerciseToEdit = weeklyExercises[currentWeek - 1].find(ex => 
      ex.programExercisesPlannedId === programExercisesId
    );
    
    if (exerciseToEdit) {
      setEditingExercise(exerciseToEdit);
      setIsModalOpen(true);
    }
  };



  // Delete exercise from current week only
  const handleDeleteExercise = (programExercisesId: number) => {
    const currentWeek = Math.ceil(activeDay / sessionsPerWeek);
    
    setWeeklyExercises(prev =>
      prev.map((weekExercises, idx) =>
        idx === currentWeek - 1  // Only affect current week
          ? weekExercises.filter(ex => ex.programExercisesPlannedId !== programExercisesId)
          : weekExercises  // Other weeks remain unchanged
      )
    );
    
    // Only update baseWeekExercises if we're deleting from Week 1
    if (currentWeek === 1 && baseWeekExercises.length > 0) {
      setBaseWeekExercises(prev => prev.filter(ex => 
        ex.programExercisesPlannedId !== programExercisesId
      ));
    }
  };

  // Helper to filter exercises for Plan mode (only exercises with plannedSets data)
  const getPlanExercises = (exercises: ProgramExercisesPlanned[]) => {
    return exercises.filter(exercise => 
      exercise.plannedSets && Array.isArray(exercise.plannedSets) && exercise.plannedSets.length > 0
    );
  };

  // Helper to filter exercises for Act mode (exercises with plannedSets data OR exercises with only actualSets data)
  const getActExercises = (exercises: ProgramExercisesPlanned[]) => {
    return exercises.filter(exercise => {
      // Include exercises with planned data (so users can add actuals)
      const hasPlannedData = exercise.plannedSets && Array.isArray(exercise.plannedSets) && exercise.plannedSets.length > 0;
      // Include Act-only exercises (no planned data but has actual data)
      const isActOnly = (!exercise.plannedSets || !Array.isArray(exercise.plannedSets) || exercise.plannedSets.length === 0) &&
                       exercise.actualSets && Array.isArray(exercise.actualSets) && exercise.actualSets.length > 0;
      
      return hasPlannedData || isActOnly;
    });
  };

  // Save exercise (add new or update existing)
  const handleSaveExercise = (exercise: ProgramExercisesPlanned) => {
    const currentWeek = Math.ceil(activeDay / sessionsPerWeek);
    const weekIndex = currentWeek - 1;
    
    if (editingExercise) {
      // Track what fields were manually edited
      const editedFields = detectEditedFields(editingExercise, exercise);
      
      setWeeklyExercises(prev =>
        prev.map((arr, idx) =>
          idx === weekIndex
            ? arr.map(ex => 
                ex.programExercisesPlannedId === editingExercise.programExercisesPlannedId ? exercise : ex
              )
            : arr
        )
      );
      
      // Mark week as locked and track specific edits
      if (currentWeek !== 1) {
        setLockedWeeks(prev => new Set(prev).add(weekIndex));
        setManuallyEditedExercises(prev => ({
          ...prev,
          [weekIndex]: {
            ...prev[weekIndex],
            [exercise.programExercisesPlannedId]: {
              fields: editedFields,
              lastEdited: new Date()
            }
          }
        }));
        // End initial setup mode when user edits Day 2+
        if (isInitialSetup) {
          setIsInitialSetup(false);
        }
      }
    } else {
      // Add logic
      if (isInitialSetup && currentWeek === 1) {
        // Initial setup: add to all weeks with progression applied
        handleAddExerciseWithProgression(exercise);
      } else {
        // Week-specific: add only to current week
        handleAddExercise(exercise, weekIndex);
        if (currentWeek !== 1) {
          setLockedWeeks(prev => new Set(prev).add(weekIndex));
          // End initial setup mode when user adds to Day 2+
          if (isInitialSetup) {
            setIsInitialSetup(false);
          }
        }
      }
    }
    
    setEditingExercise(null);
    setIsModalOpen(false);
  };

  // Filter exercises based on mode and data availability


  // Save handler
  const handleSaveProgram = async () => {
    if (!programName.trim()) {
      toast.warning('Please enter a Program Name before saving.');
      // Focus the program name input on mobile
      const programNameInput = document.getElementById('program-name-input');
      if (programNameInput) {
        programNameInput.focus();
        programNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Show loading state
    const saveButton = document.querySelector('[data-save-button]');
    if (saveButton) {
      saveButton.textContent = 'Saving...';
      saveButton.setAttribute('disabled', 'true');
    }
    
    try {
      let result;
      
      if (editingProgramId && !isTemplateProgram) {
        // Update existing program (only if it's not a template)
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
        // Create new program (either new program or template-based program)
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
        toast.success(editingProgramId && !isTemplateProgram ? 'Program updated successfully!' : 'Program saved successfully!');
        // Update editingProgramId if this was a new program or template-based program
        if ((!editingProgramId || isTemplateProgram) && result.programId) {
          setEditingProgramId(result.programId);
          setIsTemplateProgram(false); // No longer a template program after saving
        }
      } else {
        toast.error('Error saving program: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      clientLogger.error('Save error:', error);
      toast.error('Error saving program: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Reset button state
      if (saveButton) {
        saveButton.textContent = (editingProgramId && !isTemplateProgram) ? 'Update Program' : 'Save Program';
        saveButton.removeAttribute('disabled');
      }
    }
  };

  // Save template handler
  const handleSaveTemplate = async () => {
    if (!programName.trim()) {
      toast.warning('Please enter a Program Name before saving as template.');
      const programNameInput = document.getElementById('program-name-input');
      if (programNameInput) {
        programNameInput.focus();
        programNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (!weeklyExercises.some(week => week.length > 0)) {
      toast.warning('Please add at least one exercise before saving as template.');
      return;
    }
    

    
    // Show loading state
    const templateButton = document.querySelector('[data-template-button]');
    if (templateButton) {
      templateButton.textContent = 'Saving Template...';
      templateButton.setAttribute('disabled', 'true');
    }
    
    try {
      // First, save the program to User ID 1 (Higher Endeavors)
      const programResult = await saveResistanceProgram({
        userId: 1, // Save to Higher Endeavors user
        programName,
        phaseFocus,
        periodizationType,
        progressionRules: progressionSettings,
        notes,
        weeklyExercises,
        programDuration,
      });

      if (!programResult.success) {
        toast.error('Error saving program: ' + (programResult.error || 'Unknown error'));
        return;
      }

      // Then create the template using the newly saved program
      const result = await saveResistanceTemplate({
        userId: selectedUserId,
        templateName: programName,
        phaseFocus,
        periodizationType,
        progressionRules: progressionSettings,
        tierContinuumId: tierContinuumId,
        notes,
        selectedCategories,
        weeklyExercises,
        programId: programResult.programId
      });
      
      if (result.success) {
        toast.success('Template saved successfully!');
      } else {
        toast.error('Error saving template: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      clientLogger.error('Template save error:', error);
      toast.error('Error saving template: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Reset button state
      if (templateButton) {
        templateButton.textContent = 'Save Template';
        templateButton.removeAttribute('disabled');
      }
    }
  };

  // Pass progression settings and program length to ProgramSettings
  // ProgramSettings should call setProgramLength and setProgressionSettings on change

  // Determine if the current session is completed
  const currentSessionIdx = Math.ceil(activeDay / sessionsPerWeek) - 1;
  const currentSessionExercises = weeklyExercises[currentSessionIdx] || [];
  const sessionCompleted = currentSessionExercises.some(ex => Array.isArray((ex as any).actualSets) && (ex as any).actualSets.length > 0 && (ex as any).actualSets.some((set: any) => set && (set.reps !== undefined || set.load !== undefined)));

  // If completed, build actuals from actualSets; else use local actuals
  let actualsForSession: { [programExercisesPlannedId: number]: { [setIdx: number]: { reps: string; load: string; duration?: string } } } = {};
  if (sessionCompleted) {
    actualsForSession = {};
    currentSessionExercises.forEach((ex) => {
      const actualSets = (ex as any).actualSets || [];
      actualsForSession[ex.programExercisesPlannedId] = {};
      (ex.plannedSets || []).forEach((set, setIdx) => {
        const actual = actualSets[setIdx] || {};
        actualsForSession[ex.programExercisesPlannedId][setIdx] = {
          reps: actual.reps !== undefined && actual.reps !== null ? String(actual.reps) : '',
          load: actual.load !== undefined && actual.load !== null ? String(actual.load) : '',
          duration: actual.duration !== undefined && actual.duration !== null ? String(actual.duration) : '',
        };
      });
    });
  } else {
    actualsForSession = actuals;
  }

  return (
    <>
      <div className="max-w-md">
        <UserSelector
          onUserSelect={userId => {
            if (userId !== null && userId !== selectedUserId) {
              setSelectedUserId(userId);
              // Fetch exercises for the new user
              fetchExercisesForUser(userId);
              // Clear program state when switching users
              setEditingProgramId(null);
              setProgramName('');
              setPhaseFocus('');
              setPeriodizationType('None');
              setProgressionRulesState({});
              setProgramDuration(4);
              setNotes('');
              setWeeklyExercises([[]]);
              setBaseWeekExercises([]);
              setActiveDay(1);
              setLockedWeeks(new Set());
              setManuallyEditedExercises({});
              setIsInitialSetup(true); // Reset to initial setup mode
              setIsTemplateProgram(false);
            }
          }}
          currentUserId={selectedUserId}
          showAdminFeatures={true}
          onAdminStatusChange={setIsAdmin}
        />
      </div>
      <ProgramBrowser 
        currentUserId={selectedUserId}
        onProgramSelect={handleLoadProgram}
        onProgramDelete={(programId) => {
          // TODO: Handle program deletion
          clientLogger.info('Program deleted:', { programId });
        }}
        newProgramHandler={() => {
          setEditingProgramId(null);
          setProgramName('');
          setPhaseFocus('');
          setPeriodizationType('None');
          setProgressionRulesState({});
          setProgramDuration(4);
          setNotes('');
          setDifficultyLevel('');
          setSelectedCategories([]);
          setTierContinuumId(1); // Reset to Healthy tier
          setWeeklyExercises([[]]);
          setBaseWeekExercises([]);
          setActiveDay(1);
          setLockedWeeks(new Set());
          setManuallyEditedExercises({});
          setIsInitialSetup(true); // Reset to initial setup mode
          setIsTemplateProgram(false); // Reset template state
        }}
        isProgramLoaded={!!editingProgramId}
      />
      <ProgramSettings
        key={`${editingProgramId}-${programLength}-${sessionsPerWeek}-${JSON.stringify(progressionSettings)}`}
        programLength={programLength}
        setProgramLength={setProgramLength}
        sessionsPerWeek={sessionsPerWeek}
        setSessionsPerWeek={setSessionsPerWeek}
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
        tierContinuumId={tierContinuumId}
        setTierContinuumId={setTierContinuumId}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        isAdmin={isAdmin}
        isLoading={isLoadingProgram}
        isTemplateProgram={isTemplateProgram}
      />
      <DayTabs
        activeDay={activeDay}
        programLength={programLength}
        sessionsPerWeek={sessionsPerWeek}
        onDayChange={setActiveDay}
      />
      <ExerciseList
        exercises={exercises}
        isLoading={isLoadingExercises}
        userId={selectedUserId}
        plannedExercises={
          mode === 'plan' 
            ? getPlanExercises(weeklyExercises[Math.ceil(activeDay / sessionsPerWeek) - 1] || [])
            : getActExercises(weeklyExercises[Math.ceil(activeDay / sessionsPerWeek) - 1] || [])
        }
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
        activeWeek={Math.ceil(activeDay / sessionsPerWeek)}
        mode={mode}
        setMode={setMode}
        resistanceProgramId={editingProgramId ?? undefined}
        actuals={actualsForSession}
        onActualsChange={setActuals}
        sessionCompleted={sessionCompleted}
        // Session editing props
        sessionEditMode={sessionEditMode}
        editingSessionId={editingSessionId}
        updatedActuals={updatedActuals}
        modifiedFields={modifiedFields}
        onEditSession={handleEditSession}
        onCancelSessionEdit={handleCancelSessionEdit}
        onEditExerciseSession={handleEditExerciseSession}
        onCancelExerciseEdit={handleCancelExerciseEdit}
        onSessionFieldChange={handleSessionFieldChange}
        onSaveSessionChanges={handleSaveSessionChanges}
      />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4 touch-manipulation">
        <div className="flex flex-col sm:flex-row gap-2">
          {!sessionCompleted && (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              style={{ minHeight: '44px' }}
              onClick={() => {
                setEditingExercise(null);
                setIsModalOpen(true);
              }}
              onTouchStart={(e) => e.preventDefault()}
            >
              Add Exercise
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {weeklyExercises.some(week => week.length > 0) && mode === 'plan' && (
            <button
              data-save-button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto touch-manipulation"
              style={{ minWidth: '120px', minHeight: '44px' }}
              onClick={handleSaveProgram}
              onTouchStart={(e) => e.preventDefault()}
            >
              {(editingProgramId && !isTemplateProgram) ? 'Update Program' : 'Save Program'}
            </button>
          )}
          {isAdmin && weeklyExercises.some(week => week.length > 0) && mode === 'plan' && (
            <button
              data-template-button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto touch-manipulation"
              style={{ minWidth: '120px', minHeight: '44px' }}
              onClick={handleSaveTemplate}
              onTouchStart={(e) => e.preventDefault()}
            >
              Save Template
            </button>
          )}
        </div>
      </div>


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
      {weeklyExercises[Math.ceil(activeDay / sessionsPerWeek) - 1]?.length > 0 && (
        <div className="mt-6">
          <SessionSummary 
            exercises={weeklyExercises[Math.ceil(activeDay / sessionsPerWeek) - 1]} 
            preferredLoadUnit={(fitnessSettings?.resistanceTraining?.loadUnit === 'kg' ? 'kg' : 'lbs')}
            mode={mode}
            actuals={currentSessionExercises.map((exercise) =>
              (exercise.plannedSets || []).map((set, setIdx) => {
                const actual = actualsForSession[exercise.programExercisesPlannedId]?.[setIdx] || {};
                return {
                  reps: actual.reps === undefined || actual.reps === '' ? null : Number(actual.reps),
                  load: actual.load === undefined || actual.load === '' ? null : actual.load
                };
              })
            )}

          />
        </div>
      )}
    </>
  );
} 