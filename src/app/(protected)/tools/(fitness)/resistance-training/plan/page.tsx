'use client';

import React from 'react';
import AddExerciseModal from './ExerciseModals/AddExerciseModal';
import ExerciseSearch from './ExerciseModals/ExerciseSearch';
import WeekProgram from './components/ProgramContainer/WeekProgram';
import { calculateSessionVolume } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { Exercise } from '@/app/lib/types/pillars/fitness';
import { useToast } from '@/app/lib/hooks/useToast';
import ProgramHeader from './components/ProgramContainer/ProgramHeader';
import ProgramSettingsSection from './components/ProgramContainer/ProgramSettingsSection';
import WeekTabs from './components/ExerciseManagement/WeekTabs';
import { useUserManagement } from './hooks/useUserManagement';
import { useProgramState } from './hooks/useProgramState';
import { useExerciseLibrary } from './hooks/useExerciseLibrary';
import { useExerciseModal } from './hooks/useExerciseModal';
import { useExerciseManagement } from './hooks/useExerciseManagement';
import { useProgramSettings } from './hooks/useProgramSettings';
import { useProgramSave } from './hooks/useProgramSave';
import { useProgramManagement } from './hooks/useProgramManagement';
import { useWeekManagement } from './hooks/useWeekManagement';
import { useWeekExerciseManagement } from './hooks/useWeekExerciseManagement';

function PlanPageContent() {
  const { exerciseLibrary, setExerciseLibrary } = useExerciseLibrary({
    onError: (error) => toast.error(error.message)
  });
  
  const { 
    program, 
    setProgram, 
    weekExercises, 
    setWeekExercises, 
    activeWeek,
    setActiveWeek 
  } = useProgramState(); // This now includes the program length effect

  const { 
    isExerciseModalOpen, setIsExerciseModalOpen,
    isExerciseSearchOpen, setIsExerciseSearchOpen,
    isAdvancedSearchOpen, setIsAdvancedSearchOpen,
    editingExercise, setEditingExercise,
    selectedExerciseName, setSelectedExerciseName,
    selectedExercise, setSelectedExercise
  } = useExerciseModal();

  const toast = useToast();

  const { 
    session, 
    userSettings, 
    settingsLoading, 
    isAdmin, 
    selectedUserId, 
    setSelectedUserId,
    handleUserSelect // Now comes from useUserManagement
  } = useUserManagement();

  const { 
    handleAddExercise, 
    handleExerciseSelect,
    handleAdvancedSearchSelect,
    handleEditExercise,
    handleSaveExercise,
    handleDeleteExercise
  } = useExerciseManagement(
    userSettings,
    program,
    { setIsExerciseModalOpen, setIsAdvancedSearchOpen },
    { weekExercises, activeWeek, setWeekExercises }
  );

  const { handleSettingsChange } = useProgramSettings(program, setProgram);

  const { handleSave, isSaving } = useProgramSave({
    program,
    weekExercises,
    selectedUserId,
    sessionUserId: session?.user?.id ?? null,
    setProgram,
    onSuccess: () => {
      toast.success('Program saved successfully');
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : 0;

  const { 
    handleProgramSelect, 
    loadProgramExercises, 
    handleProgramDelete,
    handleProgramUpdate
  } = useProgramManagement({ 
    setProgram, 
    setWeekExercises, 
    currentUserId,
    onError: (error) => {
      toast.error(error);
    }
  });

  const { handleWeekChange, applyProgressionToWeek } = useWeekManagement({
    program,
    activeWeek,
    setActiveWeek,
    setWeekExercises
  });

  const { handleWeekExercisesChange } = useWeekExerciseManagement({
    program,
    activeWeek,
    setWeekExercises
  });

  // DND functionality to be implemented later
  // const { sensors, handleDragStart, handleDragEnd } = useDragAndDrop();


  // Volume targets management - commented out for now
  /*const handleVolumeTargetsChange = (targets: VolumeTarget[]) => {
    setProgram(prev => ({
      ...prev,
      volumeTargets: targets
    }));
  };*/

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resistance Training Program Planning</h1>

      <ProgramHeader
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        onProgramSelect={handleProgramSelect}
        onProgramDelete={handleProgramDelete}
      />

      <ProgramSettingsSection
        name={program.programName}
        phaseFocus={program.phaseFocus}
        periodizationType={program.periodizationType}
        progressionRules={program.progressionRules}
        onSettingsChange={handleSettingsChange}
      />
      {/* Volume Targets - commented out for now */}
      {/*<div className="mb-6">
        <VolumeTargets
          targets={program.volumeTargets}
          onChange={handleVolumeTargetsChange}
        />
      </div>*/}

      {/* Week Tabs */}
      <WeekTabs
        activeWeek={activeWeek}
        programLength={program?.progressionRules?.settings?.programLength || 4}
        onWeekChange={handleWeekChange}
      />

      {/* Exercises Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-slate-900">Week {activeWeek} Exercises</h2>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleAddExercise}
          >
            Add Exercise
          </button>
        </div>

        <WeekProgram
          weekNumber={activeWeek}
          exercises={weekExercises[activeWeek] || []}
          onExercisesChange={handleWeekExercisesChange}
          onEdit={handleEditExercise}
          onDelete={handleDeleteExercise}
        />

        {/* Volume Summary */}
        {weekExercises[activeWeek]?.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 dark:text-slate-900">Session Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(calculateSessionVolume(
                weekExercises[activeWeek] || [],
                userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs'
              )).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-600">
                    {key === 'totalLoad' 
                      ? `Total Load: ${value} ${userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs'}`
                      : key === 'totalSets'
                      ? `Total Sets: ${value}`
                      : key === 'totalReps'
                      ? `Total Reps: ${value}`
                      : `${key}: ${value}`
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button - Positioned below ExerciseList block */}
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all
            ${isSaving 
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'
            }
          `}
        >
          {isSaving ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Program...
            </div>
          ) : (
            'Save Program'
          )}
        </button>
      </div>

      {/* Exercise Modals */}
      <AddExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        exercise={editingExercise}
        exercises={weekExercises[activeWeek] || []}
        onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
        selectedExerciseName={selectedExerciseName}
        userSettings={userSettings ?? undefined}
        exerciseLibrary={exerciseLibrary}
      />

      <ExerciseSearch
        isOpen={isExerciseSearchOpen || isAdvancedSearchOpen}
        onClose={() => {
          setIsExerciseSearchOpen(false);
          setIsAdvancedSearchOpen(false);
        }}
        onSelect={handleAdvancedSearchSelect}
      />
    </div>
  );
}

export default PlanPageContent;