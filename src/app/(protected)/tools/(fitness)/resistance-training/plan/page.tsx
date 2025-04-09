'use client';

import React from 'react';
import AddExerciseModal from './ExerciseModals/AddExerciseModal';
import ExerciseSearch from './ExerciseModals/ExerciseSearch';
import WeekProgram from './components/ProgramManagement/WeekProgram';
import { calculate_session_volume } from '@/app/lib/utils/fitness/resistance-training/calculations';
import { exercise, PeriodizationType, PhaseFocus, progression_rules } from '@/app/lib/types/pillars/fitness';
import { useToast } from '@/app/lib/hooks/useToast';
import ProgramHeader from './components/ProgramManagement/ProgramHeader';
import ProgramSettingsSection from './components/ProgramManagement/ProgramSettingsSection';
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
  } = useProgramState();

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
    selected_user_id, 
    setSelectedUserId,
    handleUserSelect,
    current_user_id
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
    selectedUserId: selected_user_id,
    sessionUserId: current_user_id,
    setProgram,
    onSuccess: () => {
      toast.success('Program saved successfully');
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const { 
    handleProgramSelect, 
    loadProgramExercises, 
    handleProgramDelete,
    handleProgramUpdate
  } = useProgramManagement({ 
    setProgram, 
    setWeekExercises, 
    currentUserId: current_user_id,
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
        currentUserId={current_user_id}
        selectedUserId={selected_user_id}
        onUserSelect={handleUserSelect}
        onProgramSelect={handleProgramSelect}
        onProgramDelete={handleProgramDelete}
      />

      <ProgramSettingsSection
        name={program.program_name}
        phase_focus={program.phase_focus as keyof typeof PhaseFocus}
        periodization_type={program.periodization_type as keyof typeof PeriodizationType}
        progression_rules={program.progression_rules as progression_rules}
        onSettingsChange={handleSettingsChange}
      />

{/* Volume Targets - commented out for now */}
      {/*<div className="mb-6">
        <VolumeTargets
          targets={program.volumeTargets}
          onChange={handleVolumeTargetsChange}
        />
      </div>*/}
      <WeekTabs
        activeWeek={activeWeek}
        programLength={program?.progression_rules?.settings?.program_length || 4}
        onWeekChange={handleWeekChange}
      />

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
          week_number={activeWeek}
          exercises={weekExercises[activeWeek] || []}
          onExercisesChange={handleWeekExercisesChange}
          onEdit={handleEditExercise}
          onDelete={handleDeleteExercise}
        />

        {weekExercises[activeWeek]?.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 dark:text-slate-900">Session Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(calculate_session_volume(
                weekExercises[activeWeek] || [],
                userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs'
              )).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-600">
                    {key === 'total_load' 
                      ? `Total Load: ${value} ${userSettings?.pillar_settings?.fitness?.resistanceTraining?.loadUnit || 'lbs'}`
                      : key === 'total_sets'
                      ? `Total Sets: ${value}`
                      : key === 'total_reps'
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